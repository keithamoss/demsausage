from django.http import HttpResponseNotFound

from demsausage.util import make_logger

logger = make_logger(__name__)


def api_not_found(request):
    return HttpResponseNotFound()
