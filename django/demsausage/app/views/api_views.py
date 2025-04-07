from demsausage.util import make_logger

from django.http import HttpResponseNotFound

logger = make_logger(__name__)


def api_not_found(request):
    return HttpResponseNotFound()
