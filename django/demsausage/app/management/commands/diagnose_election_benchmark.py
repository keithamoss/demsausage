"""
Read-only diagnostic for the "tracking vs. best previous election" benchmark.

For each jurisdiction (state elections) and for federal elections, finds the past
election with the highest final % of polling places with data, then checks whether
the PollingPlaceNoms history is good enough to reconstruct "% with data N days out".

Usage:
    python manage.py diagnose_election_benchmark
    python manage.py diagnose_election_benchmark --days-out 28 14 7 3 1
    python manage.py diagnose_election_benchmark --include-hidden --json
"""

import json
from collections import Counter, defaultdict
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db.models import Min
from django.utils import timezone

from demsausage.app.enums import PollingPlaceStatus
from demsausage.app.models import Elections, PollingPlaceNoms, PollingPlaces

# Thresholds used to flag an election. Tune these once we've seen real output.
MIN_HISTORY_COVERAGE = 0.95  # share of with-data places that have a history row
MAX_AFTER_ELECTION_SHARE = 0.10  # first-data events dated after election day
MAX_SINGLE_DAY_SHARE = 0.40  # first-data events landing on one day (bulk import)
MAX_RECONSTRUCTION_DRIFT_PP = 0.5  # reconstructed vs stored final %, in % points
MAX_FIRST_REPORT_MISMATCH_SHARE = 0.10  # history-derived vs first_report disagree >1d


def pct(numerator, denominator):
    return round(numerator / denominator * 100, 2) if denominator else 0.0


def first_data_times(election):
    """
    Returns (places_with_data, {noms_id: first_data_datetime or None}, {noms_id: first_report}).

    "First data" is the earliest history row where the noms record was not deleted.
    """
    places = list(
        PollingPlaces.objects.filter(
            election=election, status=PollingPlaceStatus.ACTIVE, noms__isnull=False
        ).values_list("noms_id", flat=True)
    )

    history = dict(
        PollingPlaceNoms.history.filter(id__in=places, deleted=False)
        .values("id")
        .annotate(first=Min("history_date"))
        .values_list("id", "first")
    )

    first_reports = dict(
        PollingPlaceNoms.objects.filter(id__in=places).values_list("id", "first_report")
    )

    return places, history, first_reports


def diagnose(election, days_out):
    election_day = election.election_day
    status_counts = dict(
        Counter(
            PollingPlaces.objects.filter(election=election).values_list(
                "status", flat=True
            )
        )
    )
    total = status_counts.get(PollingPlaceStatus.ACTIVE, 0)
    noms_ids, history, first_reports = first_data_times(election)
    with_data = len(noms_ids)

    events = [history[i] for i in noms_ids if i in history]
    missing_history = with_data - len(events)

    after_election = sum(1 for e in events if e > election_day)
    day_counts = Counter(e.date() for e in events)
    top_day, top_day_count = day_counts.most_common(1)[0] if day_counts else (None, 0)

    mismatched_first_report = 0
    comparable = 0
    for i in noms_ids:
        fr = first_reports.get(i)
        h = history.get(i)
        if fr is not None and h is not None:
            comparable += 1
            if abs((fr - h).total_seconds()) > 86400:
                mismatched_first_report += 1

    trajectory = {}
    for d in days_out:
        cutoff = election_day - timedelta(days=d)
        trajectory[d] = pct(sum(1 for e in events if e <= cutoff), total)

    stored_pct = pct(with_data, total)
    reconstructed_final_pct = pct(len(events), total)
    earliest = min(events) if events else None

    checks = {
        "history_coverage": (
            with_data == 0 or (len(events) / with_data) >= MIN_HISTORY_COVERAGE,
            f"{len(events)}/{with_data} with-data places have a history row; "
            f"{missing_history} missing",
        ),
        "not_backfilled_after_election": (
            len(events) == 0 or after_election / len(events) <= MAX_AFTER_ELECTION_SHARE,
            f"{after_election}/{len(events)} first-data events are after election day "
            f"({pct(after_election, len(events))}%)",
        ),
        "no_single_day_bulk_import": (
            len(events) == 0 or top_day_count / len(events) <= MAX_SINGLE_DAY_SHARE,
            f"busiest day {top_day} has {top_day_count}/{len(events)} events "
            f"({pct(top_day_count, len(events))}%)",
        ),
        "history_reaches_cutoff": (
            earliest is not None
            and (election_day - earliest).days >= max(days_out),
            f"earliest first-data event is "
            f"{(election_day - earliest).days if earliest else 'n/a'} days out "
            f"(need >= {max(days_out)})",
        ),
        "reconstruction_matches_stored": (
            abs(stored_pct - reconstructed_final_pct) <= MAX_RECONSTRUCTION_DRIFT_PP,
            f"stored {stored_pct}% vs reconstructed {reconstructed_final_pct}%",
        ),
        "first_report_agrees_with_history": (
            comparable == 0
            or mismatched_first_report / comparable <= MAX_FIRST_REPORT_MISMATCH_SHARE,
            f"{mismatched_first_report}/{comparable} differ by more than 1 day",
        ),
    }

    return {
        "election": election.name,
        "election_day": election_day.date().isoformat(),
        "polling_place_status_counts": status_counts,
        "with_data": with_data,
        "total_active": total,
        "final_pct": stored_pct,
        "pct_with_data_by_days_out": trajectory,
        "checks": {k: {"ok": v[0], "detail": v[1]} for k, v in checks.items()},
        "passed": all(v[0] for v in checks.values()),
    }


