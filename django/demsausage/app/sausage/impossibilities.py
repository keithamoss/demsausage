import datetime

from demsausage.app.enums import MetaPollingPlaceStatus, PollingPlaceStatus, StallStatus
from demsausage.app.models import PollingPlaceNoms, PollingPlaces, Stalls

from django.db.models import Count, Q

# All elections from WA 2025 onwards
min_election_date = datetime.datetime(2025, 1, 1)
min_noms_id = 17066


######################
# Stall Impossibilities
######################
def get_stalls_not_attached_to_polling_place():
    return Stalls.objects.filter(election__election_day__gte=min_election_date).filter(
        polling_place_id=None
    )


def stalls_not_attached_to_polling_place():
    queryset = get_stalls_not_attached_to_polling_place()
    count = queryset.count()

    return {
        "type": "stalls_not_attached_to_polling_place",
        "name": "Submissions not attached to a polling place",
        "passed": count == 0,
        "message": f"{count} submissions aren't attached to a polling place",
        "ids": queryset.values_list("id", flat=True),
    }


def get_stalls_attached_to_non_active_polling_place():
    return (
        Stalls.objects.filter(election__election_day__gte=min_election_date)
        .exclude(polling_place__status=PollingPlaceStatus.ACTIVE)
        .exclude(polling_place_id=None)
    )


def stalls_attached_to_non_active_polling_place():
    queryset = get_stalls_attached_to_non_active_polling_place()
    count = queryset.count()

    return {
        "type": "stalls_attached_to_non_active_polling_place",
        "name": "Submissions not attached to an active polling place",
        "passed": count == 0,
        "message": f"{count} submissions aren't attached to an active polling place",
        "ids": queryset.values_list("id", flat=True),
    }


def get_stalls_with_no_noms():
    return Stalls.objects.filter(election__election_day__gte=min_election_date).filter(
        Q(noms__isnull=True) | Q(noms__exact={})
    )


def stalls_with_no_noms():
    queryset = get_stalls_with_no_noms()
    count = queryset.count()

    return {
        "type": "stalls_with_no_noms",
        "name": "Submissions with no noms",
        "passed": count == 0,
        "message": f"{count} submissions have no noms",
        "ids": queryset.values_list("id", flat=True),
    }


def get_stalls_with_active_polling_places_with_no_noms():
    return (
        Stalls.objects.filter(election__election_day__gte=min_election_date)
        .exclude(status__in=[StallStatus.DECLINED, StallStatus.PENDING])
        .filter(polling_place__status=PollingPlaceStatus.ACTIVE)
        .filter(polling_place__noms=None)
    )


def stalls_with_active_polling_places_with_no_noms():
    queryset = get_stalls_with_active_polling_places_with_no_noms()
    count = queryset.count()

    return {
        "type": "stalls_with_active_polling_places_with_no_noms",
        "name": "Submissions attached to an active polling place with no noms record",
        "passed": count == 0,
        "message": f"{count} submissions are attached to an active polling place with no noms record",
        "ids": queryset.values_list("id", flat=True),
    }


def get_stalls_noms_invalid_boolean_non_true():
    return Stalls.objects.filter(election__election_day__gte=min_election_date).all()


def stalls_noms_invalid_boolean_non_true():
    queryset = get_stalls_noms_invalid_boolean_non_true()
    ids = []
    count = 0

    for stall in queryset:
        if False in stall.noms.values():
            ids.append(stall.id)
            count += 1

    return {
        "type": "stalls_noms_invalid_boolean_non_true",
        "name": "Submission noms with a non-boolean true value where there should only be true",
        "passed": count == 0,
        "message": f"{count} submission noms have a non-boolean true value where there should only be true",
        "ids": ids,
    }


def get_stalls_noms_invalid_more_than_just_rcos():
    return Stalls.objects.filter(election__election_day__gte=min_election_date).filter(
        noms__nothing=True
    )


def stalls_noms_invalid_more_than_just_rcos():
    queryset = get_stalls_noms_invalid_more_than_just_rcos()
    ids = []
    count = 0

    for stall in queryset:
        if len(stall.noms.keys()) > 1:
            ids.append(stall.id)
            count += 1

    return {
        "type": "stalls_noms_invalid_more_than_just_rcos",
        "name": "Submission noms with a Red Cross of Shame and also something else",
        "passed": count == 0,
        "message": f"{count} submission noms have a Red Cross of Shame and also something else",
        "ids": ids,
    }


def get_stalls_noms_invalid_only_run_out():
    return Stalls.objects.filter(election__election_day__gte=min_election_date).filter(
        noms__run_out=True
    )


