from django.urls import path
from rest_framework import routers

from .views import (Calculate, ConfigViewSet, DiameterViewSet,
                    FittingDiameterViewSet, FittingViewSet, FixtureViewSet,
                    LoadMaterialBackup, MaterialConnectionViewSet,
                    MaterialViewSet, ReductionViewSet, test)

app_name = 'shp'

router = routers.SimpleRouter()
router.register(r'configs', ConfigViewSet, 'configs')
router.register(r'materials', MaterialViewSet, 'materials')
router.register(r'diameters', DiameterViewSet, 'diameters')
router.register(r'fittings', FittingViewSet, 'fittings')
router.register(r'fittingdiameter', FittingDiameterViewSet, 'fittingdiameter')
router.register(r'reductions', ReductionViewSet, 'reductions')
router.register(r'materialconnections', MaterialConnectionViewSet, 'materialconnections')
router.register(r'fixtures', FixtureViewSet, 'fixtures')

urlpatterns = [
    path(r'loadmaterialbackup/', LoadMaterialBackup.as_view(), name='loadmaterialbackup'),
    path(r'calculate/', Calculate.as_view(), name='calculate'),
    # path(r'test/', test, name='test'),
]

urlpatterns += router.urls
