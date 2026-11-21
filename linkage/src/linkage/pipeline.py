"""Linking two datasets: exact-key pass, then a matcher, then one-to-one assignment."""

from __future__ import annotations

from collections import Counter

from .assign import assign
from .matchers.base import Matcher
from .normalise import distance_m
from .records import Dataset, Record
from .result import Link, LinkResult

#: An exact-key link also needs the places to be within this distance (or share an
#: address or premises), so a reused name for a different place goes to the matcher.
EXACT_MAX_DISTANCE_M = 1000.0


def exact_key(record: Record) -> str | None:
    if not record.n_name:
        return None
    return f"{record.n_name}|{','.join(sorted(record.divisions))}"


def _corroborated(a: Record, b: Record) -> tuple[bool, dict]:
    dist = distance_m(a.lat, a.lon, b.lat, b.lon)
    same_address = bool(a.n_address) and a.n_address == b.n_address
    same_premises = bool(a.n_premises) and a.n_premises == b.n_premises
    near = dist is not None and dist <= EXACT_MAX_DISTANCE_M
    explain = {
        "distance_m": None if dist is None else round(dist, 1),
        "same_address": same_address,
        "same_premises": same_premises,
    }
    return near or same_address or same_premises, explain


def exact_pass(left: Dataset, right: Dataset) -> list[Link]:
    """Link records whose normalised name + divisions key is unique on both sides."""
    left_keys = {r.index: exact_key(r) for r in left.records}
    right_keys = {r.index: exact_key(r) for r in right.records}
    left_counts = Counter(k for k in left_keys.values() if k)
    right_counts = Counter(k for k in right_keys.values() if k)
    right_by_key = {k: i for i, k in right_keys.items() if k and right_counts[k] == 1}

    links = []
    for i, key in left_keys.items():
        if not key or left_counts[key] != 1 or key not in right_by_key:
            continue
        j = right_by_key[key]
        ok, explain = _corroborated(left.records[i], right.records[j])
        if ok:
            links.append(
                Link(left=i, right=j, score=1.0, band="auto", via="exact", explain=explain)
            )
    return links


def link(left: Dataset, right: Dataset, matcher: Matcher, use_exact_pass: bool = True) -> LinkResult:
    links = exact_pass(left, right) if use_exact_pass else []
    done_left = {x.left for x in links}
    done_right = {x.right for x in links}
    left_rest = [r.index for r in left.records if r.index not in done_left]
    right_rest = [r.index for r in right.records if r.index not in done_right]

    if left_rest and right_rest:
        scored = matcher.score(left, right, left_rest, right_rest)
        for p in assign(scored, matcher.review_threshold):
            band = "auto" if p.score >= matcher.auto_threshold else "review"
            links.append(
                Link(
                    left=p.left,
                    right=p.right,
                    score=round(p.score, 4),
                    band=band,
                    via="matcher",
                    explain=p.explain,
                )
            )

    linked_left = {x.left for x in links}
    linked_right = {x.right for x in links}
    return LinkResult(
        matcher=matcher.name,
        links=sorted(links, key=lambda x: x.left),
        unmatched_left=[r.index for r in left.records if r.index not in linked_left],
        unmatched_right=[r.index for r in right.records if r.index not in linked_right],
        params={**matcher.params(), "exact_pass": use_exact_pass},
    )
