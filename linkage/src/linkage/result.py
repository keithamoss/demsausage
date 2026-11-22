"""The output of linking two datasets, shared by every matcher."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any, Literal

Band = Literal["auto", "review"]
Via = Literal["exact", "matcher"]


@dataclass(frozen=True)
class ScoredPair:
    """A candidate pair scored by a matcher. Higher is more likely the same place.

    `score` is what thresholds and bands use. `rank`, if set, is what one-to-one
    assignment maximises instead: Splink's probabilities saturate at 1.0, so two
    competing pairs can tie on score while their match weights differ a lot.

    Attributes:
        score: Matcher score used for thresholds and confidence bands.
        left: Row index in the left dataset.
        right: Row index in the right dataset.
        explain: Field-level evidence used in reports.
        rank: Optional assignment utility on the matcher's own scale.
    """

    score: float
    left: int
    right: int
    explain: dict[str, Any] = field(default_factory=dict)
    rank: float | None = None

    @property
    def assignment_value(self) -> float:
        """Return the value used to optimise one-to-one assignment.

        Returns:
            The matcher's rank when supplied, otherwise its score.
        """
        return self.score if self.rank is None else self.rank


@dataclass(frozen=True)
class Link:
    """A decision that left record `left` and right record `right` are the same place.

    `band` is "auto" (confident) or "review" (plausible, needs a human look).
    `via` is "exact" (shared exact-key pass) or "matcher" (the named matcher).

    Attributes:
        left: Row index in the left dataset.
        right: Row index in the right dataset.
        score: Matcher score, rounded for reporting.
        band: Confidence or human-review classification.
        via: Whether the shared exact pass or matcher produced the link.
        explain: Evidence supporting the link.
    """

    left: int
    right: int
    score: float
    band: Band
    via: Via
    explain: dict[str, Any] = field(default_factory=dict)


@dataclass
class LinkResult:
    """The complete result of applying one matcher to two datasets.

    Attributes:
        matcher: Short name of the matcher that produced the result.
        links: One-to-one decisions for records considered the same place.
        unmatched_left: Row indices that remain unmatched in the left dataset.
        unmatched_right: Row indices that remain unmatched in the right dataset.
        params: Matcher settings recorded alongside the decisions.
    """

    matcher: str
    links: list[Link]
    unmatched_left: list[int]
    unmatched_right: list[int]
    params: dict[str, Any] = field(default_factory=dict)

    def by_left(self) -> dict[int, Link]:
        """Index linked decisions by left record index.

        Returns:
            Mapping from left record index to its link decision.
        """
        return {link.left: link for link in self.links}

    def by_right(self) -> dict[int, Link]:
        """Index linked decisions by right record index.

        Returns:
            Mapping from right record index to its link decision.
        """
        return {link.right: link for link in self.links}

    def counts(self) -> dict[str, int]:
        """Summarise link decisions and unmatched records.

        Returns:
            Counts for total, exact, automatic, review, and unmatched links.
        """
        return {
            "links": len(self.links),
            "exact": sum(1 for x in self.links if x.via == "exact"),
            "auto": sum(1 for x in self.links if x.band == "auto"),
            "review": sum(1 for x in self.links if x.band == "review"),
            "unmatched_left": len(self.unmatched_left),
            "unmatched_right": len(self.unmatched_right),
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> LinkResult:
        """Restore a result from saved linkage output.

        Args:
            data: Dictionary previously produced by ``to_dict()``.

        Returns:
            The restored link result.
        """
        return cls(
            matcher=data["matcher"],
            links=[Link(**link) for link in data["links"]],
            unmatched_left=list(data["unmatched_left"]),
            unmatched_right=list(data["unmatched_right"]),
            params=data.get("params", {}),
        )

    def to_dict(self) -> dict[str, Any]:
        """Convert the result into JSON-ready data.

        Returns:
            Matcher settings, counts, links, and unmatched record indices.
        """
        return {
            "matcher": self.matcher,
            "params": self.params,
            "counts": self.counts(),
            "links": [asdict(link) for link in self.links],
            "unmatched_left": self.unmatched_left,
            "unmatched_right": self.unmatched_right,
        }
