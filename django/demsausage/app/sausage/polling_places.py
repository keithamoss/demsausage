from demsausage.util import get_or_none

from django.contrib.gis import measure
from django.contrib.gis.db.models.functions import Distance


def get_active_polling_place_queryset():
    from demsausage.app.enums import PollingPlaceStatus
    from demsausage.app.models import PollingPlaces

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
    if lookup_terms["name"] is not None and lookup_terms["state"] is not None:
        qs = queryset.filter(name__iexact=lookup_terms["name"].replace("_", " "), state__iexact=lookup_terms["state"].replace("_", " "))
        
        # Occasionally some elections will have no premises names on polling places
        if lookup_terms["premises"] is not None:
            qs = qs.filter(premises__iexact=lookup_terms["premises"].replace("_", " "))

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
                    {"key": "vego", "descriptor": "savoury vegetarian options"},
                    {"key": "halal", "descriptor": "halal options"},
                    {"key": "bacon_and_eggs", "descriptor": "bacon and egg rolls or sandwiches"}]
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


def data_quality(election):
    # @TODO This assumes historical locations are accurate. That's a big assumption and isn't always true! (See Millers Point)
    def _does_string_partially_iexist(subject, matches):
        for match in matches:
            if subject.lower() in match.lower():
                return True
        return False

    queryset = get_active_polling_place_queryset().exclude(state="Overseas")

    report = []
    for polling_place in queryset.filter(election_id=election.id)[:5]:
        matching_polling_places = find_by_distance(polling_place.geom, 0.2, limit=None, qs=queryset.exclude(election_id=election.id)).order_by("election_id")

        premiseses = list(set(matching_polling_places.values_list("premises", flat=True)))
        names = list(set(matching_polling_places.values_list("name", flat=True)))

        matching = []
        for pp in matching_polling_places:
            matching.append({
                "name": pp.name,
                "address": pp.address,
                "premises": pp.premises,
                "election_id": pp.election_id,
                "lon": pp.geom.x,
                "lat": pp.geom.y,
                "distance_m": float(pp.distance.m),
            })

        if (len(matching_polling_places) <= 2 and _does_string_partially_iexist(polling_place.premises, premiseses + names) is False) or _does_string_partially_iexist(polling_place.premises, premiseses + names) is False:
            report.append({
                "name": polling_place.name,
                "address": polling_place.address,
                "premises": polling_place.premises,
                "lon": polling_place.geom.x,
                "lat": polling_place.geom.y,
                "count": len(matching_polling_places),
                "matching": matching,
                "matching_premiseses": premiseses,
                "matching_names": names,
            })

    return report