def stalls_noms_invalid_only_run_out():
    queryset = get_stalls_noms_invalid_only_run_out()
    ids = []
    count = 0

    for stall in queryset:
        if len(stall.noms.keys()) == 1:
            ids.append(stall.id)
            count += 1

    return {
        "type": "stalls_noms_invalid_only_run_out",
        "name": "Submission noms have a Run Out and nothing else",
        "passed": count == 0,
        "message": f"{count} submission place noms have a Run Out and nothing else",
        "ids": ids,
    }


def get_stalls_noms_invalid_empty_free_text():
    return Stalls.objects.filter(election__election_day__gte=min_election_date).filter(
        Q(noms__free_text=None) | Q(noms__free_text="")
    )


def stalls_noms_invalid_empty_free_text():
    queryset = get_stalls_noms_invalid_empty_free_text()
    count = queryset.count()

    return {
        "type": "stalls_noms_invalid_empty_free_text",
        "name": "Submission noms have an empty free_text field",
        "passed": count == 0,
        "message": f"{count} submission noms have an empty free_text field",
        "ids": queryset.values_list("id", flat=True),
    }


######################
# Stall Impossibilities (End)
######################


######################
# Polling Place Impossibilities
######################
def get_meta_polling_places_used_more_than_once_in_an_election():
    return (
        PollingPlaces.objects.filter(election__election_day__gte=min_election_date)
        .filter(status=PollingPlaceStatus.ACTIVE)
        .values("election", "meta_polling_place")
        .annotate(count=Count("id"))
        .filter(count__gte=2)
    )


def meta_polling_places_used_more_than_once_in_an_election():
    queryset = get_meta_polling_places_used_more_than_once_in_an_election()
    print(queryset.values("election", "meta_polling_place", "count"))
    count = queryset.count()

    return {
        "type": "meta_polling_places_used_twice_in_an_election",
        "name": "Meta polling places used more than once in an election",
        "passed": count == 0,
        "message": f"{count} meta polling places used more than once in an election",
        "ids": queryset.values_list("meta_polling_place", flat=True),
    }


def get_polling_places_with_no_valid_mpp():
    return (
        PollingPlaces.objects.filter(election__election_day__gte=min_election_date)
        .filter(status=PollingPlaceStatus.ACTIVE)
        .filter(
            Q(meta_polling_place__isnull=True)
            | Q(meta_polling_place__status=MetaPollingPlaceStatus.RETIRED)
        )
    )


def polling_places_with_no_valid_mpp():
    queryset = get_polling_places_with_no_valid_mpp()
    count = queryset.count()

    return {
        "type": "polling_places_with_no_active_mpp",
        "name": "Active polling places without a valid MPP attached",
        "passed": count == 0,
        "message": f"{count} active polling places without a valid MPP attached",
        "ids": queryset.values_list("id", flat=True),
    }


def get_inactive_polling_places_with_an_mpp():
    return (
        PollingPlaces.objects.filter(election__election_day__gte=min_election_date)
        .exclude(status=PollingPlaceStatus.ACTIVE)
        .filter(meta_polling_place__isnull=False)
    )


def inactive_polling_places_with_an_mpp():
    queryset = get_inactive_polling_places_with_an_mpp()
    count = queryset.count()

    return {
        "type": "inactive_polling_places_with_an_mpp",
        "name": "Inactive polling places with an MPP attached",
        "passed": count == 0,
        "message": f"{count} inactive polling places with MPP attached",
        "ids": queryset.values_list("id", flat=True),
    }


def get_polling_places_not_active_with_noms_still_attached():
    return (
        PollingPlaces.objects.filter(election__election_day__gte=min_election_date)
        .exclude(status=PollingPlaceStatus.ACTIVE)
        .filter(noms__isnull=False)
    )


def polling_places_not_active_with_noms_still_attached():
    queryset = get_polling_places_not_active_with_noms_still_attached()
    count = queryset.count()

    return {
        "type": "polling_places_not_active_with_noms_still_attached",
        "name": "Inactive polling places with noms still attached",
        "passed": count == 0,
        "message": f"{count} inactive polling places still have noms attached",
        "ids": queryset.values_list("id", flat=True),
    }


######################
# Polling Place Impossibilities (End)
######################


######################
# Noms Impossibilities
######################
def get_polling_place_noms_not_attached_to_a_polling_place():
    # We can't filter by min_election_date here because they're not attached to anything
    nomsIds = PollingPlaceNoms.objects.filter(id__gte=min_noms_id).values_list(
        "id", flat=True
    )
    pollingPlaceNomsIds = PollingPlaces.objects.filter(
        noms_id__gte=min_noms_id
    ).values_list("noms_id", flat=True)

    return PollingPlaceNoms.objects.filter(
        id__in=list(set(nomsIds).difference(pollingPlaceNomsIds))
    )


