from django_typomatic import generate_ts, ts_interface
from rest_framework import serializers

from .models import (Config, FittingDiameter, Fixture, Material, Diameter, Fitting, Reduction, MaterialConnection)
from rest_framework.exceptions import ValidationError


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
    reductions = ReductionSerializer(many=True)
    diameters = DiameterSerializer(many=True)
    fittings = FittingSerializer(many=True)
    fittingdiameters = FittingDiameterResponseSerializer()


@ts_interface('shp')
class SHPCalcFixtureSerializer(serializers.Serializer):

    active = serializers.BooleanField(default=False)
    end = serializers.CharField(required=True)
    hose_length = serializers.FloatField(default=0)
    level_difference = serializers.FloatField(default=0)
    flow = serializers.FloatField(default=0)
    total_length = serializers.FloatField(default=0)
    start_pressure = serializers.FloatField(default=0)
    middle_pressure = serializers.FloatField(default=0)
    end_pressure = serializers.FloatField(default=0)
    hose_pressure_drop = serializers.FloatField(default=0)
    unit_hose_pressure_drop = serializers.FloatField(default=0)
    pressure_drop = serializers.FloatField(default=0)
    unit_pressure_drop = serializers.FloatField(default=0)
    connection_names = serializers.ListField(child=serializers.CharField(), default=[])


@ts_interface('shp')
class SHPCalcPathSerializer(serializers.Serializer):

    start = serializers.CharField(required=True)
    end = serializers.CharField(allow_null=True, required=True)
    fixture = SHPCalcFixtureSerializer(default={})
    material_id = serializers.IntegerField(required=True)
    diameter_id = serializers.IntegerField(required=True)
    length = serializers.FloatField(default=0)
    level_difference = serializers.FloatField(default=0)
    fittings_ids = serializers.ListField(child=serializers.IntegerField(), default=[])
    extra_equivalent_length = serializers.FloatField(default=0)
    equivalent_length = serializers.FloatField(default=0)
    total_length = serializers.FloatField(default=0)
    has_fixture = serializers.BooleanField(default=False)
    connection_names = serializers.ListField(child=serializers.CharField(), default=[])
    flow = serializers.FloatField(default=0)
    speed = serializers.FloatField(default=0)
    start_pressure = serializers.FloatField(default=0)
    end_pressure = serializers.FloatField(default=0)
    pressure_drop = serializers.FloatField(default=0)
    unit_pressure_drop = serializers.FloatField(default=0)

    def validate(self, data):
        if data.get('has_fixture') and not data.get('fixture'):
            raise ValidationError(
                'Existem trechos com hidrantes vazios.'
            )
        return super().validate(data)


@ts_interface('shp')
class SHPCalcSerializer(serializers.Serializer):

    # PRESSURE_TYPES = [
    #     ('gravitacional', 'Gravitacional'),
    #     ('bomba', 'Bomba'),
    # ]

    # CALC_TYPES = [
    #     ('vazao_minima', 'Vazão mínima'),
    #     ('vazao_residual', 'Vazão Residual')
    # ]

    fileinfo = FileInfoSerializer(required=True)
    name = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    pressure_type = serializers.ChoiceField(choices=Config.PressureType, required=True)
    calc_type = serializers.ChoiceField(choices=Config.CalcType, required=True)
    pump_node = serializers.CharField(allow_blank=True, default=None)
    material_id = serializers.IntegerField(required=True)
    diameter_id = serializers.IntegerField(required=True)
    fixture_id = serializers.IntegerField(required=True)
    paths = SHPCalcPathSerializer(required=True, many=True)
    error = serializers.CharField(default=None, allow_null=True)
    less_favorable_path_fixture_index = serializers.IntegerField(required=False, allow_null=True)

    def validate(self, data):
        if data.get('pressure_type') == 'bomba' and not data.get('pump_node'):
            raise ValidationError(
                'O ponto da bomba é obrigatório.'
            )
        return super().validate(data)


generate_ts('./shpTypes.ts', 'shp')
