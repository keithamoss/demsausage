"""Hand-built matcher: weighted rapidfuzz string similarity plus distance.

Ported from docs/modernisation/experiments/shoot.py (rf_ratio, rf_score,
cand_pairs). Changes from the experiment:
- Weights are spread over the fields both datasets actually have, so a file with
  no premises or divisions isn't penalised (the experiment's divisions weight of
  0.28 was dead weight for single-area elections).
- Small inputs score every pair instead of only blocked candidates.
"""

from __future__ import annotations

from collections import defaultdict
from collections.abc import Sequence
from dataclasses import dataclass, field
from typing import Any

from rapidfuzz import fuzz

from ..normalise import distance_m
from ..records import Dataset, Record
from ..result import ScoredPair

#: Tuned on synthetic drift in docs/modernisation/experiments/tune.py.
DEFAULT_WEIGHTS = {
    "name": 0.28,
    "premises": 0.11,
    "address": 0.14,
    "geo": 0.18,
    "divisions": 0.28,
}


def text_similarity(a: str, b: str) -> float:
    """Compare two normalised text values on a 0.0 to 1.0 scale.

    Args:
        a: First normalised text value.
        b: Second normalised text value.

    Returns:
        ``1.0`` for identical values, ``0.0`` when either value is blank,
        otherwise the average of two RapidFuzz similarity scores.
    """
    if not a or not b:
        return 0.0
    if a == b:
        return 1.0
    return (fuzz.ratio(a, b) + fuzz.token_sort_ratio(a, b)) / 200


def geo_similarity(dist: float | None, full_m: float, zero_m: float) -> float:
    """Convert a geographic distance into a 0.0 to 1.0 similarity.

    Args:
        dist: Distance in metres, or ``None`` when coordinates are unknown.
        full_m: Distance at or below which similarity is 1.0.
        zero_m: Distance at or above which similarity is 0.0.

    Returns:
        1.0 for nearby places, 0.0 for distant places, or 0.5 when unknown.
    """
    if dist is None:
        return 0.5
    if dist <= full_m:
        return 1.0
    return max(0.0, 1 - (dist - full_m) / (zero_m - full_m))


def _grid(lat: float, lon: float) -> tuple[float, float]:
    """Round coordinates to the RapidFuzz candidate-blocking grid.

    Args:
        lat: Latitude value.
        lon: Longitude value.

    Returns:
        Rounded latitude and longitude values.
    """
    return round(lat, 2), round(lon, 2)


def _text_keys(record: Record) -> list[tuple[str, str]]:
    """Return non-empty text keys for candidate blocking.

    Args:
        record: Place whose normalised identity fields will be indexed.

    Returns:
        Tagged name, premises, and address keys with blanks removed.
    """
    return [
        (field, value)
        for field, value in (
            ("n", record.n_name),
            ("p", record.n_premises),
            ("a", record.n_address),
        )
        if value
    ]


