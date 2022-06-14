from rest_framework.exceptions import APIException
from rest_framework import status


class NoInitialDataError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'No data was passed'
    default_code = 'error'


class NoFixtureError(APIException):
    message = 'No fixture found'
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Nenhum hidrante encontrado'
    default_code = 'invalid'


class NoActiveFixtureFound(APIException):
    message = 'No active fixture found'
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Nenhum hidrante ativo encontrado'
    default_code = 'invalid'


class PathNotLeadingToReservoir(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Encontrado caminhos que não levam ao reervatório'
    default_code = 'invalid'


class MoreThenOneReservoir(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Mais de um reservatório encontrado"
    default_code = 'invalid'


class NoReservoir(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Nenhum reservatório encontrado'
    default_code = 'invalid'
