from django.urls import path
from rest_framework import routers

from .views import (Calculate, ConfigViewSet, DiameterViewSet,
                    FittingDiameterViewSet, FittingViewSet, GASViewSet,
                    LoadMaterialBackup, MaterialConnectionViewSet,
                    MaterialViewSet, ReductionViewSet, test)

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

urlpatterns = [
    path(r'loadmaterialbackup/', LoadMaterialBackup.as_view(), name='loadmaterialbackup'),
    path(r'calculate/', Calculate.as_view(), name='calculate'),
    path('test/', test)
]

urlpatterns += router.urls
