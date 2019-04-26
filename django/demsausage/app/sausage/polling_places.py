from django.contrib.gis import measure
from django.contrib.gis.db.models.functions import Distance

from demsausage.util import get_or_none


def get_active_polling_place_queryset():
    from demsausage.app.models import PollingPlaces
    from demsausage.app.enums import PollingPlaceStatus

    return PollingPlaces.objects.select_related("noms").filter(status=PollingPlaceStatus.ACTIVE)


def find_by_distance(search_point, distance_threshold_km, limit, qs):
    queryset_spatial = qs.filter(geom__dwithin=(search_point, measure.Distance(km=distance_threshold_km))).annotate(distance=Distance("geom", search_point)).order_by("distance")

    if limit is not None:
        return queryset_spatial[:limit]
    else:
        return queryset_spatial


def find_by_lookup_terms(election_id, lookup_terms, queryset):
    queryset = queryset.filter(election_id=election_id)

    # 1. First, try to match a numeric lookup term against the ec_id (if this election has them)
    if lookup_terms["ec_id"] is not None and lookup_terms["ec_id"].isdigit() is True:
        qs = queryset.filter(ec_id=lookup_terms["ec_id"])
        if qs.count() == 1:
            return qs.first()

    # 2. Secondly, try to match on name, premises, and state
    if lookup_terms["name"] is not None and lookup_terms["premises"] is not None and lookup_terms["state"] is not None:
        qs = queryset.filter(name__iexact=lookup_terms["name"], premises__iexact=lookup_terms["premises"], state__iexact=lookup_terms["state"])
        if qs.count() == 1:
            return qs.first()

    return None


def find_by_stall(stall_id, queryset):
    from demsausage.app.models import Stalls

    if stall_id.isdigit() is True:
        stall = get_or_none(Stalls, id=stall_id)
        if stall is not None:
            return queryset.filter(id=stall.polling_place_id).first()

    return None


def getFoodDescription(stall):
    if stall is None or stall.noms is None:
        return ""

    descriptions = [{"key": "bbq", "descriptor": "sausage sizzle"},
                    {"key": "cake", "descriptor": "cake stall"},
                    {"key": "coffee", "descriptor": "coffee"},
                    {"key": "vego", "descriptor": "vegetarian options"},
                    {"key": "halal", "descriptor": "halal options"},
                    {"key": "bacon_and_eggs", "descriptor": "bacon and egg burgers"}]
    noms = []

    for description in descriptions:
        if description["key"] in stall.noms and stall.noms[description["key"]] is True:
            noms.append(description["descriptor"])

    if "free_text" in stall.noms and stall.noms["free_text"] is not None and len(stall.noms["free_text"]) > 0:
        noms.append("and additional options: {}".format(stall.noms["free_text"]))
    return ", ".join(noms)


def is_noms_item_true(polling_place, item):
    if polling_place.noms is not None and polling_place.noms.noms is not None:
        if item in polling_place.noms.noms:
            if type(polling_place.noms.noms[item]) == bool:
                if polling_place.noms.noms[item] is True:
                    return True
    return False
