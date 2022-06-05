from django.core.exceptions import PermissionDenied, ValidationError as DjangoValidationError
from django.http import Http404
from rest_framework import exceptions
# from rest_framework.response import Response
from rest_framework.serializers import as_serializer_error
from rest_framework.views import exception_handler


def old_custom_exception_handler(exc, context):
    print("custom_exception_handler")
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)
    request = context.get('request', None)
    if request:
        app_name = request.resolver_match.app_name
        print(app_name)

    # Now add the HTTP status code to the response.
    if response is not None:
        response.data['status_code'] = response.status_code

    return response


# from styleguide_example.core.exceptions import ApplicationError


def custom_exception_handler(exc, context):
    request = context.get('request', None)
    if request:
        app_name = request.resolver_match.app_name
        print(app_name)

    if isinstance(exc, DjangoValidationError):
        exc = exceptions.ValidationError(as_serializer_error(exc))

    if isinstance(exc, Http404):
        exc = exceptions.NotFound()

    if isinstance(exc, PermissionDenied):
        exc = exceptions.PermissionDenied()

    response = exception_handler(exc, context)

    return response
