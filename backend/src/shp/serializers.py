from django_typomatic import generate_ts, ts_interface
from rest_framework import serializers

from .models import (FittingDiameter, Fixture, Material, Diameter, Fitting, Reduction, MaterialConnection)


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

    def validate_material(self, attrs):
        """Check if the inlet_diameter and outlet_diameter has the same material"""

        if not isinstance(attrs, int) and attrs.get('inlet_diameter') != attrs.get('outlet_diameter'):
            raise serializers.ValidationError("Os diâmetros devem ter o mesmo material")

    def validate(self, attrs):
        self.validate_material(attrs)
        return super().validate(attrs)


@ts_interface('shp')
class MaterialConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialConnection
        fields = '__all__'


@ts_interface('shp')
class FixtureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fixture
        fields = '__all__'


@ts_interface('shp')
class FileInfoSerializer(serializers.Serializer):
    type = serializers.CharField()
    version = serializers.CharField()


@ts_interface('shp')
class MaterialFileSerializer(serializers.Serializer):

    fileinfo = FileInfoSerializer(required=True)
    material = MaterialSerializer(required=True)
    reductions = ReductionSerializer(many=True)
    diameters = DiameterSerializer(many=True)
    fittings = FittingSerializer(many=True)
    fittingdiameters = FittingDiameterResponseSerializer()


generate_ts('./shpTypes.ts', 'shp')
