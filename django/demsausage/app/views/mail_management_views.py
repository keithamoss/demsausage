from datetime import datetime

from demsausage.app.models import Stalls
from demsausage.app.sausage.mailgun import make_confirmation_hash, verify_webhook
from demsausage.app.serializers import MailgunEventsSerializer
from demsausage.util import get_or_none
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import APIException
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


class MailManagementViewSet(viewsets.ViewSet):
    schema = None
    permission_classes = (AllowAny,)

    @action(detail=False, methods=["get"])
    def opt_out(self, request, format=None):
        stall_id = request.query_params.get("stall_id", None)
        token = request.query_params.get("token", None)
        signature = request.query_params.get("signature", None)

        stall = get_or_none(Stalls, id=stall_id)

        if stall is None:
            raise APIException("Invalid confirmation key")

        if stall.mail_confirmed is True:
            if make_confirmation_hash(stall.id, token) != signature:
                raise APIException("Invalid confirmation key")
            else:
                stall.mail_confirmed = False
                stall.save()

        return Response(
            "No worries, we've removed you from our mailing list :)",
            content_type="text/html",
        )

    @action(detail=False, methods=["post"])
    def mailgun_webhook(self, request, format=None):
        signature_data = request.data.get("signature", None)
        if signature_data is not None:
            timestamp = int(signature_data["timestamp"])
            token = signature_data["token"]
            signature = signature_data["signature"]

        event_data = request.data.get("event-data", None)
        if event_data is not None:
            event_type = event_data["event"]

        if timestamp is None or token is None or signature is None:
            return Response({"status": 1}, status=status.HTTP_406_NOT_ACCEPTABLE)

        if verify_webhook(token, timestamp, signature) is False:
            return Response({"status": 2}, status=status.HTTP_406_NOT_ACCEPTABLE)

        serializer = MailgunEventsSerializer(
            data={
                "timestamp": datetime.utcfromtimestamp(timestamp).strftime(
                    "%Y-%m-%dT%H:%M:%S"
                ),
                "event_type": event_type,
                "payload": event_data,
            }
        )

        if serializer.is_valid() is True:
            serializer.save()
            return Response({"status": "OK"})
        else:
            raise APIException(serializer.errors)