class Command(BaseCommand):
    help = (
        "Diagnose whether PollingPlaceNoms history is good enough to build a "
        "days-out benchmark from each group's best-coverage past election."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--days-out",
            nargs="+",
            type=int,
            default=[56, 28, 14, 7, 3, 1, 0],
            help="Days before election day to report the reconstructed %% at.",
        )
        parser.add_argument(
            "--include-hidden",
            action="store_true",
            help="Also consider hidden elections (test elections are always excluded).",
        )
        parser.add_argument(
            "--json", action="store_true", help="Emit JSON instead of text."
        )

    def handle(self, *args, **options):
        days_out = sorted(set(options["days_out"]), reverse=True)

        qs = Elections.objects.filter(is_test=False, election_day__lt=timezone.now())
        if not options["include_hidden"]:
            qs = qs.filter(is_hidden=False)

        # Group key: ("federal", None) or ("state", jurisdiction). Elections can be
        # both flags in theory, so an election may appear in more than one group.
        groups = defaultdict(list)
        for e in qs.order_by("election_day"):
            if e.is_federal:
                groups[("federal", "aus")].append(e)
            if e.is_state:
                groups[("state", e.jurisdiction)].append(e)

        report = []
        for (level, jurisdiction), elections in sorted(groups.items()):
            scored = []
            for e in elections:
                total = PollingPlaces.objects.filter(
                    election=e, status=PollingPlaceStatus.ACTIVE
                ).count()
                with_data = PollingPlaces.objects.filter(
                    election=e, status=PollingPlaceStatus.ACTIVE, noms__isnull=False
                ).count()
                scored.append((pct(with_data, total), e))
            scored.sort(key=lambda s: s[0], reverse=True)

            best_pct, best = scored[0]
            result = diagnose(best, days_out)
            result["group"] = f"{level}:{jurisdiction}"
            result["candidates"] = [
                {"election": e.name, "final_pct": p} for p, e in scored
            ]
            report.append(result)

        if options["json"]:
            self.stdout.write(json.dumps(report, indent=2, default=str))
            return

        for r in report:
            self.stdout.write(self.style.MIGRATE_HEADING(f"\n== {r['group']} =="))
            self.stdout.write(
                "Candidates: "
                + ", ".join(f"{c['election']} ({c['final_pct']}%)" for c in r["candidates"])
            )
            self.stdout.write(
                f"Best: {r['election']} ({r['election_day']}) - "
                f"{r['with_data']}/{r['total_active']} = {r['final_pct']}%  "
                f"statuses={r['polling_place_status_counts']}"
            )
            self.stdout.write(
                "% with data by days out: "
                + ", ".join(
                    f"{d}d={v}%" for d, v in r["pct_with_data_by_days_out"].items()
                )
            )
            for name, c in r["checks"].items():
                style = self.style.SUCCESS if c["ok"] else self.style.ERROR
                self.stdout.write(
                    style(f"  [{'PASS' if c['ok'] else 'FAIL'}] {name}: {c['detail']}")
                )
            self.stdout.write(
                (self.style.SUCCESS if r["passed"] else self.style.ERROR)(
                    f"  => {'RELIABLE' if r['passed'] else 'NOT RELIABLE'}"
                )
            )
