from django_typomatic import generate_ts
from django_typomatic import generate_ts, ts_interface
from rest_framework import serializers

from .models import Signatory


@ts_interface('core')
class SignatorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Signatory
        fields = '__all__'


# generate_ts('./coreTypes.ts', 'core')
