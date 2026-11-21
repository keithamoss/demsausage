import logging
from datetime import datetime, time
from zoneinfo import ZoneInfo

from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from django.utils import timezone

from demsausage.app.enums import PollingPlaceStatus
from demsausage.app.models import Elections, PollingPlaces

logger = logging.getLogger(__name__)

BENCHMARK_TIMEZONE = ZoneInfo("Australia/Perth")

# Leave these elections out until we can reliably identify their types.
EXCLUDED_EVENTS = (
    "Canning By-election 2015",
    "Batman By-election 2018",
    "Cottesloe By-election 2018",
    "Perth By-election 2018",
    "Fremantle By-election 2018",
    "Braddon By-election 2018",
    "Mayo By-election 2018",
    "Longman By-election 2018",
    "Wentworth By-election 2018",
    "Aston By-election 2023",
    "Dunkley By-election 2024",
    "NSW By-Elections 2024",
    "Secret Harbour By-election 2026",
    "Kiama By-election 2026",
    "NSW Local Govt Elections 2021",
    "QLD Local Govt Elections 2024",
    "NSW Local Government Elections 2024",
)

# These older elections have missing first-report dates. If one would normally
# be chosen, use the most recent comparable election instead; other missing
# dates do not trigger this fallback.
LATEST_REFERENCE_EXCEPTIONS = {
    ("vic", "Victorian Election 2018"),
    ("nt", "Northern Territory Election 2016"),
}


def election_calendar_day(election):
    """Get the election date on Perth's calendar.

    Args:
        election: The election whose date should be converted.

    Returns:
        The election day as a date in the Perth time zone.
    """
    return election.election_day.astimezone(BENCHMARK_TIMEZONE).date()


def _pct(numerator, denominator):
    """Turn a count and total into a percentage rounded to one decimal place.

    Args:
        numerator: The number of items counted.
        denominator: The non-zero total number of items.

    Returns:
        The percentage.

    Example:
        _pct(5, 10) returns 50.0.
    """
    return round(numerator / denominator * 100, 1)


def _benchmark_level(election):
    """Work out which election types can be compared with this one.

    Test elections and the named exclusions are not eligible. The 2014 WA
    Senate election is included alongside state elections.

    Args:
        election: The election to check.

    Returns:
        A Django query condition for matching election types, or None if the
        election is not eligible.
    """
    if election.is_test or election.name in EXCLUDED_EVENTS:
        return None

    if election.is_federal:
        return Q(is_federal=True)
    # Replace this name-based exception when election classification is added.
    if election.is_state or election.name == "WA Senate Election 2014":
        return Q(is_state=True) | Q(name="WA Senate Election 2014")
    return None


def _comparable_elections(election, level):
    """Find other visible elections in the same area and of a comparable type.

    Args:
        election: The election being compared.
        level: The matching election types from _benchmark_level.

    Returns:
        A Django queryset excluding test elections and the named exclusions.
    """
    return (
        Elections.objects.filter(
            level,
            jurisdiction=election.jurisdiction,
            is_hidden=False,
            is_test=False,
        )
        .exclude(id=election.id)
        .exclude(name__in=EXCLUDED_EVENTS)
    )


def get_benchmark_candidates(election, today=None):
    """Find past, public elections that can be compared with this one.

    They must be from the same area and election type. This election itself,
    test elections, listed exclusions, and elections on or after today or the
    election's day are left out.

    Args:
        election: The election being compared.
        today: Today's date in Perth, or None to calculate it now.

    Returns:
        A Django queryset of matching elections, each with counts of active
        polling places and active places with non-deleted information.
    """
    level = _benchmark_level(election)
    if level is None:
        return Elections.objects.none()

    if today is None:
        today = timezone.now().astimezone(BENCHMARK_TIMEZONE).date()
    before_day = min(today, election_calendar_day(election))
    start_of_today = datetime.combine(before_day, time.min, BENCHMARK_TIMEZONE)

    return (
        _comparable_elections(election, level)
        .filter(election_day__lt=start_of_today)
        .annotate(
            benchmark_total=Count(
                "pollingplaces",
                filter=Q(pollingplaces__status=PollingPlaceStatus.ACTIVE),
            ),
            benchmark_with_data=Count(
                "pollingplaces",
                filter=Q(
                    pollingplaces__status=PollingPlaceStatus.ACTIVE,
                    pollingplaces__noms__deleted=False,
                ),
            ),
        )
    )


def pick_best_election(candidates):
    """Pick the election with the highest share of active places reporting data.

    If tied, prefer the later election date.

    Args:
        candidates: Past elections with annotated counts of active polling
            places and active places with information.

    Returns:
        The best-covered election, or None if there are no candidates.

    Example:
        An election with information for 8 of 10 places wins over one with
        information for 20 of 100 places.
    """
    return max(
        candidates,
        key=lambda candidate: (
            candidate.benchmark_with_data / candidate.benchmark_total
            if candidate.benchmark_total
            else 0,
            candidate.election_day,
        ),
        default=None,
    )


