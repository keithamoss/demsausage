"""The interface every matcher implements."""

from __future__ import annotations

from collections.abc import Sequence
from typing import Any, Protocol

from ..records import Dataset
from ..result import ScoredPair


class Matcher(Protocol):
    """Scores candidate pairs between two datasets.

    The pipeline handles everything around scoring (the exact-key pass, one-to-one
    assignment and banding), so a matcher only decides how alike two records are.
    """

    #: Short identifier used in reports, e.g. "rapidfuzz" or "splink".
    name: str
    #: Scores at or above this are confident links.
    auto_threshold: float
    #: Scores at or above this (and below auto) are links that need review.
    review_threshold: float

    def score(
        self,
        left: Dataset,
        right: Dataset,
        left_indices: Sequence[int],
        right_indices: Sequence[int],
    ) -> list[ScoredPair]:
        """Score candidate pairs among the given records (indices into each dataset)."""
        ...

    def params(self) -> dict[str, Any]:
        """Settings worth recording alongside a result."""
        ...
