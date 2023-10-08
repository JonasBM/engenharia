from django_typomatic import ts_interface
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import (Config, Diameter, Fitting, FittingDiameter, Fixture,
                     Material, MaterialConnection, Reduction)


@ts_interface('shp')
class ConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = Config
        fields = '__all__'


@ts_interface('shp')
class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'


@ts_interface('shp')
class DiameterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diameter
        fields = '__all__'


@ts_interface('shp')
class FittingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fitting
        fields = '__all__'


@ts_interface('shp')
class FittingDiameterSerializer(serializers.ModelSerializer):

    material = serializers.IntegerField(source='diameter.material_id', read_only=True)

    class Meta:
        model = FittingDiameter
        fields = '__all__'


@ts_interface('shp')
class FittingDiameterResponseSerializer(serializers.Serializer):

    material = serializers.IntegerField()
    fitting_diameter_array = FittingDiameterSerializer(many=True)


@ts_interface('shp')
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


@ts_interface('shp')
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


@ts_interface('shp')
class FixtureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fixture
        fields = '__all__'


custom_not_required_blank = {'allow_blank': True, 'allow_null': True, 'required': False}
custom_not_required = {'allow_null': True, 'required': False}


@ts_interface('shp')
class FileInfoSerializer(serializers.Serializer):
    type = serializers.CharField()
    version = serializers.CharField()
    created = serializers.DateTimeField()
    updated = serializers.DateTimeField()


@ts_interface('shp')
class MaterialFileSerializer(serializers.Serializer):

    fileinfo = FileInfoSerializer(required=True)
    material = MaterialSerializer(required=True)
    reductions = ReductionSerializer(required=True, many=True)
    diameters = DiameterSerializer(required=True, many=True)
    fittings = FittingSerializer(required=True, many=True)
    fittingdiameters = FittingDiameterResponseSerializer()


@ts_interface('shp')
class SHPCalcFixtureSerializer(serializers.Serializer):

    active = serializers.BooleanField(default=False, **custom_not_required)
    end = serializers.CharField(required=True)
    hose_length = serializers.FloatField(default=0, **custom_not_required)
    level_difference = serializers.FloatField(default=0, **custom_not_required)
    flow = serializers.FloatField(default=0, **custom_not_required)
    total_length = serializers.FloatField(default=0, **custom_not_required)
    start_pressure = serializers.FloatField(default=0, **custom_not_required)
    middle_pressure = serializers.FloatField(default=0, **custom_not_required)
    end_pressure = serializers.FloatField(default=0, **custom_not_required)
    hose_pressure_drop = serializers.FloatField(default=0, **custom_not_required)
    nozzle_pressure_drop = serializers.FloatField(default=0, **custom_not_required)
    unit_hose_pressure_drop = serializers.FloatField(default=0, **custom_not_required)
    pressure_drop = serializers.FloatField(default=0, **custom_not_required)
    unit_pressure_drop = serializers.FloatField(default=0, **custom_not_required)
    connection_names = serializers.ListField(child=serializers.CharField(), default=[], **custom_not_required)


@ts_interface('shp')
class SHPCalcPathSerializer(serializers.Serializer):

    start = serializers.CharField(required=True)
    end = serializers.CharField(allow_null=True, required=True)
    fixture = SHPCalcFixtureSerializer(default={}, **custom_not_required)
    material_id = serializers.IntegerField(required=True)
    diameter_id = serializers.IntegerField(required=True)
    length = serializers.FloatField(default=0, **custom_not_required)
    level_difference = serializers.FloatField(default=0, **custom_not_required)
    head_lift = serializers.FloatField(default=0, **custom_not_required)
    fittings_ids = serializers.ListField(child=serializers.IntegerField(), default=[], **custom_not_required)
    has_fixture = serializers.BooleanField(default=False, **custom_not_required)
    extra_equivalent_length = serializers.FloatField(default=0, **custom_not_required)
    equivalent_length = serializers.FloatField(default=0, **custom_not_required)
    total_length = serializers.FloatField(default=0, **custom_not_required)
    connection_names = serializers.ListField(child=serializers.CharField(), default=[], **custom_not_required)
    flow = serializers.FloatField(default=0, **custom_not_required)
    speed = serializers.FloatField(default=0, **custom_not_required)
    start_pressure = serializers.FloatField(default=0, **custom_not_required)
    end_pressure = serializers.FloatField(default=0, **custom_not_required)
    pressure_drop = serializers.FloatField(default=0, **custom_not_required)
    unit_pressure_drop = serializers.FloatField(default=0, **custom_not_required)

    def validate(self, data):
        if data.get('has_fixture') and not data.get('fixture'):
            raise ValidationError(
                'Existem trechos com hidrantes vazios.'
            )
        return super().validate(data)


@ts_interface('shp')
class SHPCalcPumpSerializer(serializers.Serializer):

    node = serializers.CharField(**custom_not_required_blank)
    head_lift = serializers.FloatField(**custom_not_required)
    flow = serializers.FloatField(**custom_not_required)
    NPSHd = serializers.FloatField(**custom_not_required)


@ts_interface('shp')
class SHPCalcSerializer(serializers.Serializer):

    fileinfo = FileInfoSerializer(required=True)
    name = serializers.CharField(**custom_not_required_blank)
    observation = serializers.CharField(**custom_not_required_blank)
    pressure_type = serializers.ChoiceField(choices=Config.PressureType, required=True)
    calc_type = serializers.ChoiceField(choices=Config.CalcType, required=True)
    pump = SHPCalcPumpSerializer()
    material_id = serializers.IntegerField(required=True)
    diameter_id = serializers.IntegerField(required=True)
    fixture_id = serializers.IntegerField(required=True)
    signatory_id = serializers.IntegerField(**custom_not_required)
    paths = SHPCalcPathSerializer(required=True, many=True)
    error = serializers.CharField(default=None, **custom_not_required_blank)
    less_favorable_path_fixture_index = serializers.IntegerField(**custom_not_required)
    calculated_at = serializers.DateTimeField(**custom_not_required)

    def to_internal_value(self, data):
        if data.get('pressure_type') == 'GR':
            data['pump'] = {}
        return super().to_internal_value(data)

    def validate(self, data):
        if data.get('pressure_type') == 'bomba' and not data.get('pump_node'):
            raise ValidationError(
                'O ponto da bomba é obrigatório.'
            )
        return super().validate(data)

from django_typomatic import generate_ts
generate_ts('./shpTypes.ts', 'shp')
