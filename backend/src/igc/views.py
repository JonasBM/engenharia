import logging

from django.contrib.staticfiles.storage import staticfiles_storage
from django.db import IntegrityError, transaction
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.utils.dateparse import parse_datetime
from rest_framework import permissions, status, views, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from weasyprint import CSS, HTML

from .calculate import IGC
from .models import (Config, Diameter, Fitting, FittingDiameter, GAS,
                     Material, MaterialConnection, Reduction)
from .serializers import (ConfigSerializer, DiameterSerializer,
                          FittingDiameterResponseSerializer,
                          FittingDiameterSerializer, FittingSerializer,
                          GASSerializer, MaterialConnectionSerializer,
                          MaterialFileSerializer, MaterialSerializer,
                          ReductionSerializer, IGCCalcSerializer)

'''
TODO:
create extras on diameters and fittings creation
'''

logger = logging.getLogger(__name__)


class ConfigViewSet(viewsets.ModelViewSet):
    permission_classes = [
        permissions.IsAdminUser,
    ]
    serializer_class = ConfigSerializer
    queryset = Config.objects.all()

    def get_object(self):
        return Config.load()

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer([self.get_object()], many=True)
        return Response(serializer.data)


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
                instance = FittingDiameter.objects.filter(id=id).first()
                if instance:
                    serializer = FittingDiameterSerializer(instance, data=item, partial=True)
                    serializer.is_valid(raise_exception=True)
                    serializer.save()
            else:
                serializer = FittingDiameterSerializer(data=item)
                serializer.is_valid(raise_exception=True)
                serializer.save()
        serializer = FittingDiameterResponseSerializer(self.get_object_by_material_id(material))
        return Response(serializer.data)


class ReductionViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser, ]
    serializer_class = ReductionSerializer
    queryset = Reduction.objects.all()


class MaterialConnectionViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser, ]
    serializer_class = MaterialConnectionSerializer
    queryset = MaterialConnection.objects.all()


class GASViewSet(viewsets.ModelViewSet):
    permission_classes = [
        permissions.IsAdminUser,
    ]
    serializer_class = GASSerializer
    queryset = GAS.objects.all()