@dataclass
class RapidfuzzMatcher:
    """Score places using weighted text and geographic similarity.

    Attributes:
        name: Short matcher identifier used in reports.
        auto_threshold: Scores at or above this value are confident matches.
        review_threshold: Minimum score eligible for linking; selected pairs below
            ``auto_threshold`` need human review.
        weights: Relative importance of each comparable place attribute.
        geo_full_m: Distance at which geographic similarity starts decreasing.
        geo_zero_m: Distance at which geographic similarity reaches zero.
        all_pairs_limit: Maximum pair count that is safe to compare directly.
    """

    name: str = "rapidfuzz"
    auto_threshold: float = 0.75
    review_threshold: float = 0.65
    weights: dict[str, float] = field(default_factory=lambda: dict(DEFAULT_WEIGHTS))
    geo_full_m: float = 50.0
    geo_zero_m: float = 5000.0
    #: Score every pair when left x right is at most this; otherwise use blocking.
    all_pairs_limit: int = 250_000

    def params(self) -> dict[str, Any]:
        """Return matcher settings for saved output.

        Returns:
            Thresholds, field weights, and geographic scoring settings.
        """
        return {
            "auto_threshold": self.auto_threshold,
            "review_threshold": self.review_threshold,
            "weights": self.weights,
            "geo_full_m": self.geo_full_m,
            "geo_zero_m": self.geo_zero_m,
        }

    def assignment_baseline(self) -> float:
        """Preserve assignment by total weighted similarity.

        Returns:
            Zero, the assignment value of leaving a record unmatched.
        """
        return 0.0

    def active_weights(self, left: Dataset, right: Dataset) -> dict[str, float]:
        """Spread configured weights over fields present in both datasets.

        Args:
            left: First input dataset.
            right: Second input dataset.

        Returns:
            Normalised field weights used for comparison.

        Raises:
            ValueError: If the datasets share no comparable positive-weight field.
        """
        shared = left.fields_present() & right.fields_present()
        active = {k: w for k, w in self.weights.items() if k in shared and w > 0}
        total = sum(active.values())
        if not total:
            raise ValueError("The datasets share no comparable fields")
        return {k: w / total for k, w in active.items()}

    def compare(self, a: Record, b: Record, weights: dict[str, float]) -> ScoredPair:
        """Score one record pair.

        Args:
            a: Record from the left dataset.
            b: Record from the right dataset.
            weights: Normalised weights for fields shared by both datasets.

        Returns:
            A pair containing the weighted score and field-level explanation.
        """
        dist = distance_m(a.lat, a.lon, b.lat, b.lon)
        parts: dict[str, float] = {}
        if "name" in weights:
            parts["name"] = text_similarity(a.n_name, b.n_name)
        if "premises" in weights:
            parts["premises"] = (
                text_similarity(a.n_premises, b.n_premises)
                if a.n_premises and b.n_premises
                else 0.5
            )
        if "address" in weights:
            parts["address"] = text_similarity(a.n_address, b.n_address)
        if "geo" in weights:
            parts["geo"] = geo_similarity(dist, self.geo_full_m, self.geo_zero_m)
        if "divisions" in weights:
            union = a.divisions | b.divisions
            parts["divisions"] = (
                len(a.divisions & b.divisions) / len(union) if union else 0.5
            )
        score = sum(weights[k] * v for k, v in parts.items())
        explain: dict[str, Any] = {k: round(v, 3) for k, v in parts.items()}
        explain["distance_m"] = None if dist is None else round(dist, 1)
        return ScoredPair(score=score, left=a.index, right=b.index, explain=explain)

    def candidates(
        self,
        left: Dataset,
        right: Dataset,
        left_indices: Sequence[int],
        right_indices: Sequence[int],
    ) -> set[tuple[int, int]]:
        """Find the record pairs worth comparing.

        Args:
            left: First input dataset.
            right: Second input dataset.
            left_indices: Left record indices to consider.
            right_indices: Right record indices to consider.

        Returns:
            A set of left-and-right record index pairs.
        """
        if len(left_indices) * len(right_indices) <= self.all_pairs_limit:
            return {(i, j) for i in left_indices for j in right_indices}

        # Index the right-side records once for shared text and coordinate lookups.
        right_by_key: dict[tuple[str, str] | tuple[str, float, float], list[int]] = (
            defaultdict(list)
        )
        for right_index in right_indices:
            record = right.records[right_index]
            for key in _text_keys(record):
                right_by_key[key].append(right_index)
            if record.lat is not None and record.lon is not None:
                right_by_key[("g", *_grid(record.lat, record.lon))].append(right_index)

        pairs: set[tuple[int, int]] = set()
        for left_index in left_indices:
            record = left.records[left_index]
            candidate_indices: set[int] = set()
            for key in _text_keys(record):
                candidate_indices.update(right_by_key.get(key, ()))

            # Neighbouring grid cells retain nearby places across a cell boundary.
            if record.lat is not None and record.lon is not None:
                for lat_offset in (-0.01, 0, 0.01):
                    for lon_offset in (-0.01, 0, 0.01):
                        grid_key = (
                            "g",
                            *_grid(record.lat + lat_offset, record.lon + lon_offset),
                        )
                        candidate_indices.update(right_by_key.get(grid_key, ()))
            pairs.update((left_index, j) for j in candidate_indices)
        return pairs

    def score(
        self,
        left: Dataset,
        right: Dataset,
        left_indices: Sequence[int],
        right_indices: Sequence[int],
    ) -> list[ScoredPair]:
        """Score all candidate pairs in the requested record subsets.

        Args:
            left: First input dataset.
            right: Second input dataset.
            left_indices: Left record indices still available for linking.
            right_indices: Right record indices still available for linking.

        Returns:
            Scored candidate pairs for one-to-one assignment.
        """
        weights = self.active_weights(left, right)
        return [
            self.compare(left.records[i], right.records[j], weights)
            for i, j in self.candidates(left, right, left_indices, right_indices)
        ]
