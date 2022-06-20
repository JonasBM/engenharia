from django.urls import path
from rest_framework import routers

from .views import LoginView, LogoutView, LogoutAllView, UserProfileViewSet, UserViewSet

app_name = 'accounts'

router = routers.SimpleRouter()
router.register(r"users", UserViewSet, "users")
router.register(r"userprofiles", UserProfileViewSet, "userprofiles")

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name='knox_login'),
    path("auth/logout/", LogoutView.as_view(), name='knox_logout'),
    path("auth/logoutall/", LogoutAllView.as_view(), name='knox_logoutall'),
]


urlpatterns += router.urls

print("URLLLLLLLLLLLLLLL")
