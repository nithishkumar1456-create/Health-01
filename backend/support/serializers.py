from rest_framework import serializers
from .models import SupportIssue


# Maps frontend camelCase category values to DB choices
CATEGORY_MAP = {
    'Billing': 'billing',
    'Technical': 'technical',
    'Clinical': 'clinical',
    'Account': 'account',
    'Other': 'other',
}

STATUS_MAP = {
    'Open': 'open',
    'In Progress': 'in_progress',
    'Resolved': 'resolved',
}

STATUS_REVERSE_MAP = {v: k for k, v in STATUS_MAP.items()}
CATEGORY_REVERSE_MAP = {v: k for k, v in CATEGORY_MAP.items()}


class SupportIssueSerializer(serializers.ModelSerializer):
    # Return frontend-friendly values
    category = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    userEmail = serializers.CharField(source='user_email', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = SupportIssue
        fields = ['id', 'title', 'description', 'category', 'status', 'userEmail', 'createdAt', 'updatedAt']
        read_only_fields = ['id', 'createdAt', 'updatedAt']

    def get_category(self, obj):
        return CATEGORY_REVERSE_MAP.get(obj.category, obj.category.capitalize())

    def get_status(self, obj):
        return STATUS_REVERSE_MAP.get(obj.status, obj.status.replace('_', ' ').title())


class SupportIssueCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=500)
    description = serializers.CharField()
    category = serializers.CharField()
    status = serializers.CharField(default='Open')
    userEmail = serializers.EmailField(required=False, allow_blank=True)

    def create(self, validated_data):
        raw_category = validated_data.get('category', 'Other')
        raw_status = validated_data.get('status', 'Open')
        db_category = CATEGORY_MAP.get(raw_category, raw_category.lower())
        db_status = STATUS_MAP.get(raw_status, raw_status.lower().replace(' ', '_'))

        return SupportIssue.objects.create(
            title=validated_data['title'],
            description=validated_data['description'],
            category=db_category,
            status=db_status,
            user=validated_data.get('user'),
            user_email=validated_data.get('userEmail', '')
        )
