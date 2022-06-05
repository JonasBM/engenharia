
from rest_framework import routers
from .views import (FixtureViewSet, MaterialViewSet, DiameterViewSet, FittingViewSet, ReductionViewSet,
                    MaterialConnectionViewSet, FittingDiameterViewSet)

app_name = 'shp'

router = routers.SimpleRouter()
router.register(r"materials", MaterialViewSet, "materials")
router.register(r"diameters", DiameterViewSet, "diameters")
router.register(r"fittings", FittingViewSet, "fittings")
router.register(r"fittingdiameter", FittingDiameterViewSet, "fittingdiameter")
router.register(r"reductions", ReductionViewSet, "reductions")
router.register(r"materialconnections", MaterialConnectionViewSet, "materialconnections")
router.register(r"fixtures", FixtureViewSet, "fixtures")

urlpatterns = []

urlpatterns += router.urls