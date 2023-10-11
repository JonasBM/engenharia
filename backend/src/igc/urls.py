from django.urls import path
from rest_framework import routers

from .views import (Calculate, CilinderViewSet, ConfigViewSet, DiameterViewSet,
                    FittingDiameterViewSet, FittingViewSet, GASViewSet,
                    LoadMaterialBackup, MaterialConnectionViewSet,
                    MaterialViewSet, MeterViewSet, ReductionViewSet)

app_name = 'igc'

router = routers.SimpleRouter()
router.register(r'configs', ConfigViewSet, 'configs')
router.register(r'materials', MaterialViewSet, 'materials')
router.register(r'diameters', DiameterViewSet, 'diameters')
router.register(r'fittings', FittingViewSet, 'fittings')
router.register(r'fittingdiameter', FittingDiameterViewSet, 'fittingdiameter')
router.register(r'reductions', ReductionViewSet, 'reductions')
router.register(r'materialconnections', MaterialConnectionViewSet, 'materialconnections')
router.register(r'gas', GASViewSet, 'gas')
router.register(r'cilinders', CilinderViewSet, 'cilinders')
router.register(r'meters', MeterViewSet, 'meters')

urlpatterns = [
    path(r'loadmaterialbackup/', LoadMaterialBackup.as_view(), name='loadmaterialbackup'),
    path(r'calculate/', Calculate.as_view(), name='calculate'),
]

urlpatterns += router.urls
