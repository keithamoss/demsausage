"""Comparing two matchers' results on the same inputs (no ground truth needed)."""

from __future__ import annotations

from typing import Any

from .records import Dataset
from .result import LinkResult


def compare_results(a: LinkResult, b: LinkResult, left: Dataset, right: Dataset) -> dict[str, Any]:
    """Compare two matcher results and describe their disagreements.

    Args:
        a: Result from the first matcher.
        b: Result from the second matcher.
        left: Left dataset used to produce both results.
        right: Right dataset used to produce both results.

    Returns:
        Agreement counts and details for every left record with a disagreement.
    """
    la, lb = a.by_left(), b.by_left()
    agree = 0
    disagreements = []
    for record in left.records:
        x, y = la.get(record.index), lb.get(record.index)
        if x is None and y is None:
            agree += 1
            continue
        if x is not None and y is not None and x.right == y.right:
            agree += 1
            continue

        def describe(link):
            if link is None:
                return None
            return {
                "right": link.right,
                "right_label": right.records[link.right].label(),
                "score": link.score,
                "band": link.band,
                "via": link.via,
            }

        disagreements.append(
            {
                "left": record.index,
                "left_label": record.label(),
                a.matcher: describe(x),
                b.matcher: describe(y),
            }
        )
    # Right records left unmatched by one matcher but not the other show up above via
    # the left record the other matcher linked them to, so they are not repeated here.
    return {
        "matchers": [a.matcher, b.matcher],
        "left_records": len(left.records),
        "agree": agree,
        "disagree": len(disagreements),
        "disagreements": disagreements,
    }
