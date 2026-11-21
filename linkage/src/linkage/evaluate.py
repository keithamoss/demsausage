"""Scoring a LinkResult against ground truth from a trusted ID column.

The matchers never see the IDs (they only read names, premises, addresses,
coordinates and divisions), so an ID shared by both files is an independent
answer key. Only IDs that are present and unique in both files count as truth.
"""

from __future__ import annotations

from collections import Counter
from dataclasses import asdict, dataclass, field
from typing import Any

from .normalise import distance_m
from .records import Dataset, Record
from .result import LinkResult

#: A truth pair counts as "changed" if an identity field differs or it moved more
#: than this (same rule as docs/modernisation/experiments/fair3.py).
CHANGED_MOVE_M = 11.0


def truth_pairs(left: Dataset, right: Dataset) -> dict[int, int]:
    lc = Counter(r.source_id for r in left.records if r.source_id)
    rc = Counter(r.source_id for r in right.records if r.source_id)
    right_by_id = {r.source_id: r.index for r in right.records if r.source_id and rc[r.source_id] == 1}
    return {
        r.index: right_by_id[r.source_id]
        for r in left.records
        if r.source_id and lc[r.source_id] == 1 and r.source_id in right_by_id
    }


def is_changed(a: Record, b: Record) -> bool:
    dist = distance_m(a.lat, a.lon, b.lat, b.lon)
    return (
        a.n_name != b.n_name
        or a.n_premises != b.n_premises
        or a.n_address != b.n_address
        or (dist is not None and dist > CHANGED_MOVE_M)
    )


@dataclass
class Evaluation:
    matcher: str
    truth_pairs: int
    changed_pairs: int
    links: int
    correct: int
    wrong: int
    missed: int
    changed_correct: int
    wrong_auto: int
    wrong_review: int
    correct_review: int
    #: Links where the left record has no truth partner (true removals linked to something).
    false_links: int
    examples: dict[str, list[dict[str, Any]]] = field(default_factory=dict)

    @property
    def precision(self) -> float:
        return self.correct / self.links if self.links else 1.0

    @property
    def recall(self) -> float:
        return self.correct / self.truth_pairs if self.truth_pairs else 1.0

    def to_dict(self) -> dict[str, Any]:
        out = asdict(self)
        out["precision"] = round(self.precision, 5)
        out["recall"] = round(self.recall, 5)
        return out


def evaluate(result: LinkResult, left: Dataset, right: Dataset, max_examples: int = 10) -> Evaluation:
    truth = truth_pairs(left, right)
    changed = {i for i, j in truth.items() if is_changed(left.records[i], right.records[j])}
    examples: dict[str, list[dict[str, Any]]] = {"wrong": [], "missed": [], "review": []}

    def example(i: int, j: int | None, **extra) -> dict[str, Any]:
        return {
            "left": left.records[i].label(),
            "right": right.records[j].label() if j is not None else None,
            **extra,
        }

    correct = wrong = wrong_auto = wrong_review = correct_review = false_links = changed_correct = 0
    linked_left = set()
    for x in result.links:
        linked_left.add(x.left)
        expected = truth.get(x.left)
        if expected is None:
            # No truth partner: the record was removed (or its ID is unusable), so we
            # can only judge it wrong if it took a right record that has a truth partner.
            if x.right in truth.values():
                false_links += 1
            continue
        if x.right == expected:
            correct += 1
            changed_correct += x.left in changed
            if x.band == "review":
                correct_review += 1
                if len(examples["review"]) < max_examples:
                    examples["review"].append(example(x.left, x.right, score=x.score))
        else:
            wrong += 1
            if x.band == "auto":
                wrong_auto += 1
            else:
                wrong_review += 1
            if len(examples["wrong"]) < max_examples:
                examples["wrong"].append(
                    example(
                        x.left,
                        x.right,
                        should_be=right.records[expected].label(),
                        score=x.score,
                        band=x.band,
                        via=x.via,
                    )
                )
    missed_ids = [i for i in truth if i not in linked_left]
    for i in missed_ids[:max_examples]:
        examples["missed"].append(example(i, truth[i]))

    return Evaluation(
        matcher=result.matcher,
        truth_pairs=len(truth),
        changed_pairs=len(changed),
        links=sum(1 for x in result.links if x.left in truth),
        correct=correct,
        wrong=wrong,
        missed=len(missed_ids),
        changed_correct=changed_correct,
        wrong_auto=wrong_auto,
        wrong_review=wrong_review,
        correct_review=correct_review,
        false_links=false_links,
        examples=examples,
    )
