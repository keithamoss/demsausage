"""One-to-one assignment of scored pairs.

Ported from docs/modernisation/experiments/shoot.py (lsa). Pairs are grouped into
connected components and each component is solved with the Hungarian algorithm
(scipy's linear_sum_assignment), so no record is linked twice and the total score
is maximised rather than taking the greediest pair first.
"""

from __future__ import annotations

from collections import defaultdict
from collections.abc import Iterable

import numpy as np
from scipy.optimize import linear_sum_assignment

from .result import ScoredPair


def assign(
    pairs: Iterable[ScoredPair], min_score: float, unmatched_value: float = 0.0
) -> list[ScoredPair]:
    """Choose one-to-one partners meeting or exceeding ``min_score``.

    Args:
        pairs: Candidate pairs that may connect records on the left and right.
        min_score: Minimum matcher score a candidate pair must have.
        unmatched_value: Utility of leaving a record unmatched, on the same scale
            as the candidate assignment values.

    Returns:
        The selected one-to-one pairs. Candidates not chosen are left unmatched.
    """
    candidates = [p for p in pairs if p.score >= min_score]
    if not candidates:
        return []

    parent: dict[tuple[str, int], tuple[str, int]] = {}

    def find(x: tuple[str, int]) -> tuple[str, int]:
        """Find a record's component root, shortening the path for later lookups.

        Args:
            x: Dataset side and record index.

        Returns:
            The identifier of the connected component.
        """
        while parent.setdefault(x, x) != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    # Solve disconnected candidate groups independently.
    for pair in candidates:
        parent[find(("l", pair.left))] = find(("r", pair.right))

    components: dict[tuple[str, int], list[ScoredPair]] = defaultdict(list)
    for p in candidates:
        components[find(("l", p.left))].append(p)

    chosen: list[ScoredPair] = []
    for component in components.values():
        lefts = sorted({p.left for p in component})
        rights = sorted({p.right for p in component})
        left_positions = {value: position for position, value in enumerate(lefts)}
        right_positions = {value: position for position, value in enumerate(rights)}
        # Each left record can choose a real partner or an unmatched dummy.
        matrix = np.full((len(lefts), len(rights) + len(lefts)), -np.inf)
        matrix[:, len(rights) :] = unmatched_value
        best: dict[tuple[int, int], ScoredPair] = {}
        for pair in component:
            key = (left_positions[pair.left], right_positions[pair.right])
            # A matcher may emit the same pair twice (several blocking rules); keep the best.
            if key not in best or pair.assignment_value > best[key].assignment_value:
                best[key] = pair
        for key, pair in best.items():
            matrix[key] = pair.assignment_value
        rows, cols = linear_sum_assignment(-matrix)
        for r, c in zip(rows, cols):
            if c < len(rights):
                chosen.append(best[(r, c)])
    return chosen
