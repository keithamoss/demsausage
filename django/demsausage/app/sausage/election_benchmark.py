from collections import Counter
from datetime import timedelta

from django.core.cache import cache
from django.db.models import Count, Min, Q
from django.utils import timezone

from demsausage.app.enums import PollingPlaceStatus
from demsausage.app.models import Elections, PollingPlaceNoms, PollingPlaces

# Interim guard to keep by-elections and other small elections out of the pool
# until Elections has a proper election_type field.
MIN_BENCHMARK_POLLING_PLACES = 50

# Reliability thresholds. Keep in sync with the diagnose_election_benchmark
# command, and tune them once we've seen its output against production data.
MIN_HISTORY_COVERAGE = 0.95
MAX_AFTER_ELECTION_SHARE = 0.10
MAX_SINGLE_DAY_SHARE = 0.40
MAX_RECONSTRUCTION_DRIFT_PP = 0.5

BENCHMARK_CACHE_TIMEOUT = 60 * 60


def get_election_benchmark_cache_key(election_id, days_out):
    return f"election_{election_id}_benchmark_{days_out}_days_out"


def _pct(numerator, denominator):
    return round(numerator / denominator * 100, 1) if denominator else 0.0


def get_benchmark_candidates(election):
    "Past, visible, non-test elections at the same level and in the same jurisdiction."
    level = Q()
    if election.is_federal:
        level |= Q(is_federal=True)
    if election.is_state:
        level |= Q(is_state=True)

    if not level:
        return Elections.objects.none()

    return (
        Elections.objects.filter(
            level,
            jurisdiction=election.jurisdiction,
            is_hidden=False,
            is_test=False,
            election_day__lt=timezone.now(),
        )
        .exclude(id=election.id)
        .annotate(
            benchmark_total=Count(
                "pollingplaces",
                filter=Q(pollingplaces__status=PollingPlaceStatus.ACTIVE),
            ),
            benchmark_with_data=Count(
                "pollingplaces",
                filter=Q(
                    pollingplaces__status=PollingPlaceStatus.ACTIVE,
                    pollingplaces__noms__isnull=False,
                ),
            ),
        )
        .filter(benchmark_total__gte=MIN_BENCHMARK_POLLING_PLACES)
    )


def pick_best_election(candidates):
    best = None
    best_pct = -1.0

    for candidate in candidates:
        pct = _pct(candidate.benchmark_with_data, candidate.benchmark_total)
        if pct > best_pct:
            best, best_pct = candidate, pct

    return best


def _first_data_times(election):
    "The earliest non-deleted history row for each active polling place's noms."
    noms_ids = list(
        PollingPlaces.objects.filter(
            election=election, status=PollingPlaceStatus.ACTIVE, noms__isnull=False
        ).values_list("noms_id", flat=True)
    )

    first_by_noms = dict(
        PollingPlaceNoms.history.filter(id__in=noms_ids, deleted=False)
        .values("id")
        .annotate(first=Min("history_date"))
        .values_list("id", "first")
    )

    return noms_ids, [first_by_noms[i] for i in noms_ids if i in first_by_noms]


def history_problems(election, events, with_data, total, days_out):
    "Returns a list of reasons the election's history can't be trusted (empty if fine)."
    problems = []
    election_day = election.election_day

    if with_data and len(events) / with_data < MIN_HISTORY_COVERAGE:
        problems.append("most polling places with data have no history")

    if events:
        after = sum(1 for e in events if e > election_day)
        if after / len(events) > MAX_AFTER_ELECTION_SHARE:
            problems.append("too much data was entered after election day")

        busiest = max(Counter(e.date() for e in events).values())
        if busiest / len(events) > MAX_SINGLE_DAY_SHARE:
            problems.append("a large share of data was added on a single day")

        if (election_day - min(events)).days < days_out:
            problems.append("history doesn't go back far enough")
    else:
        problems.append("there is no history")

    if (
        abs(_pct(with_data, total) - _pct(len(events), total))
        > MAX_RECONSTRUCTION_DRIFT_PP
    ):
        problems.append("history doesn't add up to the final total")

    return problems


def get_election_benchmark(election):
    """
    How the best previous comparable election was tracking at this many days out.

    Returns None if there's nothing to compare against, an {"error": ...} dict if
    the best election's history can't be trusted, or the benchmark itself.
    """
    now = timezone.now()
    days_out = max((election.election_day - now).days, 0)

    cache_key = get_election_benchmark_cache_key(election.id, days_out)
    cached = cache.get(cache_key)
    if cached is not None:
        return cached or None

    best = pick_best_election(get_benchmark_candidates(election))

    if best is None:
        result = None
    else:
        noms_ids, events = _first_data_times(best)
        problems = history_problems(
            best, events, len(noms_ids), best.benchmark_total, days_out
        )

        if problems:
            result = {
                "error": f"The history for {best.name} can't be relied on ({'; '.join(problems)})."
            }
        else:
            cutoff = best.election_day - timedelta(days=days_out)
            with_data = sum(1 for e in events if e <= cutoff)
            result = {
                "error": None,
                "election_id": best.id,
                "election_name": best.name,
                "days_out": days_out,
                "pct": _pct(with_data, best.benchmark_total),
                "with_data": with_data,
                "total": best.benchmark_total,
            }

    # Empty dict caches "nothing to compare against" without being falsy-confused with a miss
    cache.set(cache_key, result if result is not None else {}, BENCHMARK_CACHE_TIMEOUT)
    return result
