"""Comparing two matchers' results on the same inputs (no ground truth needed)."""

from __future__ import annotations

from typing import Any

from .records import Dataset
from .result import Link, LinkResult


def _describe_link(link: Link | None, right: Dataset) -> dict[str, Any] | None:
    """Describe a match decision for a disagreement report.

    Args:
        link: Decision to describe, or ``None`` when unmatched.
        right: Dataset containing the linked record.

    Returns:
        Linked record details and confidence, or ``None``.
    """
    if link is None:
        return None
    return {
        "right": link.right,
        "right_source_index": right.records[link.right].source_index,
        "right_label": right.records[link.right].label(),
        "score": link.score,
        "band": link.band,
        "via": link.via,
    }


def compare_results(
    a: LinkResult, b: LinkResult, left: Dataset, right: Dataset
) -> dict[str, Any]:
    """Compare two matcher results and describe their disagreements.

    Args:
        a: Result from the first matcher.
        b: Result from the second matcher.
        left: Left dataset used to produce both results.
        right: Right dataset used to produce both results.

    Returns:
        Agreement counts and details for every left record with a disagreement.
    """
    first_links, second_links = a.by_left(), b.by_left()
    agree = 0
    disagreements = []
    for record in left.records:
        first = first_links.get(record.index)
        second = second_links.get(record.index)
        if first is None and second is None:
            agree += 1
            continue
        if first is not None and second is not None and first.right == second.right:
            agree += 1
            continue

        disagreements.append(
            {
                "left": record.index,
                "left_source_index": record.source_index,
                "left_label": record.label(),
                a.matcher: _describe_link(first, right),
                b.matcher: _describe_link(second, right),
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
