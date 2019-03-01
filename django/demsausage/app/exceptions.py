from rest_framework.exceptions import APIException


class BadRequest(APIException):
    status_code = 400
    default_detail = 'Bad request, fix it up and try again.'
    default_code = 'bad_request'


class DemSausageException(Exception):
    pass
