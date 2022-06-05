from django.contrib.auth.hashers import make_password
from django_typomatic import generate_ts, ts_interface
from rest_framework import serializers

from accounts.models import CustomUser


@ts_interface('accounts')
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


@ts_interface('accounts')
class UserProfileSerializer(serializers.ModelSerializer):

    groups = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name'
    )
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = CustomUser
        fields = '__all__'
        read_only_fields = (
            'username'
            'last_login',
            'date_joined',
            'is_superuser',
            'is_staff',
            'is_active',
            'user_permissions',
        )
        extra_kwargs = {'password': {'write_only': True}}

    def validate_password(self, value: str) -> str:
        return make_password(value)

    def update(self, instance, validated_data):
        validated_data.pop('password', None)
        return super().update(instance, validated_data)


@ts_interface('accounts')
class PasswordSerializer(serializers.Serializer):

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)


@ts_interface('accounts')
class LoginResponseSerializer(serializers.Serializer):

    expiry = serializers.DateTimeField()
    token = serializers.CharField()
    user = UserProfileSerializer()


generate_ts('./accountsTypes.ts', 'accounts')
