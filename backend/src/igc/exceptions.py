from rest_framework.exceptions import APIException
from rest_framework import status


class NoInitialDataError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'No data was passed'
    default_code = 'error'


class NoGasError(APIException):
    message = 'No gas found'
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Nenhum gás encontrado.'
    default_code = 'invalid'


class PathNotLeadingToReservoir(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Encontrado caminhos que não levam ao reservatório.'
    default_code = 'invalid'


class MoreThenOneReservoir(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Mais de um reservatório encontrado.'
    default_code = 'invalid'


class NoReservoir(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Nenhum reservatório encontrado.'
    default_code = 'invalid'


class CalculeNotImplemented(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Este cálculo ainda não foi implementado.'
    default_code = 'invalid'


class CouldNotFinishCalculate(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Erro desconhecido. O cálculo não pode ser finalizado.'
    default_code = 'invalid'

    def __init__(self, message: str, detail=None, code=None):
        if detail is None:
            detail = message
        super(CouldNotFinishCalculate, self).__init__(detail, code)
