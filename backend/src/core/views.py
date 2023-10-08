import logging

from rest_framework import permissions, viewsets

from .models import Signatory
from .serializers import SignatorySerializer

logger = logging.getLogger(__name__)


class SignatoryViewSet(viewsets.ModelViewSet):
    permission_classes = [
        permissions.IsAdminUser,
    ]
    serializer_class = SignatorySerializer
    queryset = Signatory.objects.all()