def _select_reference_election(election, candidates):
    """Choose the comparison election, including the special VIC/NT rule.

    Victoria's 2018 election and the Northern Territory's 2016 election have
    missing first-report dates. If either would normally be chosen, use the
    most recent comparable past election instead. This exception does not
    apply to other elections with missing dates.

    Args:
        election: The election being compared.
        candidates: A list of comparable past elections with annotated counts.

    Returns:
        The chosen comparison election, or None if there are no candidates.
    """
    best = pick_best_election(candidates)
    if (
        best is not None
        and (election.jurisdiction, best.name) in LATEST_REFERENCE_EXCEPTIONS
    ):
        return max(candidates, key=lambda candidate: candidate.election_day)
    return best


def _calculate_benchmark(election, best, today, is_active):
    """Compare the two elections' first reports day by day.

    Reports are counted only for polling places that are currently active and
    have a non-deleted noms record. The current election has no values for days
    after today.

    Args:
        election: The election being compared.
        best: The selected past election, or None if none was found.
        today: Today's date in Perth.
        is_active: Whether the election is currently active.

    Returns:
        A pair of (result, error message). On success, the result contains
        the reference election, polling-place totals and daily counts and
        percentages, and the error message is None. On failure, the result is
        None and the message explains why the comparison is unavailable.
    """
    # Both elections need active places and first-report dates for reported noms.
    if best is None:
        return None, "There is no completed comparable election available."
    if best.benchmark_total == 0:
        return None, f"{best.name} has no active polling places."

    current_total = PollingPlaces.objects.filter(
        election=election, status=PollingPlaceStatus.ACTIVE
    ).count()
    if current_total == 0:
        return None, f"{election.name} has no active polling places."

    places_with_data = PollingPlaces.objects.filter(
        election__in=[election, best],
        status=PollingPlaceStatus.ACTIVE,
        noms__deleted=False,
    )
    missing = (
        places_with_data.filter(noms__first_report__isnull=True)
        .values_list("election__name", flat=True)
        .first()
    )
    if missing is not None:
        return (
            None,
            f"{missing} has polling places with data but no first-report timestamp.",
        )

    # Group reports by days before their own election to line up matching days.
    reports = (
        places_with_data.annotate(
            report_day=TruncDate("noms__first_report", tzinfo=BENCHMARK_TIMEZONE)
        )
        .values("election_id", "report_day")
        .annotate(count=Count("id"))
    )
    election_days = {
        election.id: election_calendar_day(election),
        best.id: election_calendar_day(best),
    }
    daily_reports = {election.id: {}, best.id: {}}
    for report in reports:
        days_out = (election_days[report["election_id"]] - report["report_day"]).days
        if days_out >= 0:
            daily_reports[report["election_id"]][days_out] = report["count"]

    # Include at least 28 days, plus any earlier reports or today's position.
    today_days_out = max((election_days[election.id] - today).days, 0)
    start = max(
        28,
        today_days_out,
        *daily_reports[election.id],
        *daily_reports[best.id],
    )
    current_count = reference_count = 0
    points = []

    # Build cumulative totals, leaving future days blank for the current election.
    for days_out in range(start, -1, -1):
        current_count += daily_reports[election.id].get(days_out, 0)
        reference_count += daily_reports[best.id].get(days_out, 0)
        current_available = days_out >= today_days_out
        points.append(
            {
                "days_out": days_out,
                "current": _pct(current_count, current_total)
                if current_available
                else None,
                "reference": _pct(reference_count, best.benchmark_total),
                "current_count": current_count if current_available else None,
                "reference_count": reference_count,
            }
        )

    return {
        "error": False,
        "election_id": best.id,
        "election_name": best.name,
        "current_total": current_total,
        "total": best.benchmark_total,
        "today_days_out": today_days_out,
        "is_active": is_active,
        "points": points,
    }, None


def _show_past_benchmark(election):
    """Check whether a past election is the latest comparable election.

    Args:
        election: An eligible election whose chart might be shown.

    Returns:
        True if there is no newer visible, non-test, comparable election;
        otherwise False. An election with a larger ID counts as newer when
        both have the same election date.
    """
    level = _benchmark_level(election)
    return not (
        _comparable_elections(election, level)
        .filter(
            Q(election_day__gt=election.election_day)
            | Q(election_day=election.election_day, id__gt=election.id)
        )
        .exists()
    )


def get_election_benchmark(election):
    """Build a live benchmark for an eligible election.

    Args:
        election: The election whose reporting progress is being compared.

    Returns:
        None if the election is ineligible or is a past election that is not
        the latest comparable one. If a comparison cannot be calculated, log
        the reason and return {"error": True}. Otherwise return the daily
        comparison, including {"error": False}, both totals and the reference
        election.
    """
    if _benchmark_level(election) is None:
        return None

    today = timezone.now().astimezone(BENCHMARK_TIMEZONE).date()
    is_active = election.is_active()
    if not is_active and not _show_past_benchmark(election):
        return None

    candidates = list(get_benchmark_candidates(election, today=today))
    best = _select_reference_election(election, candidates)
    result, error_message = _calculate_benchmark(election, best, today, is_active)

    if error_message is not None:
        logger.warning(
            "Election benchmark unavailable for %s (id=%s): %s",
            election.name,
            election.id,
            error_message,
        )
        result = {"error": True}

    return result
