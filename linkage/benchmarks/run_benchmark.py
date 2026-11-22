"""Benchmark both matchers on real file pairs that have a trusted ID column.

Splink is trained leave-one-dataset-out: for each test dataset, its model is
trained only on the other datasets, so it never sees the answers it's scored on.

    uv run python benchmarks/run_benchmark.py [--out benchmarks/results.json]
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from dataclasses import dataclass
from pathlib import Path

from linkage.evaluate import evaluate
from linkage.matchers.rapidfuzz_lsa import RapidfuzzMatcher
from linkage.matchers.splink_matcher import SplinkMatcher, train_from_labels
from linkage.pipeline import link
from linkage.records import Dataset, load_csv

REPO = Path(__file__).resolve().parents[2]
SCRAPERS = REPO / "scrapers"
FIXTURES = REPO / "django" / "tests" / "fixtures" / "elections"


EM_MIN_RECORDS = 200


def _not_abolished(row: dict[str, str]) -> bool:
    """Return whether a federal-election row is not marked abolished.

    Args:
        row: CSV row dictionary.

    Returns:
        ``True`` unless the row's ``Status`` is ``Abolition``.
    """
    return row.get("Status") != "Abolition"


@dataclass
class Case:
    """One trusted-ID benchmark pair and its metadata.

    Attributes:
        name: Human-readable case name.
        kind: Whether the pair is within or across elections.
        old: Path to the first snapshot.
        new: Path to the second snapshot.
        id_column: CSV column containing the trusted source ID.
        note: Optional explanation for known benchmark noise.
        group: Training group used to keep leave-one-dataset-out splits independent.
    """
    name: str
    kind: str  # "within election" or "cross election"
    old: Path
    new: Path
    id_column: str
    note: str = ""
    #: Splink is never trained on a case from the same group as the test case.
    group: str = ""

    def __post_init__(self) -> None:
        """Set a default training group from the case name."""
        self.group = self.group or self.name

    def load(self) -> tuple[Dataset, Dataset]:
        """Load this case's two datasets with the appropriate row filter.

        Returns:
            The old and new datasets.
        """
        row_filter = _not_abolished if "federal" in self.name else None
        return (
            load_csv(self.old, id_column=self.id_column, row_filter=row_filter),
            load_csv(self.new, id_column=self.id_column, row_filter=row_filter),
        )


#: One case per election: used for training (and as the first-to-last test case).
CASES = [
    Case(
        "sa_2025",
        "within election",
        SCRAPERS / "sa_2025/data/20260301_171947 polling places.csv",
        SCRAPERS / "sa_2025/data/20260320_214134 polling places.csv",
        "id",
    ),
    Case(
        "vic_2026",
        "within election",
        SCRAPERS / "vic_2026/data/20261104_204630 polling places.csv",
        SCRAPERS / "vic_2026/data/20261116_123300 polling places.csv",
        "vec_venue_id",
    ),
    Case(
        "federal_2022_2025",
        "cross election",
        FIXTURES / "federal_2022/polling_places.csv",
        FIXTURES / "federal_2025/polling_places.csv",
        "PPId",
        note="PPId is a booth ID, not a venue ID: ~25% change premises or move >100 m "
        "between elections, so 'wrong' here partly reflects a noisy answer key.",
    ),
]


def snapshot_cases(group: str, pattern: str, id_column: str) -> list[Case]:
    """Build benchmark cases from every consecutive pair in a snapshot series.

    Args:
        group: Election or scraper series name.
        pattern: Glob pattern used to find snapshot CSV files.
        id_column: Column containing the trusted source ID.

    Returns:
        Consecutive snapshot pairs, in filename order.
    """
    files = sorted(SCRAPERS.glob(pattern))
    return [
        Case(f"{group} {a.name[:15]} -> {b.name[:15]}", "within election (consecutive)", a, b, id_column, group=group)
        for a, b in zip(files, files[1:])
    ]


TEST_CASES = (
    CASES
    + snapshot_cases("vic_2026", "vic_2026/data/*polling places.csv", "vec_venue_id")
    + snapshot_cases("sa_2025", "sa_2025/data/*polling places.csv", "id")
)


def main() -> int:
    """Run benchmark cases and write metrics to a JSON file.

    Returns:
        Process exit status, always zero on success.
    """
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default=str(Path(__file__).parent / "results.json"))
    parser.add_argument("--only", help="Run only this case")
    args = parser.parse_args()

    loaded = {c.name: c.load() for c in TEST_CASES}
    models: dict[str, tuple[dict, float]] = {}
    rows = []
    for case in TEST_CASES:
        if args.only and not case.name.startswith(args.only):
            continue
        left, right = loaded[case.name]
        train_pairs = [(c.name, *loaded[c.name]) for c in CASES if c.group != case.group]
        if case.group not in models:
            t = time.time()
            models[case.group] = (train_from_labels(train_pairs), time.time() - t)
        model, train_s = models[case.group]
        matchers = [RapidfuzzMatcher(), SplinkMatcher(model=model)]
        # Unsupervised EM needs enough records to estimate from; skip it on small files.
        if min(len(left.records), len(right.records)) >= EM_MIN_RECORDS:
            matchers.append(SplinkMatcher(name="splink-em", unsupervised=True))
        for use_exact in (True, False):
            for matcher in matchers:
                t = time.time()
                result = link(left, right, matcher, use_exact_pass=use_exact)
                seconds = time.time() - t
                ev = evaluate(result, left, right)
                row = {
                    "case": case.name,
                    "kind": case.kind,
                    "note": case.note,
                    "exact_pass": use_exact,
                    "matcher": matcher.name,
                    "splink_trained_on": (
                        [g for g, _, _ in train_pairs]
                        if matcher.name == "splink"
                        else "unsupervised EM on this pair"
                        if matcher.name == "splink-em"
                        else None
                    ),
                    "seconds": round(seconds + (train_s if matcher.name == "splink" else 0), 2),
                    "records": [len(left.records), len(right.records)],
                    "counts": result.counts(),
                    **ev.to_dict(),
                }
                rows.append(row)
                print(
                    f"{case.name:42} exact={'on ' if use_exact else 'off'} {matcher.name:9} "
                    f"truth {ev.truth_pairs:5} changed {ev.changed_pairs:4} | correct {ev.correct:5} "
                    f"wrong {ev.wrong:3} (auto {ev.wrong_auto}, review {ev.wrong_review}) "
                    f"missed {ev.missed:4} | changed ok {ev.changed_correct}/{ev.changed_pairs} "
                    f"| review band ok {ev.correct_review} | false links {ev.false_links} | {row['seconds']}s",
                    flush=True,
                )
    Path(args.out).write_text(json.dumps(rows, indent=2))
    print(f"Wrote {args.out}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