class LoadMaterialBackup(views.APIView):

    permission_classes = [permissions.IsAdminUser]

    def post(self, request, format=None) -> Response:

        serializer = MaterialFileSerializer(data=request.data)
        serializer.is_valid(raise_exception=False)

        fileinfo = serializer.data.get('fileinfo')
        material = serializer.data.get('material')
        diameters = serializer.data.get('diameters')
        fittings = serializer.data.get('fittings')
        fitting_diameter_array = serializer.data.get('fittingdiameters', {}).get('fitting_diameter_array')
        reductions = serializer.data.get('reductions')

        if fileinfo.get('type') != "igc_material" or not str(fileinfo.get('version')).startswith('1.0.'):
            return Response({'detail': 'Problema com o arquivo enviado'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                material['id'] = None
                material = Material(**material)
                if (Material.objects.filter(name=material.name).exists()):
                    raise ValidationError({'detail': 'Já existe um material com este nome.'})
                material.save()

                _diameters_ids_change = {}
                for diameter in diameters:
                    old_id = diameter.pop('id', None)
                    diameter.pop('material', None)
                    diameter = Diameter(**diameter, material=material)
                    diameter.save()
                    _diameters_ids_change[old_id] = diameter.id

                _fittings_ids_change = {}
                for fitting in fittings:
                    old_id = fitting.pop('id', None)
                    fitting, _ = Fitting.objects.get_or_create(**fitting)
                    _fittings_ids_change[old_id] = fitting.id

                for fittingdiameter in fitting_diameter_array:
                    fittingdiameter.pop('id', None)
                    fittingdiameter.pop('material', None)
                    old_fitting = fittingdiameter.pop('fitting', None)
                    old_diameter = fittingdiameter.pop('diameter', None)
                    fittingdiameter = FittingDiameter(
                        **fittingdiameter,
                        fitting_id=_fittings_ids_change[old_fitting],
                        diameter_id=_diameters_ids_change[old_diameter]
                    )
                    fittingdiameter.save()

                for reduction in reductions:
                    reduction.pop('id', None)
                    reduction.pop('material', None)
                    old_inlet_diameter = reduction.pop('inlet_diameter', None)
                    old_outlet_diameter = reduction.pop('outlet_diameter', None)
                    reduction = Reduction(
                        **reduction,
                        inlet_diameter_id=_diameters_ids_change[old_inlet_diameter],
                        outlet_diameter_id=_diameters_ids_change[old_outlet_diameter]
                    )
                    reduction.save()
                logger.info(f'imported material: {material.name}')

        except ValidationError as e:
            logger.error(f'ValidationError: {e}')
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError as e:
            logger.error(f'IntegrityError: {e}')
            return Response(
                {'detail': 'Não foi possivel criar o material no Banco de dados'},
                status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f'Exception: {e}')
            return Response({'detail': 'Não foi possivel criar o material'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'detail': 'Material carregado e salvo com sucesso!'})


class Calculate(views.APIView):

    permission_classes = [permissions.IsAdminUser]

    def post(self, request, format=None) -> Response:
        download = request.query_params.get('download')
        if download == 'pdf':
            serializer = IGCCalcSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            calculated_at = serializer.data.get('calculated_at')
            # less_favorable_path_fixture_index = serializer.data.get('less_favorable_path_fixture_index')
            # if not calculated_at or not less_favorable_path_fixture_index:
            #     return Response(
            #         {'detail': 'Só é possivel imprimir sistemas cálculados'},
            #         status=status.HTTP_400_BAD_REQUEST
            #     )
            try:
                context = {
                    'calculated_at': parse_datetime(calculated_at),
                    'calc': serializer.data,
                    'gas': GAS.objects.get(id=serializer.data.get('gas_id')),
                    'reservoir_path': next(
                        filter(lambda path: path.get('start') == 'CG', serializer.data.get('paths')), None
                    ),
                }
                html_string = render_to_string('igc/printigc.html', context)
                # css = CSS(staticfiles_storage.path('css/printigc.css'))
                # pdf_file = HTML(
                #     string=html_string,
                #     base_url=request.build_absolute_uri()
                # ).write_pdf(stylesheets=[css])
                pdf_file = HTML(
                    string=html_string,
                    base_url=request.build_absolute_uri()
                ).write_pdf()
                filename = 'Cálculo IGC_server.pdf'
                response = HttpResponse(pdf_file, content_type='application/pdf')
                response['Content-Disposition'] = f'attachment; filename={filename}'
                return response
            except Exception as e:
                logger.error(e)
                return Response(
                    {'detail': 'Problemas ao imprimir o cálculo enviado'},
                    status=status.HTTP_400_BAD_REQUEST)
        else:
            serializer = IGC(request.data).calculate()
            if serializer.is_valid():
                error = serializer.data.pop('error', None)
                if error:
                    return Response({'detail': error}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response(serializer.data)
            print(serializer.errors)
            return Response({'detail': 'Problemas ao calcular os dados enviados'}, status=status.HTTP_400_BAD_REQUEST)


def test(request):
    from django.shortcuts import render

    serializer = IGCCalcSerializer(data=calc)
    serializer.is_valid(raise_exception=True)
    calculated_at = serializer.data.get('calculated_at')
    less_favorable_path_fixture_index = serializer.data.get('less_favorable_path_fixture_index')
    context = {
        'calculated_at': parse_datetime(calculated_at),
        'calc': serializer.data,
        'fixture': GAS.objects.get(id=serializer.data.get('gas_id'))
    }
    return render(request, 'igc/printigc.html', context)


calc = {}
