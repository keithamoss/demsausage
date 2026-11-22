"""Link two files with one or more matchers: the entry point other tools use."""

from __future__ import annotations

import hashlib
from collections.abc import Callable
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .compare import compare_results
from .matchers.base import Matcher
from .matchers.rapidfuzz_lsa import RapidfuzzMatcher
from .pipeline import link
from .records import Dataset, load_csv

MATCHER_CHOICES = ("rapidfuzz", "splink", "both")


def file_sha256(path: str | Path) -> str:
    """Return the SHA-256 fingerprint of a file.

    Args:
        path: File system path to the file.

    Returns:
        A hexadecimal SHA-256 digest.
    """
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def make_matchers(which: str, splink_model: str | None = None) -> list[Matcher]:
    """Create the requested matcher instances.

    Args:
        which: ``rapidfuzz``, ``splink``, or ``both``.
        splink_model: Optional path to a Splink model JSON file.

    Returns:
        Configured matcher objects.

    Raises:
        ValueError: If ``which`` is not a supported matcher choice.
    """
    if which not in MATCHER_CHOICES:
        raise ValueError(f"matcher must be one of {MATCHER_CHOICES}")
    matchers: list[Matcher] = []
    if which in ("rapidfuzz", "both"):
        matchers.append(RapidfuzzMatcher())
    if which in ("splink", "both"):
        from .matchers.splink_matcher import SplinkMatcher

        matchers.append(SplinkMatcher(model=splink_model))
    return matchers


def dataset_summary(d: Dataset) -> dict[str, Any]:
    """Build a JSON-ready description of an input dataset.

    Args:
        d: Dataset that was loaded from a CSV file.

    Returns:
        File metadata, the column map, and source-row indices in filtered record order.
    """
    return {
        "path": d.path,
        "sha256": file_sha256(d.path),
        "records": len(d.records),
        "source_indices": [record.source_index for record in d.records],
        "columns": asdict(d.columns),
    }


def link_files(
    old: str | Path,
    new: str | Path,
    matcher: str = "both",
    id_column: str | None = None,
    splink_model: str | None = None,
    use_exact_pass: bool = True,
    row_filter: Callable[[dict[str, str]], bool] | None = None,
) -> tuple[Dataset, Dataset, dict[str, Any]]:
    """Link two CSVs. Returns both datasets and the JSON-ready output.

    The output's record indices are row positions in each file (after any
    row_filter), which is how downstream tools such as the diff find rows.
    Dataset summaries include ``source_indices`` mapping these positions back to
    the unfiltered CSV. Verdict exporters must use those stable source positions.

    Args:
        old: First CSV path.
        new: Second CSV path.
        matcher: ``rapidfuzz``, ``splink``, or ``both``.
        id_column: Optional source ID column carried through for evaluation.
        splink_model: Optional path to a trained Splink model.
        use_exact_pass: Whether unique corroborated keys are linked first.
        row_filter: Optional predicate selecting rows before indexing.

    Returns:
        Both loaded datasets and the JSON-ready linkage report.
    """
    left = load_csv(old, id_column=id_column, row_filter=row_filter)
    right = load_csv(new, id_column=id_column, row_filter=row_filter)
    results = [
        link(left, right, configured_matcher, use_exact_pass=use_exact_pass)
        for configured_matcher in make_matchers(matcher, splink_model)
    ]
    output: dict[str, Any] = {
        "created_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "left": dataset_summary(left),
        "right": dataset_summary(right),
        "row_filter": None
        if row_filter is None
        else getattr(row_filter, "__name__", "custom"),
        "results": [r.to_dict() for r in results],
    }
    if len(results) == 2:
        output["comparison"] = compare_results(results[0], results[1], left, right)
    return left, right, output
