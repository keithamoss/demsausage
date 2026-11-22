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


def assign(pairs: Iterable[ScoredPair], min_score: float) -> list[ScoredPair]:
    """Choose at most one partner for each record without exceeding ``min_score``.

    Args:
        pairs: Candidate pairs that may connect records on the left and right.
        min_score: Minimum probability score a candidate pair must have.

    Returns:
        The selected one-to-one pairs. Candidates not chosen are left unmatched.
    """
    candidates = [p for p in pairs if p.score >= min_score]
    if not candidates:
        return []

    parent: dict[tuple[str, int], tuple[str, int]] = {}

    def find(x: tuple[str, int]) -> tuple[str, int]:
        while parent.setdefault(x, x) != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for p in candidates:
        parent[find(("l", p.left))] = find(("r", p.right))

    components: dict[tuple[str, int], list[ScoredPair]] = defaultdict(list)
    for p in candidates:
        components[find(("l", p.left))].append(p)

    chosen: list[ScoredPair] = []
    for component in components.values():
        lefts = sorted({p.left for p in component})
        rights = sorted({p.right for p in component})
        li = {v: k for k, v in enumerate(lefts)}
        ri = {v: k for k, v in enumerate(rights)}
        # Each left record can choose a real partner or an unmatched dummy.
        matrix = np.full((len(lefts), len(rights) + len(lefts)), -np.inf)
        matrix[:, len(rights):] = 0.0
        best: dict[tuple[int, int], ScoredPair] = {}
        for p in component:
            key = (li[p.left], ri[p.right])
            # A matcher may emit the same pair twice (several blocking rules); keep the best.
            if key not in best or p.assignment_value > best[key].assignment_value:
                best[key] = p
        for key, p in best.items():
            matrix[key] = p.assignment_value
        rows, cols = linear_sum_assignment(-matrix)
        for r, c in zip(rows, cols):
            if c < len(rights):
                chosen.append(best[(r, c)])
    return chosen
