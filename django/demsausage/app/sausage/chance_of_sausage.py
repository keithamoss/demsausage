from datetime import datetime

from demsausage.app.enums import PollingPlaceChanceOfSausage, PollingPlaceStatus
from demsausage.app.models import Elections, PollingPlaces
from demsausage.app.sausage.polling_places import find_by_distance, is_noms_item_true


def _has_a_report(polling_place):
    return polling_place.noms is not None and polling_place.noms.noms is not None


def _is_a_positive_report(polling_place):
    return is_noms_item_true(polling_place, "bbq") or is_noms_item_true(
        polling_place, "cake"
    )


def _has_multiple_positive_reports(polling_places):
    count = 0
    for polling_place in polling_places:
        if _is_a_positive_report(polling_place) is True:
            count += 1

            if count >= 2:
                return True
    return False


def _has_one_positive_report(polling_places):
    for polling_place in polling_places:
        if _is_a_positive_report(polling_place) is True:
            return True
    return False


def _has_a_red_cross_of_shame(polling_place):
    return is_noms_item_true(polling_place, "nothing") is True


def _has_at_least_one_red_cross_of_shame(polling_places):
    for polling_place in polling_places:
        if is_noms_item_true(polling_place, "nothing") is True:
            return True
    return False


def _has_multiple_red_crosses_of_shame(polling_places):
    count = 0
    for polling_place in polling_places:
        if is_noms_item_true(polling_place, "nothing") is True:
            count += 1

            if count >= 2:
                return True
    return False


def _has_run_out(polling_place):
    return is_noms_item_true(polling_place, "run_out") is True


def calculate_score(polling_places):
    if _has_multiple_red_crosses_of_shame(polling_places) is True:
        if _has_one_positive_report(polling_places) is True:
            return PollingPlaceChanceOfSausage.MIXED
        return PollingPlaceChanceOfSausage.UNLIKELY
    elif _has_multiple_positive_reports(polling_places) is True:
        if _has_at_least_one_red_cross_of_shame(polling_places) is True:
            return PollingPlaceChanceOfSausage.MIXED
        return PollingPlaceChanceOfSausage.STRONG
    elif _has_one_positive_report(polling_places) is True:
        if _has_at_least_one_red_cross_of_shame(polling_places) is True:
            return PollingPlaceChanceOfSausage.MIXED
        return PollingPlaceChanceOfSausage.FAIR
    else:
        return PollingPlaceChanceOfSausage.NO_IDEA


def calculate_stats(polling_places):
    data = {
        "count_of_matching_polling_places": len(polling_places),
        "count_of_previous_reports": 0,
        "count_of_previous_reports_with_noms": 0,
        "count_of_previous_reports_with_run_out": 0,
        "count_of_previous_reports_with_rcos": 0,
        "first_positive_report": None,
        "latest_positive_report": None,
    }

    for polling_place in polling_places:
        if polling_place.noms is not None:
            if _has_a_report(polling_place):
                data["count_of_previous_reports"] += 1

            if _has_run_out(polling_place):
                data["count_of_previous_reports_with_run_out"] += 1

            if _has_a_red_cross_of_shame(polling_place):
                data["count_of_previous_reports_with_rcos"] += 1
            elif _is_a_positive_report(polling_place):
                data["count_of_previous_reports_with_noms"] += 1

                if (
                    data["first_positive_report"] is None
                    or polling_place.election.election_day
                    < data["first_positive_report"]["election_day"]
                ):
                    data["first_positive_report"] = {
                        "election_name": polling_place.election.name,
                        "election_day": polling_place.election.election_day,
                    }

                if (
                    data["latest_positive_report"] is None
                    or polling_place.election.election_day
                    > data["latest_positive_report"]["election_day"]
                ):
                    data["latest_positive_report"] = {
                        "election_name": polling_place.election.name,
                        "election_day": polling_place.election.election_day,
                    }

    data["first_positive_report"] = (
        data["first_positive_report"]["election_name"]
        if data["first_positive_report"] is not None
        else None
    )
    data["latest_positive_report"] = (
        data["latest_positive_report"]["election_name"]
        if data["latest_positive_report"] is not None
        else None
    )

    return data


def calculate_chance_of_sausage(election, polling_places):
    response = {}

    for polling_place in polling_places:
        matching_polling_places = find_by_distance(
            polling_place.geom,
            0.2,
            limit=None,
            qs=PollingPlaces.objects.filter(status=PollingPlaceStatus.ACTIVE).exclude(
                election=election
            ),
        ).order_by("election_id")

        response[polling_place.id] = (
            calculate_score(matching_polling_places)
            if len(matching_polling_places) > 0
            else None
        )

    return response


def calculate_chance_of_sausage_stats(election, polling_places):
    response = {}

    for polling_place in polling_places:
        matching_polling_places = find_by_distance(
            polling_place.geom,
            0.2,
            limit=None,
            qs=PollingPlaces.objects.filter(status=PollingPlaceStatus.ACTIVE).exclude(
                election=election
            ),
        ).order_by("election_id")

        response[polling_place.id] = calculate_stats(matching_polling_places)

    return response.values()
