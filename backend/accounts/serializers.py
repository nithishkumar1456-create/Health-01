from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import DoctorProfile

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['role'] = user.role
        
        is_verified = False
        if user.role == 'doctor':
            if hasattr(user, 'doctor_profile'):
                is_verified = user.doctor_profile.is_verified
        token['is_verified'] = is_verified
        
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # We can also add extra fields in the JSON response if desired
        data['role'] = self.user.role
        is_verified = False
        if self.user.role == 'doctor' and hasattr(self.user, 'doctor_profile'):
            is_verified = self.user.doctor_profile.is_verified
        data['is_verified'] = is_verified
        return data


class DoctorProfileSerializer(serializers.ModelSerializer):
    verified_by_username = serializers.ReadOnlyField(source='verified_by.username')

    class ModelSerializer:
        model = DoctorProfile
        fields = ['specialization', 'registration_number', 'is_verified', 'verified_by', 'verified_by_username', 'verified_at']

    class Meta:
        model = DoctorProfile
        fields = ['specialization', 'registration_number', 'is_verified', 'verified_by', 'verified_by_username', 'verified_at']
        read_only_fields = ['is_verified', 'verified_by', 'verified_at']


class UserSerializer(serializers.ModelSerializer):
    doctor_profile = DoctorProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone', 'first_name', 'last_name', 'doctor_profile']
        read_only_fields = ['role']


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    specialization = serializers.CharField(required=False, allow_blank=True, write_only=True)
    registration_number = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'phone', 'specialization', 'registration_number']

    def validate(self, attrs):
        role = attrs.get('role', User.CLIENT)
        if role == User.ADMIN:
            raise serializers.ValidationError({"role": "Cannot register as admin using public endpoint."})
        
        if role not in [User.CLIENT, User.DOCTOR]:
            raise serializers.ValidationError({"role": f"Invalid role: {role}."})
        
        if role == User.DOCTOR:
            reg_num = attrs.get('registration_number', '').strip()
            if not reg_num:
                raise serializers.ValidationError({"registration_number": "Registration number is required for doctor role."})
                
        return attrs

    def create(self, validated_data):
        role = validated_data.get('role', User.CLIENT)
        specialization = validated_data.pop('specialization', '')
        registration_number = validated_data.pop('registration_number', '')
        password = validated_data.pop('password')
        
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        if role == User.DOCTOR:
            DoctorProfile.objects.create(
                user=user,
                specialization=specialization,
                registration_number=registration_number,
                is_verified=False
            )
            
        return user


class ProfileUpdateSerializer(serializers.ModelSerializer):
    specialization = serializers.CharField(required=False, allow_blank=True)
    registration_number = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['phone', 'specialization', 'registration_number']

    def update(self, instance, validated_data):
        if 'phone' in validated_data:
            instance.phone = validated_data['phone']
        instance.save()

        if instance.role == User.DOCTOR and hasattr(instance, 'doctor_profile'):
            profile = instance.doctor_profile
            if 'specialization' in validated_data:
                profile.specialization = validated_data['specialization']
            if 'registration_number' in validated_data:
                profile.registration_number = validated_data['registration_number']
            profile.save()

        return instance

