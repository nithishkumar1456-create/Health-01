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
        data['role'] = self.user.role
        is_verified = False
        if self.user.role == 'doctor' and hasattr(self.user, 'doctor_profile'):
            is_verified = self.user.doctor_profile.is_verified
        data['is_verified'] = is_verified
        return data


class DoctorProfileSerializer(serializers.ModelSerializer):
    verified_by_username = serializers.ReadOnlyField(source='verified_by.username')

    class Meta:
        model = DoctorProfile
        fields = [
            'specialization', 'registration_number', 'is_verified',
            'verified_by', 'verified_by_username', 'verified_at',
            'education', 'title', 'clinic_timings', 'bio', 'profile_detail',
            'verification_requested', 'license_file_url'
        ]
        read_only_fields = ['is_verified', 'verified_by', 'verified_at']


class UserSerializer(serializers.ModelSerializer):
    doctor_profile = DoctorProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'phone',
            'first_name', 'last_name', 'avatar_url', 'doctor_profile'
        ]
        read_only_fields = ['role']


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    specialization = serializers.CharField(required=False, allow_blank=True, write_only=True)
    registration_number = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'phone', 'first_name', 'last_name', 'specialization', 'registration_number']

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
    # User-level fields
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    avatar_url = serializers.URLField(required=False, allow_blank=True, allow_null=True)

    # Doctor profile fields (written-through)
    specialization = serializers.CharField(required=False, allow_blank=True, write_only=True)
    registration_number = serializers.CharField(required=False, allow_blank=True, write_only=True)
    education = serializers.CharField(required=False, allow_blank=True, write_only=True)
    title = serializers.CharField(required=False, allow_blank=True, write_only=True)
    clinic_timings = serializers.CharField(required=False, allow_blank=True, write_only=True)
    bio = serializers.CharField(required=False, allow_blank=True, write_only=True)
    profile_detail = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone', 'avatar_url',
            'specialization', 'registration_number',
            'education', 'title', 'clinic_timings', 'bio', 'profile_detail'
        ]

    def update(self, instance, validated_data):
        # Extract doctor-specific fields
        doctor_fields = {
            key: validated_data.pop(key)
            for key in ['specialization', 'registration_number', 'education', 'title', 'clinic_timings', 'bio', 'profile_detail']
            if key in validated_data
        }

        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update DoctorProfile if user is a doctor
        if instance.role == User.DOCTOR:
            profile, _ = DoctorProfile.objects.get_or_create(user=instance, defaults={'registration_number': 'REG-PENDING'})
            for attr, value in doctor_fields.items():
                setattr(profile, attr, value)
            profile.save()

        return instance


class AdminCreateUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    specialization = serializers.CharField(required=False, allow_blank=True, write_only=True)
    registration_number = serializers.CharField(required=False, allow_blank=True, write_only=True)
    qualifications = serializers.CharField(required=False, allow_blank=True, write_only=True)
    medical_council = serializers.CharField(required=False, allow_blank=True, write_only=True)
    clinic_name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    consultation_fee = serializers.CharField(required=False, allow_blank=True, write_only=True)
    is_verified = serializers.BooleanField(required=False, default=True, write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'role', 'phone', 'first_name', 'last_name',
            'specialization', 'registration_number', 'qualifications', 'medical_council',
            'clinic_name', 'consultation_fee', 'is_verified'
        ]

    def validate(self, attrs):
        username = attrs.get('username', '').strip()
        email = attrs.get('email', '').strip()

        if not username:
            first_name = attrs.get('first_name', '').lower().strip()
            last_name = attrs.get('last_name', '').lower().strip()
            base = f"{first_name}_{last_name}".strip('_') or 'doctor'
            base = "".join(c for c in base if c.isalnum() or c == '_')
            candidate = base
            counter = 1
            while User.objects.filter(username=candidate).exists():
                candidate = f"{base}_{counter}"
                counter += 1
            attrs['username'] = candidate
        else:
            clean_username = username.lower().replace(' ', '_')
            clean_username = "".join(c for c in clean_username if c.isalnum() or c in ['_', '.', '@', '+', '-'])
            if User.objects.filter(username=clean_username).exists():
                raise serializers.ValidationError({"username": f"User with username '{clean_username}' already exists."})
            attrs['username'] = clean_username

        if email and User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": f"User with email '{email}' already exists."})

        return attrs

    def create(self, validated_data):
        import secrets
        role = validated_data.get('role', User.CLIENT)
        specialization = validated_data.pop('specialization', '')
        registration_number = validated_data.pop('registration_number', '')
        qualifications = validated_data.pop('qualifications', 'MBBS, MD')
        medical_council = validated_data.pop('medical_council', '')
        clinic_name = validated_data.pop('clinic_name', '')
        consultation_fee = validated_data.pop('consultation_fee', '')
        is_verified = validated_data.pop('is_verified', True)
        password = validated_data.pop('password', None)
        if not password:
            password = secrets.token_urlsafe(12)
        
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        if role == User.DOCTOR:
            DoctorProfile.objects.create(
                user=user,
                specialization=specialization or 'General Medicine',
                registration_number=registration_number or f'REG-{user.id}-CREATED',
                education=qualifications or 'MBBS, MD',
                title=f"Consultant ({specialization})" if specialization else "Consultant Practitioner",
                clinic_timings="09:00 AM - 01:00 PM, 04:30 PM - 08:00 PM (Mon-Sat)",
                bio=f"{qualifications} specialist in {specialization}. Council: {medical_council}.",
                is_verified=is_verified
            )
            
            # Create corresponding directory listing in Doctor model
            try:
                from doctors.models import Doctor
                full_name = f"Dr. {user.first_name} {user.last_name}".strip()
                if full_name == "Dr.":
                    full_name = f"Dr. {user.username}"
                
                Doctor.objects.create(
                    name=full_name,
                    specialization=specialization or 'General Medicine',
                    phone=user.phone or '+91 98765 43210',
                    address=clinic_name or 'Medical Health Center, New Delhi',
                    facility_type='clinic',
                    latitude=28.6139,
                    longitude=77.2090,
                    source='self_registered',
                    status='verified' if is_verified else 'unverified',
                    claimed_by=user,
                    education=qualifications or 'MBBS, MD',
                    title=f"Consultant ({specialization})" if specialization else "Consultant Practitioner",
                    clinic_timings="09:00 AM - 01:00 PM, 04:30 PM - 08:00 PM (Mon-Sat)",
                    bio=f"{qualifications} specialist in {specialization}. Council: {medical_council}."
                )
            except Exception:
                pass
            
        return user


class VerificationRequestSerializer(serializers.Serializer):
    specialization = serializers.CharField(required=True)
    registration_number = serializers.CharField(required=True)
    license_file_url = serializers.URLField(required=False, allow_blank=True, allow_null=True)
