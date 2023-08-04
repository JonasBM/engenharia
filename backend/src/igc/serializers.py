from django_typomatic import generate_ts
from django_typomatic import ts_interface
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import (Config, Diameter, Fitting, FittingDiameter, GAS,
                     Material, MaterialConnection, Reduction)


@ts_interface('igc')
class ConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = Config
        fields = '__all__'


@ts_interface('igc')
class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'


@ts_interface('igc')
class DiameterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diameter
        fields = '__all__'


@ts_interface('igc')
class FittingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fitting
        fields = '__all__'


@ts_interface('igc')
class FittingDiameterSerializer(serializers.ModelSerializer):

    material = serializers.IntegerField(source='diameter.material_id', read_only=True)

    class Meta:
        model = FittingDiameter
        fields = '__all__'


@ts_interface('igc')
class FittingDiameterResponseSerializer(serializers.Serializer):

    material = serializers.IntegerField()
    fitting_diameter_array = FittingDiameterSerializer(many=True)


@ts_interface('igc')
class ReductionSerializer(serializers.ModelSerializer):

    material = serializers.IntegerField(source='inlet_diameter.material_id', read_only=True)

    class Meta:
        model = Reduction
        fields = '__all__'

    def validate_material(self, data):
        """Check if the inlet_diameter and outlet_diameter has the same material"""

        # inlet_diameter = Diameter.objects.get(id=data.get('inlet_diameter'))
        # outlet_diameter = Diameter.objects.get(id=data.get('outlet_diameter'))
        if data.get('inlet_diameter').material != data.get('outlet_diameter').material:
            raise serializers.ValidationError("Os diâmetros devem ter o mesmo material")

    def validate(self, data):
        self.validate_material(data)
        return super().validate(data)


@ts_interface('igc')
class MaterialConnectionSerializer(serializers.ModelSerializer):

    # inlet_material = serializers.IntegerField(source='inlet_diameter.material_id', read_only=True)
    # outlet_material = serializers.IntegerField(source='outlet_diameter.material_id', read_only=True)

    class Meta:
        model = MaterialConnection
        fields = '__all__'

    def validate_material(self, data):
        """Check if the inlet_diameter and outlet_diameter has the same material"""

        if data.get('inlet_diameter').material == data.get('outlet_diameter').material:
            raise serializers.ValidationError("Os diâmetros devem ser de diferente materiais")

    def validate(self, data):
        self.validate_material(data)
        return super().validate(data)


@ts_interface('igc')
class GASSerializer(serializers.ModelSerializer):
    class Meta:
        model = GAS
        fields = '__all__'


custom_not_required_blank = {'allow_blank': True, 'allow_null': True, 'required': False}
custom_not_required = {'allow_null': True, 'required': False}


@ts_interface('igc')
class FileInfoSerializer(serializers.Serializer):
    type = serializers.CharField()
    version = serializers.CharField()
    created = serializers.DateTimeField()
    updated = serializers.DateTimeField()


@ts_interface('igc')
class MaterialFileSerializer(serializers.Serializer):

    fileinfo = FileInfoSerializer(required=True)
    material = MaterialSerializer(required=True)
    reductions = ReductionSerializer(required=True, many=True)
    diameters = DiameterSerializer(required=True, many=True)
    fittings = FittingSerializer(required=True, many=True)
    fittingdiameters = FittingDiameterResponseSerializer()


@ts_interface('igc')
class IGCCalcPathSerializer(serializers.Serializer):
    start = serializers.CharField(required=True)
    end = serializers.CharField(allow_null=True, required=True)
    material_id = serializers.IntegerField(required=True)
    diameter_id = serializers.IntegerField(required=True)
    power_rating_added = serializers.FloatField(default=0, **custom_not_required)
    power_rating_accumulated = serializers.FloatField(default=0, **custom_not_required)
    power_rating_adopted = serializers.FloatField(default=0, **custom_not_required)
    concurrency_factor = serializers.FloatField(default=0, **custom_not_required)
    length = serializers.FloatField(default=0, **custom_not_required)
    length_up = serializers.FloatField(default=0, **custom_not_required)
    length_down = serializers.FloatField(default=0, **custom_not_required)
    fittings_ids = serializers.ListField(child=serializers.IntegerField(), default=[], **custom_not_required)
    extra_equivalent_length = serializers.FloatField(default=0, **custom_not_required)
    equivalent_length = serializers.FloatField(default=0, **custom_not_required)
    total_length = serializers.FloatField(default=0, **custom_not_required)
    connection_names = serializers.ListField(child=serializers.CharField(), default=[], **custom_not_required)
    flow = serializers.FloatField(default=0, **custom_not_required)
    speed = serializers.FloatField(default=0, **custom_not_required)
    start_pressure = serializers.FloatField(default=0, **custom_not_required)
    end_pressure = serializers.FloatField(default=0, **custom_not_required)
    pressure_drop = serializers.FloatField(default=0, **custom_not_required)
    pressure_drop_accumulated = serializers.FloatField(default=0, **custom_not_required)


@ts_interface('igc')
class IGCCalcSerializer(serializers.Serializer):

    fileinfo = FileInfoSerializer(required=True)
    name = serializers.CharField(**custom_not_required_blank)
    material_id = serializers.IntegerField(required=True)
    diameter_id = serializers.IntegerField(required=True)
    gas_id = serializers.IntegerField(required=True)
    paths = IGCCalcPathSerializer(required=True, many=True)
    error = serializers.CharField(default=None, **custom_not_required_blank)
    calculated_at = serializers.DateTimeField(**custom_not_required)


# from django_typomatic import generate_ts
# generate_ts('./igcTypes.ts', 'igc')
