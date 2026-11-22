"""Checks against the polling place loader, using the loader's own rules.

Both checks apply the election's config.json with
django/demsausage/app/sausage/loader_rules.py, the same functions the loader runs
(it has no Django dependency), so they can't drift from what the loader does:

- fix_audit: each existing fix_data_issues entry, checked against the new scrape.
- load_problems: rows the loader would reject, as far as can be checked without the
  database (required fields, allowed values, coordinates, cleaning regexes).
"""

from __future__ import annotations

import copy
import json
import sys
from pathlib import Path
from typing import Any

from linkage.records import Dataset

REPO = Path(__file__).resolve().parents[3]
_ROW = "_ppdiff_row"  # carries each row's index through the loader's steps


def loader_rules():
    """Load the loader's transformation functions without importing Django.

    Returns:
        The shared loader-rules module.
    """
    django_dir = str(REPO / "django")
    if django_dir not in sys.path:
        sys.path.insert(0, django_dir)
    from demsausage.app.sausage import loader_rules as rules

    return rules


def election_config(out_dir: Path) -> dict[str, Any] | None:
    """Read the election's loader configuration beside its diffs folder.

    Args:
        out_dir: The folder containing the election's diff reports.

    Returns:
        The parsed configuration, or ``None`` if no ``config.json`` exists.
    """
    path = out_dir.resolve().parent / "config.json"
    return json.loads(path.read_text()) if path.exists() else None


def as_loaded(d: Dataset, config: dict[str, Any], fixes: bool) -> tuple[list[dict], list[str]]:
    """Convert dataset rows using the same steps as the polling-place loader.

    Args:
        d: The dataset to convert.
        config: The election's loader configuration.
        fixes: Whether to apply ``fix_data_issues`` after conversion.

    Returns:
        Converted rows with source indices, and any cleaning-regex errors.
    """
    rules = loader_rules()
    rows = [{**copy.deepcopy(r.raw), _ROW: r.index} for r in d.records]
    rows, regex_errors = rules.to_schema(rows, config)
    if fixes:
        rows = rules.apply_fixes(rows, config.get("fix_data_issues"))
    return rows, regex_errors


def loaded_rows_by_index(d: Dataset, config: dict[str, Any]) -> dict[int, dict]:
    """Get converted rows after existing fixes, keyed by their source indices.

    Args:
        d: The dataset to convert.
        config: The election's loader configuration.

    Returns:
        Rows after filtering, conversion, and ``fix_data_issues``.
    """
    rows, _ = as_loaded(d, config, fixes=True)
    return {row[_ROW]: row for row in rows}


def suggested_fix_problems(fix: dict[str, Any], rows: list[dict], config: dict[str, Any]) -> list[str]:
    """Find new loader validation problems caused by an appended fix.

    Args:
        fix: The proposed ``fix_data_issues`` entry.
        rows: Matching rows after the existing loader fixes.
        config: The election's loader configuration.

    Returns:
        New problems introduced by the fix, without unrelated existing problems.
    """
    rules = loader_rules()

    def problems(row: dict) -> set[str]:
        """Check one copied row after the loader prepares its address.

        Args:
            row: The row to check.

        Returns:
            The loader validation problems on that row.
        """
        row, _ = rules.merge_address(copy.deepcopy(row), config.get("address_fields"), config.get("address_format"))
        return set(rules.row_problems(row))

    introduced = set()
    for row in rows:
        before = problems(row)
        after = rules.apply_fixes([copy.deepcopy(row)], [fix])[0]
        introduced.update(problems(after) - before)
    return sorted(introduced)


def _label(d: Dataset, row: dict) -> str:
    """Get the report label for a converted row.

    Args:
        d: The original dataset.
        row: A converted row carrying its source index.

    Returns:
        The label created from the matching source record.
    """
    return d.records[row[_ROW]].label()


def fix_audit(old: Dataset, new: Dataset, config: dict[str, Any]) -> list[dict[str, Any]]:
    """Check each configured fix against the old and new scrapes in order.

    Args:
        old: The earlier dataset.
        new: The later dataset.
        config: The election's loader configuration.

    Returns:
        An audit record for each configured fix, including its status and matches.
    """
    rules = loader_rules()
    old_rows, _ = as_loaded(old, config, fixes=False)
    new_rows, _ = as_loaded(new, config, fixes=False)
    audit = []
    for number, fix in enumerate(config.get("fix_data_issues") or [], start=1):
        matched_new = [r for r in new_rows if rules.fix_matches(fix, r)]
        matched_old = [r for r in old_rows if rules.fix_matches(fix, r)]
        missing_fields = sorted(
            {o["field"] for o in fix["overwrite"] for r in matched_new if o["field"] not in r}
        )
        applies = [
            r for r in matched_new
            if any(o["field"] in r and str(r[o["field"]]) != str(o["value"]) for o in fix["overwrite"])
        ]
        # A fix that overwrites the field it selects on translates a value (e.g. every
        # "Assistance" -> "Assisted"), so matching many places is intended.
        translates = any(o["field"] == fix["field"] for o in fix["overwrite"])
        if not matched_new:
            status = "stopped_matching" if matched_old else "no_match"
        elif missing_fields:
            status = "missing_field"
        elif not applies:
            status = "already_fixed"
        elif len(matched_new) > 1 and not translates:
            status = "multiple"
        else:
            status = "applies"
        audit.append(
            {
                "number": number,
                "fix": fix,
                "status": status,
                "translates_value": translates,
                "matches": [_label(new, r) for r in matched_new],
                "matched_in_old": len(matched_old),
                "missing_fields": missing_fields,
                "source_values": [
                    {o["field"]: r.get(o["field"]) for o in fix["overwrite"]} for r in matched_new
                ],
            }
        )
        old_rows = rules.apply_fixes(old_rows, [fix])
        new_rows = rules.apply_fixes(new_rows, [fix])
    return audit


def load_problems(new: Dataset, config: dict[str, Any]) -> dict[str, Any]:
    """Find rows the loader would reject after applying its configuration and fixes.

    Args:
        new: The later dataset.
        config: The election's loader configuration.

    Returns:
        Problems, regex errors, and the number of rows remaining after filters.
    """
    rules = loader_rules()
    rows, regex_errors = as_loaded(new, config, fixes=True)
    problems = []
    for row in rows:
        row, has_address = rules.merge_address(row, config.get("address_fields"), config.get("address_format"))
        found = rules.row_problems({k: v for k, v in row.items() if k != _ROW})
        if not has_address and "missing field 'address'" not in found:
            found.append("no address or address fields")
        if found:
            problems.append({"new_index": row[_ROW], "name": _label(new, row), "problems": found})
    return {"problems": problems, "regex_errors": regex_errors, "rows_after_filters": len(rows)}


def loader_checks(old: Dataset, new: Dataset, config: dict[str, Any] | None) -> dict[str, Any]:
    """Run loader checks when an election configuration is available.

    Args:
        old: The earlier dataset.
        new: The later dataset.
        config: The parsed election configuration, or ``None`` when it is absent.

    Returns:
        Loader audit and validation results, or a marker that no config was found.
    """
    if config is None:
        return {"config_found": False}
    return {
        "config_found": True,
        "fix_audit": fix_audit(old, new, config),
        **load_problems(new, config),
    }