def polling_place_noms_not_attached_to_a_polling_place():
    queryset = get_polling_place_noms_not_attached_to_a_polling_place()
    count = queryset.count()

    return {
        "type": "polling_place_noms_not_attached_to_a_polling_place",
        "name": "Polling place noms records not attached to a polling place",
        "passed": count == 0,
        "message": f"{count} polling place noms records aren't attached to a polling place",
        "ids": queryset.values_list("id", flat=True),
    }


def get_polling_place_noms_attached_to_an_archived_polling_place():
    return (
        PollingPlaceNoms.objects.filter(
            polling_place__election__election_day__gte=min_election_date
        )
        .filter(polling_place__isnull=False)
        .exclude(polling_place__status=PollingPlaceStatus.ACTIVE)
    )


def polling_place_noms_attached_to_an_archived_polling_place():
    queryset = get_polling_place_noms_attached_to_an_archived_polling_place()
    count = queryset.count()

    return {
        "type": "polling_place_noms_attached_to_an_archived_polling_place",
        "name": "Polling place noms records are attached to an archived polling place",
        "passed": count == 0,
        "message": f"{count} polling place noms records aren't attached to an archived polling place",
        "ids": queryset.values_list("id", flat=True),
    }


def get_polling_place_noms_with_no_noms():
    return PollingPlaceNoms.objects.filter(
        polling_place__election__election_day__gte=min_election_date
    ).filter(Q(noms__isnull=True) | Q(noms__exact={}))


def polling_place_noms_with_no_noms():
    queryset = get_polling_place_noms_with_no_noms()
    count = queryset.count()

    return {
        "type": "polling_place_noms_with_no_noms",
        "name": "Polling place noms records with no noms",
        "passed": count == 0,
        "message": f"{count} polling place noms records have no noms",
        "ids": queryset.values_list("id", flat=True),
    }


def get_polling_place_noms_invalid_boolean_non_true():
    return PollingPlaceNoms.objects.filter(
        polling_place__election__election_day__gte=min_election_date
    ).all()


def polling_place_noms_invalid_boolean_non_true():
    queryset = get_polling_place_noms_invalid_boolean_non_true()
    ids = []
    count = 0

    for pollingPlaceNoms in queryset:
        if False in pollingPlaceNoms.noms.values():
            ids.append(pollingPlaceNoms.id)
            count += 1

    return {
        "type": "polling_place_noms_invalid_boolean_non_true",
        "name": "Polling place noms records a non-boolean true value where there should only be true",
        "passed": count == 0,
        "message": f"{count} polling place noms records have a non-boolean true value where there should only be true",
        "ids": ids,
    }


def get_polling_place_noms_invalid_more_than_just_rcos():
    return PollingPlaceNoms.objects.filter(
        polling_place__election__election_day__gte=min_election_date
    ).filter(noms__nothing=True)


def polling_place_noms_invalid_more_than_just_rcos():
    queryset = get_polling_place_noms_invalid_more_than_just_rcos()
    ids = []
    count = 0

    for pollingPlaceNoms in queryset:
        if len(pollingPlaceNoms.noms.keys()) > 1:
            ids.append(pollingPlaceNoms.id)
            count += 1

    return {
        "type": "polling_place_noms_invalid_more_than_just_rcos",
        "name": "Polling place noms records have a Red Cross of Shame and also something else",
        "passed": count == 0,
        "message": f"{count} polling place noms records have a Red Cross of Shame and also something else",
        "ids": ids,
    }


def get_polling_place_noms_invalid_only_run_out():
    return PollingPlaceNoms.objects.filter(
        polling_place__election__election_day__gte=min_election_date
    ).filter(noms__run_out=True)


def polling_place_noms_invalid_only_run_out():
    queryset = get_polling_place_noms_invalid_only_run_out()
    ids = []
    count = 0

    for pollingPlaceNoms in queryset:
        if len(pollingPlaceNoms.noms.keys()) == 1:
            ids.append(pollingPlaceNoms.id)
            count += 1

    return {
        "type": "polling_place_noms_invalid_only_run_out",
        "name": "Polling place noms records have a Run Out and nothing else",
        "passed": count == 0,
        "message": f"{count} polling place noms records have a Run Out and nothing else",
        "ids": ids,
    }


def get_polling_place_noms_invalid_empty_free_text():
    return PollingPlaceNoms.objects.filter(
        polling_place__election__election_day__gte=min_election_date
    ).filter(Q(noms__free_text=None) | Q(noms__free_text=""))


def polling_place_noms_invalid_empty_free_text():
    queryset = get_polling_place_noms_invalid_empty_free_text()
    count = queryset.count()

    return {
        "type": "polling_place_noms_invalid_empty_free_text",
        "name": "Polling place noms records have an empty free_text field",
        "passed": count == 0,
        "message": f"{count} polling place noms records have an empty free_text field",
        "ids": queryset.values_list("id", flat=True),
    }


######################
# Noms Impossibilities (End)
######################
