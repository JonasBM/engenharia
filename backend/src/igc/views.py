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

from core.models import Signatory

from .utils import get_result
from .calculate import IGC
from .models import (Cilinder, Config, Diameter, Fitting, FittingDiameter, GAS,
                     Material, MaterialConnection, Meter, Reduction)
from .serializers import (CilinderSerializer, ConfigSerializer, DiameterSerializer,
                          FittingDiameterResponseSerializer,
                          FittingDiameterSerializer, FittingSerializer,
                          GASSerializer, MaterialConnectionSerializer,
                          MaterialFileSerializer, MaterialSerializer, MeterSerializer,
                          ReductionSerializer, IGCCalcSerializer)

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


class CilinderViewSet(viewsets.ModelViewSet):
    permission_classes = [
        permissions.IsAdminUser,
    ]
    serializer_class = CilinderSerializer
    queryset = Cilinder.objects.all()


class MeterViewSet(viewsets.ModelViewSet):
    permission_classes = [
        permissions.IsAdminUser,
    ]
    serializer_class = MeterSerializer
    queryset = Meter.objects.all()


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

        if fileinfo.get('type') != 'igc_material' or not str(fileinfo.get('version')).startswith('1.0.'):
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
            if not calculated_at:
                return Response(
                    {'detail': 'Só é possivel imprimir sistemas cálculados'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            try:
                context = {
                    'calculated_at': parse_datetime(calculated_at),
                    'calc': serializer.data,
                    'gas': GAS.objects.get(id=serializer.data.get('gas_id')),
                    'signatory': Signatory.objects.filter(id=serializer.data.get('signatory_id')).first(),
                    'result': get_result(serializer.data),
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
                logger.exception(e)
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
            return Response({'detail': 'Problemas ao calcular os dados enviados'}, status=status.HTTP_400_BAD_REQUEST)


def test(request):
    from django.shortcuts import render

    serializer = IGCCalcSerializer(data=calc)
    serializer.is_valid(raise_exception=True)
    calculated_at = serializer.data.get('calculated_at')
    context = {
        'calculated_at': parse_datetime(calculated_at),
        'calc': serializer.data,
        'gas': GAS.objects.get(id=serializer.data.get('gas_id')),
        'signatory': Signatory.objects.filter(id=serializer.data.get('signatory_id')).first(),
        'result': get_result(serializer.data),
    }
    return render(request, 'igc/printigc.html', context)


calc = {
    'fileinfo': {
        'type': 'igc_primary_calc',
        'version': '1.0.0',
        'created': '2023-09-26T19:53:36Z',
        'updated': '2023-10-04 17:23:03-03:00'
    },
    'name': '',
    'calc_type': 'PR',
    'material_id': 4,
    'diameter_id': 13,
    'gas_id': 1,
    'start_pressure': 151,
    'paths': [
        {
            'start': 'CG',
            'end': 'A',
            'material_id': 4,
            'diameter_id': 13,
            'power_rating_added': 111,
            'power_rating_accumulated': 666,
            'power_rating_adopted': 578.6367394766794,
            'concurrency_factor': 0.8688239331481673,
            'length': 1,
            'length_up': 0,
            'length_down': 0,
            'fittings_ids': [],
            'extra_equivalent_length': 0,
            'equivalent_length': 0,
            'total_length': 1,
            'connection_names': ['Comprimento extra: 0,00 m'],
            'flow': 1.4465918486916987,
            'speed': 0.8881581210249941,
            'start_pressure': 150,
            'end_pressure': 149.98823599941306,
            'pressure_drop': 3.5290617843752354,
            'pressure_drop_color': None,
            'pressure_drop_accumulated': 7.842667057957442e-05,
            'pressure_drop_accumulated_color': '#4caf50',
            'fail': True,
            'fail_level': 0
        },
        {
            'start': 'A',
            'end': 'B',
            'material_id': 4,
            'diameter_id': 13,
            'power_rating_added': 222,
            'power_rating_accumulated': 555,
            'power_rating_adopted': 502.8472512873182,
            'concurrency_factor': 0.9060310834005734,
            'length': 2,
            'length_up': 0,
            'length_down': 0,
            'fittings_ids': [],
            'extra_equivalent_length': 0,
            'equivalent_length': 0,
            'total_length': 2,
            'connection_names': ['Comprimento extra: 0,00 m'],
            'flow': 1.2571181282182955,
            'speed': 0.7718638430902072,
            'start_pressure': 149.98823599941306,
            'end_pressure': 149.9700111819226,
            'pressure_drop': 5.4666843096417,
            'pressure_drop_color': None,
            'pressure_drop_accumulated': 0.0001999254538494218,
            'pressure_drop_accumulated_color': '#4caf50',
            'fail': False,
            'fail_level': 0
        },
        {
            'start': 'B',
            'end': 'C',
            'material_id': 4,
            'diameter_id': 13,
            'power_rating_added': 333,
            'power_rating_accumulated': 333,
            'power_rating_adopted': 333,
            'concurrency_factor': 1,
            'length': 3,
            'length_up': 0,
            'length_down': 0,
            'fittings_ids': [],
            'extra_equivalent_length': 0,
            'equivalent_length': 0,
            'total_length': 3,
            'connection_names': ['Comprimento extra: 0,00 m'],
            'flow': 0.8325,
            'speed': 0.5111876450213614,
            'start_pressure': 149.9700111819226,
            'end_pressure': 149.95709796724964,
            'pressure_drop': 3.873023146681376,
            'pressure_drop_color': None,
            'pressure_drop_accumulated': 0.0002860135516690813,
            'pressure_drop_accumulated_color': '#4caf50',
            'fail': False,
            'fail_level': 0
        }
    ],
    'error': None,
    'calculated_at': '2023-10-04T20:23:00.306920Z',
    'max_fail_level': 0
}

calc = {"fileinfo": {"type": "igc_primary_calc", "version": "1.0.0", "created": "2023-09-26T19:53:36Z", "updated": "2023-10-08 11:33:01-03:00"}, "name": "NOME", "signatory_id": 0, "observation": "fsadfasdf\nfasdfasd\n\nfasdfsdafpofawe çp~~pfliahsfdlhasdljkfhlkjasfdhasjdfhjasfdjhasfdjhasjdfhjasdlfhahskjdfhashlfkjhasdfhkjasfjdhakjsdfhjasfkjdhsajdfhkasdjfhkjsfdhkjahsdfhkjasfhdjhasjfhjahsfdlsdafhkjasdjfhlajsdfhjsdajfkhsdjhfjsdhfajhaljsdfhasdjfhasjdfhjasdfhjhasdfhasdfhhasdfhasfjdhasdfhaskjdfhashfjhsadfhlsahfkhlsahdlfkhaslhfkhasdhkfhshakfhhfsakfhlhsakflsdahfhsadjfhlkjasdhlfkjhasdkljgfkljagsdkjfgkjasdfgkljagsdklfjgkasjdgfkjgasdkjgfkjasdgfkjkfgasjkdgfjasdgfkjgsadjkfgjksagdjfkgslakfgsjdafklgsfjfaslgflksdagfsdafjgsdgflasdgfkjgsadfjkglsadgdfglasfjglaksdgfjjdfgdfgsajldgflgasdljkgfkjasdgfdsjagdsjgdhgdfsakgdfkgfsdakljgfdkljgdfsakljfkljffkdgfsakjfdgsadglafg", "calc_type": "PR", "material_id": 4, "diameter_id": 13, "gas_id": 1, "start_pressure": 150, "paths": [{"start": "CG", "end": "A", "material_id": 4, "diameter_id": 13, "power_rating_added": 111, "power_rating_accumulated": 666, "power_rating_adopted": 578.6367394766794, "concurrency_factor": 0.8688239331481673, "length": 1, "length_up": 0, "length_down": 0, "fittings_ids": [], "extra_equivalent_length":0, "equivalent_length":0, "total_length":1, "connection_names":["Comprimento extra: 0,00 m"], "flow":1.4465918486916987, "speed":0.8881581210249941, "start_pressure":150, "end_pressure":149.98823599941306, "pressure_drop":3.5290617843752354, "pressure_drop_color":None, "pressure_drop_accumulated":0.00007842667057957442, "pressure_drop_accumulated_color":"#4caf50", "fail":False, "fail_level":0}, {
    "start": "A", "end": "B", "material_id": 4, "diameter_id": 13, "power_rating_added": 222, "power_rating_accumulated": 555, "power_rating_adopted": 502.8472512873182, "concurrency_factor": 0.9060310834005734, "length": 2, "length_up": 0, "length_down": 0, "fittings_ids": [], "extra_equivalent_length":0, "equivalent_length":0, "total_length":2, "connection_names":["Comprimento extra: 0,00 m"], "flow":1.2571181282182955, "speed":0.7718638430902072, "start_pressure":149.98823599941306, "end_pressure":149.9700111819226, "pressure_drop":5.4666843096417, "pressure_drop_color":None, "pressure_drop_accumulated":0.0001999254538494218, "pressure_drop_accumulated_color":"#4caf50", "fail":False, "fail_level":0}, {"start": "B", "end": "C", "material_id": 4, "diameter_id": 13, "power_rating_added": 333, "power_rating_accumulated": 333, "power_rating_adopted": 333, "concurrency_factor": 1, "length": 3, "length_up": 0, "length_down": 0, "fittings_ids": [], "extra_equivalent_length":0, "equivalent_length":0, "total_length":3, "connection_names":["Comprimento extra: 0,00 m"], "flow":0.8325, "speed":0.5111876450213614, "start_pressure":149.9700111819226, "end_pressure":149.95709796724964, "pressure_drop":3.873023146681376, "pressure_drop_color":None, "pressure_drop_accumulated":0.0002860135516690813, "pressure_drop_accumulated_color":"#4caf50", "fail":False, "fail_level":0}], "error": None, "calculated_at": "2023-10-08T14:32:58.151708Z", "max_fail_level": 0}
