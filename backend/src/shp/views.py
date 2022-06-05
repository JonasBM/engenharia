from rest_framework import permissions, viewsets
from rest_framework.response import Response

from .models import (Diameter, Fitting, FittingDiameter, Fixture, Material,
                     MaterialConnection, Reduction)
from .serializers import (
    DiameterSerializer, FittingDiameterResponseSerializer, FittingDiameterSerializer, FittingSerializer,
    FixtureSerializer, MaterialConnectionSerializer, MaterialSerializer, ReductionSerializer)
from rest_framework.exceptions import ValidationError


'''
TODO:
create extras on diameters and fittings creation
'''


class MaterialViewSet(viewsets.ModelViewSet):
    permission_classes = [
        permissions.IsAdminUser,
    ]
    serializer_class = MaterialSerializer
    queryset = Material.objects.all()


class DiameterViewSet(viewsets.ModelViewSet):
    permission_classes = [
        permissions.IsAdminUser,
    ]
    serializer_class = DiameterSerializer
    queryset = Diameter.objects.all()


class FittingViewSet(viewsets.ModelViewSet):
    permission_classes = [
        permissions.IsAdminUser,
    ]
    serializer_class = FittingSerializer
    queryset = Fitting.objects.all()


class FittingDiameterViewSet(viewsets.ViewSet):
    permission_classes = [
        permissions.IsAdminUser,
    ]

    def get_object_by_material_id(self, material_id):
        queryset = FittingDiameter.objects.filter(diameter__material_id=material_id)
        obj = {'material': material_id, 'fitting_diameter_array': queryset}
        return obj

    def get_object(self):
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        material_id = self.kwargs[lookup_url_kwarg]
        obj = self.get_object_by_material_id(material_id)
        return obj

    def list(self, request, *args, **kwargs):
        material_ids = Material.objects.all().values_list('id', flat=True)
        response = []
        for material_id in material_ids:
            response.append(self.get_object_by_material_id(material_id))
        serializer = FittingDiameterResponseSerializer(response, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        serializer = FittingDiameterResponseSerializer(self.get_object())
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        return self.create_or_update(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        return self.create_or_update(request, *args, **kwargs)

    def create_or_update(self, request, *args, **kwargs):
        errors = []
        material = request.data.get('material')
        if not material:
            errors.append({'material': 'This field may not be blank.'})
        fitting_diameter_array = request.data.get('fitting_diameter_array')
        if not fitting_diameter_array:
            errors.append({'fitting_diameter_array': 'This field may not be blank.'})
        if len(errors):
            raise ValidationError(errors)

        for item in fitting_diameter_array:
            id = item.pop('id', None)
            instance = None
            if id:
                instance = FittingDiameter.objects.get(id=id)
            if instance:
                serializer = FittingDiameterSerializer(instance, data=item)
                serializer.is_valid(raise_exception=True)
                serializer.save()
            else:
                serializer = FittingDiameterSerializer(data=item)
                serializer.is_valid(raise_exception=True)
                serializer.save()
        serializer = FittingDiameterResponseSerializer(self.get_object_by_material_id(material))
        return Response(serializer.data)


class ReductionViewSet(viewsets.ModelViewSet):
    permission_classes = [
        permissions.IsAdminUser,
    ]
    serializer_class = ReductionSerializer
    queryset = Reduction.objects.all()


class MaterialConnectionViewSet(viewsets.ModelViewSet):
    permission_classes = [
        permissions.IsAdminUser,
    ]
    serializer_class = MaterialConnectionSerializer
    queryset = MaterialConnection.objects.all()


class FixtureViewSet(viewsets.ModelViewSet):
    permission_classes = [
        permissions.IsAdminUser,
    ]
    serializer_class = FixtureSerializer
    queryset = Fixture.objects.all()
