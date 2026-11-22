"""The interface every matcher implements."""

from __future__ import annotations

from collections.abc import Sequence
from typing import Any, Protocol

from ..records import Dataset
from ..result import ScoredPair


class Matcher(Protocol):
    """Score candidate pairs and define their confidence and assignment scale.

    The pipeline performs the exact-key pass, one-to-one assignment, and banding.
    Matchers supply pair scores and the value of leaving a record unmatched.

    Attributes:
        name: Short identifier used in reports, such as "rapidfuzz" or "splink".
        auto_threshold: Minimum score for a selected link to be confident.
        review_threshold: Minimum score eligible for linking; selected pairs below
            ``auto_threshold`` need human review.
    """

    name: str
    auto_threshold: float
    review_threshold: float

    def score(
        self,
        left: Dataset,
        right: Dataset,
        left_indices: Sequence[int],
        right_indices: Sequence[int],
    ) -> list[ScoredPair]:
        """Score candidate pairs among the requested records.

        Args:
            left: First input dataset.
            right: Second input dataset.
            left_indices: Available row indices in the first dataset.
            right_indices: Available row indices in the second dataset.

        Returns:
            Scored candidates for one-to-one assignment.
        """
        ...

    def params(self) -> dict[str, Any]:
        """Return settings worth recording alongside a result.

        Returns:
            Matcher configuration and any model provenance.
        """
        ...

    def assignment_baseline(self) -> float:
        """Return the assignment value of leaving a record unmatched.

        Returns:
            Unmatched utility on the same scale as candidate ranks or scores.
        """
        ...
