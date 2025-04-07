from demsausage.app.sausage.impossibilities import (
    inactive_polling_places_with_an_mpp,
    polling_place_noms_attached_to_an_archived_polling_place,
    polling_place_noms_invalid_boolean_non_true,
    polling_place_noms_invalid_empty_free_text,
    polling_place_noms_invalid_more_than_just_rcos,
    polling_place_noms_invalid_only_run_out,
    polling_place_noms_not_attached_to_a_polling_place,
    polling_place_noms_with_no_noms,
    polling_places_not_active_with_noms_still_attached,
    polling_places_with_no_valid_mpp,
    stalls_attached_to_non_active_polling_place,
    stalls_noms_invalid_boolean_non_true,
    stalls_noms_invalid_empty_free_text,
    stalls_noms_invalid_more_than_just_rcos,
    stalls_noms_invalid_only_run_out,
    stalls_not_attached_to_polling_place,
    stalls_with_active_polling_places_with_no_noms,
    stalls_with_no_noms,
)
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


class ImpossibilitiesViewSet(viewsets.ViewSet):
    schema = None
    permission_classes = (IsAuthenticated,)

    @action(detail=False, methods=["get"])
    def report(self, request, format=None):
        report = []

        ######################
        # Stall Impossibilities
        ######################
        report.append(stalls_not_attached_to_polling_place())
        report.append(stalls_attached_to_non_active_polling_place())
        report.append(stalls_with_no_noms())
        report.append(stalls_noms_invalid_boolean_non_true())
        report.append(stalls_noms_invalid_more_than_just_rcos())
        report.append(stalls_noms_invalid_only_run_out())
        report.append(stalls_noms_invalid_empty_free_text())
        report.append(stalls_with_active_polling_places_with_no_noms())
        ######################
        # Stall Impossibilities (End)
        ######################

        ######################
        # Polling Place Impossibilities
        ######################
        report.append(polling_places_with_no_valid_mpp())
        report.append(inactive_polling_places_with_an_mpp())
        report.append(polling_places_not_active_with_noms_still_attached())
        ######################
        # Polling Place Impossibilities (End)
        ######################

        ######################
        # Noms Impossibilities
        ######################
        report.append(polling_place_noms_not_attached_to_a_polling_place())
        report.append(polling_place_noms_attached_to_an_archived_polling_place())
        report.append(polling_place_noms_with_no_noms())
        report.append(polling_place_noms_invalid_boolean_non_true())
        report.append(polling_place_noms_invalid_more_than_just_rcos())
        report.append(polling_place_noms_invalid_only_run_out())
        report.append(polling_place_noms_invalid_empty_free_text())
        ######################
        # Noms Impossibilities (End)
        ######################

        return Response(report)
