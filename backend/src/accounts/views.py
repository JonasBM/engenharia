
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from knox.auth import TokenAuthentication
from knox.views import LoginView as KnoxLoginView
from knox.views import LogoutAllView, LogoutView
from rest_framework import permissions, status, viewsets
from rest_framework.authentication import BasicAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import CustomUser
from .permissions import IsUser
from .serializers import (LoginResponseSerializer, PasswordSerializer,
                          UserProfileSerializer, UserSerializer)


class BasicAuthenticationNoHeader(BasicAuthentication):
    '''
    Override BasicAuthentication www-authenticate header
    To avoid login popup on 401
    '''

    def authenticate_header(self, request):
        return f'Token realm="{self.www_authenticate_realm}"'


class LoginView(KnoxLoginView):
    '''
    Login the user using basic authentication.
    '''
    authentication_classes = [BasicAuthenticationNoHeader]

    @swagger_auto_schema(
        responses={200: LoginResponseSerializer()},
    )
    def post(self, request, format=None):
        return super().post(request, format)


class LogoutView(LogoutView):

    @swagger_auto_schema(
        responses={204: openapi.Response('')},
        authentication_classes=[TokenAuthentication]
    )
    def post(self, request, format=None):
        return super().post(request, format)


class LogoutAllView(LogoutAllView):

    @swagger_auto_schema(
        responses={204: openapi.Response('')},
    )
    def post(self, request, format=None):
        return super().post(request, format)


class UserProfileViewSet(viewsets.ModelViewSet):
    '''
    CRUD view for User Model
    Allowed for own user profile or admin for all profiles
    '''
    permission_classes = [
        permissions.IsAdminUser | IsUser,
    ]
    serializer_class = UserProfileSerializer
    queryset = CustomUser.objects.all()

    @action(detail=False, methods=['get'], url_path="my-profile")
    def my_profile(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @swagger_auto_schema(
        request_body=PasswordSerializer,
        responses={204: openapi.Response('')},
    )
    @action(detail=False, methods=['post'], url_path="set-password")
    def set_password(self, request, pk=None):
        serializer = PasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not request.user.check_password(serializer.data.get("old_password")):
            return Response({"old_password": ["Senha incorreta."]}, status=status.HTTP_400_BAD_REQUEST,)
        request.user.set_password(serializer.data.get("new_password"))
        request.user.save()
        return Response({"Senha alterada com sucesso!"}, status=status.HTTP_200_OK,)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    '''
    Retrieve and List view for limited User Model
    Allowed for authenticated users
    '''
    permission_classes = [
        permissions.IsAuthenticated,
    ]
    serializer_class = UserSerializer
    queryset = CustomUser.objects.all()
