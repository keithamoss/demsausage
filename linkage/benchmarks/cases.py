"""Shared benchmark inputs, independent of training and report execution."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from itertools import pairwise
from pathlib import Path

from linkage.records import Dataset, load_csv

REPO = Path(__file__).resolve().parents[2]
SCRAPERS = REPO / "scrapers"
FIXTURES = REPO / "django" / "tests" / "fixtures" / "elections"


def _not_abolished(row: dict[str, str]) -> bool:
    """Select federal records not marked abolished.

    Args:
        row: Source CSV row.

    Returns:
        Whether the row should participate in linkage.
    """
    return row.get("Status") != "Abolition"


@dataclass
class Case:
    """A trusted-ID file pair and its benchmark metadata.

    Attributes:
        name: Human-readable case name.
        kind: Within-election or cross-election comparison label.
        old: First snapshot path.
        new: Second snapshot path.
        id_column: Trusted source ID header.
        note: Optional explanation of answer-key limitations.
        group: Group excluded from training when this case is evaluated.
        row_filter: Optional predicate applied before assigning row indices.
    """

    name: str
    kind: str
    old: Path
    new: Path
    id_column: str
    note: str = ""
    group: str = ""
    row_filter: Callable[[dict[str, str]], bool] | None = None

    def __post_init__(self) -> None:
        """Default the training group to the case name.

        Returns:
            None. The case's training group is filled in when omitted.
        """
        self.group = self.group or self.name

    def load(self) -> tuple[Dataset, Dataset]:
        """Load the two snapshots with the configured ID and row filter.

        Returns:
            The first and second datasets.
        """
        return (
            load_csv(self.old, id_column=self.id_column, row_filter=self.row_filter),
            load_csv(self.new, id_column=self.id_column, row_filter=self.row_filter),
        )


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
        row_filter=_not_abolished,
    ),
]


def snapshot_cases(group: str, pattern: str, id_column: str) -> list[Case]:
    """Discover consecutive snapshot pairs when a benchmark is executed.

    Args:
        group: Election label.
        pattern: Glob pattern relative to the scraper directory.
        id_column: Trusted source ID header.

    Returns:
        Consecutive file pairs in filename order.
    """
    files = sorted(SCRAPERS.glob(pattern))
    return [
        Case(
            f"{group} {old.name[:15]} -> {new.name[:15]}",
            "within election (consecutive)",
            old,
            new,
            id_column,
            group=group,
        )
        for old, new in pairwise(files)
    ]


def test_cases() -> list[Case]:
    """Discover labelled cases without doing file discovery at import time.

    Returns:
        Fixed training cases and consecutive within-election snapshot cases.
    """
    return (
        CASES
        + snapshot_cases(
            "vic_2026", "vic_2026/data/*polling places.csv", "vec_venue_id"
        )
        + snapshot_cases("sa_2025", "sa_2025/data/*polling places.csv", "id")
    )
