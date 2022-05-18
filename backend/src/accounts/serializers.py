from accounts.models import CustomUser
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = (
            'id',
            'username',
            'first_name',
            'last_name',
        )
        read_only_fields = (
            'id',
            'username',
            'first_name',
            'last_name',
        )


class UserProfileSerializer(serializers.ModelSerializer):

    groups = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name'
    )

    class Meta:
        model = CustomUser
        read_only_fields = (
            'last_login',
            'date_joined',
            'is_superuser',
            'groups',
            'user_permissions',
        )
        extra_kwargs = {'password': {'write_only': True}}


class ChangePasswordSerializer(serializers.Serializer):

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
