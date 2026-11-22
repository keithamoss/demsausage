"""Scoring a LinkResult against ground truth from a trusted ID column.

The matchers never see the IDs (they only read names, premises, addresses,
coordinates and divisions), so an ID shared by both files is an independent
answer key. Only IDs that are present and unique in both files count as truth.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any

from .normalise import distance_m
from .records import Dataset, Record
from .result import LinkResult

#: A truth pair counts as "changed" if an identity field differs or it moved more
#: than this (same rule as docs/modernisation/experiments/fair3.py).
CHANGED_MOVE_M = 11.0


def truth_pairs(left: Dataset, right: Dataset) -> dict[int, int]:
    """Map uniquely shared trusted IDs to their row indices.

    Args:
        left: Dataset containing source IDs.
        right: Dataset containing source IDs.

    Returns:
        A mapping from left record index to matching right record index.
    """
    left_by_id = left.unique_source_ids()
    right_by_id = right.unique_source_ids()
    return {
        index: right_by_id[source_id]
        for source_id, index in left_by_id.items()
        if source_id in right_by_id
    }


def is_changed(a: Record, b: Record) -> bool:
    """Return whether a truth pair represents a meaningful changed place.

    Args:
        a: Record in the first dataset.
        b: Matching record in the second dataset.

    Returns:
        ``True`` if a name, premises, address, or position changed.
    """
    dist = distance_m(a.lat, a.lon, b.lat, b.lon)
    return (
        a.n_name != b.n_name
        or a.n_premises != b.n_premises
        or a.n_address != b.n_address
        or (dist is not None and dist > CHANGED_MOVE_M)
    )


@dataclass
class Evaluation:
    """Metrics and sample examples produced when checking a result against IDs.

    Attributes:
        matcher: Name of the matcher being evaluated.
        truth_pairs: Number of usable trusted identity pairs.
        changed_pairs: Number of truth pairs that represent meaningful changes.
        links: Number of matcher links that have a usable truth partner.
        correct: Number of links that matched the trusted right record.
        wrong: Number of links that chose the wrong right record.
        missed: Number of trusted left records that were not linked.
        changed_correct: Number of changed truth pairs linked correctly.
        wrong_auto: Wrong links placed in the confident band.
        wrong_review: Wrong links placed in the review band.
        correct_review: Correct links placed in the review band.
        false_links: Links without usable left IDs that steal a trusted right partner.
        examples: Small lists of wrong, missed, and review examples for reports.
    """

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
    #: Links without a truth partner that take a right record with a truth partner.
    false_links: int
    examples: dict[str, list[dict[str, Any]]] = field(default_factory=dict)

    @property
    def precision(self) -> float:
        """Return correct links divided by all judged links.

        Returns:
            Precision as a value from 0.0 to 1.0.
        """
        judged_links = self.links + self.false_links
        return self.correct / judged_links if judged_links else 1.0

    @property
    def recall(self) -> float:
        """Return correct links divided by all usable truth pairs.

        Returns:
            Recall as a value from 0.0 to 1.0.
        """
        return self.correct / self.truth_pairs if self.truth_pairs else 1.0

    def to_dict(self) -> dict[str, Any]:
        """Convert metrics to a JSON-ready dictionary.

        Returns:
            Dataclass fields plus rounded precision and recall values.
        """
        out = asdict(self)
        out["precision"] = round(self.precision, 5)
        out["recall"] = round(self.recall, 5)
        return out


def evaluate(
    result: LinkResult, left: Dataset, right: Dataset, max_examples: int = 10
) -> Evaluation:
    """Score a link result against trusted IDs shared by both datasets.

    Args:
        result: Link decisions produced by a matcher.
        left: Dataset containing the trusted left IDs.
        right: Dataset containing the trusted right IDs.
        max_examples: Maximum number of examples retained for each report category.

    Returns:
        Counts and representative examples describing matcher accuracy.
    """
    truth = truth_pairs(left, right)
    trusted_right_indices = set(truth.values())
    changed = {
        i for i, j in truth.items() if is_changed(left.records[i], right.records[j])
    }
    examples: dict[str, list[dict[str, Any]]] = {
        "wrong": [],
        "missed": [],
        "review": [],
    }

    def example(
        left_index: int, right_index: int | None, **extra: Any
    ) -> dict[str, Any]:
        """Describe a pair for a report example.

        Args:
            left_index: Left row index.
            right_index: Right row index, or ``None`` when unmatched.
            extra: Additional score or decision details.

        Returns:
            Human-readable place labels and the supplied details.
        """
        return {
            "left": left.records[left_index].label(),
            "right": (
                right.records[right_index].label() if right_index is not None else None
            ),
            **extra,
        }

    correct = wrong = false_links = 0
    wrong_auto = wrong_review = correct_review = 0
    changed_correct = 0
    linked_left = set()
    for decision in result.links:
        linked_left.add(decision.left)
        expected = truth.get(decision.left)
        if expected is None:
            # No truth partner: the record was removed (or its ID is unusable), so we
            # can only judge it wrong if it took a right record that has a truth partner.
            if decision.right in trusted_right_indices:
                false_links += 1
            continue

        if decision.right == expected:
            correct += 1
            changed_correct += decision.left in changed
            if decision.band == "review":
                correct_review += 1
                if len(examples["review"]) < max_examples:
                    examples["review"].append(
                        example(decision.left, decision.right, score=decision.score)
                    )
        else:
            wrong += 1
            if decision.band == "auto":
                wrong_auto += 1
            else:
                wrong_review += 1
            if len(examples["wrong"]) < max_examples:
                examples["wrong"].append(
                    example(
                        decision.left,
                        decision.right,
                        should_be=right.records[expected].label(),
                        score=decision.score,
                        band=decision.band,
                        via=decision.via,
                    )
                )
    missed_indices = [index for index in truth if index not in linked_left]
    for index in missed_indices[:max_examples]:
        examples["missed"].append(example(index, truth[index]))

    return Evaluation(
        matcher=result.matcher,
        truth_pairs=len(truth),
        changed_pairs=len(changed),
        links=sum(1 for decision in result.links if decision.left in truth),
        correct=correct,
        wrong=wrong,
        missed=len(missed_indices),
        changed_correct=changed_correct,
        wrong_auto=wrong_auto,
        wrong_review=wrong_review,
        correct_review=correct_review,
        false_links=false_links,
        examples=examples,
    )
