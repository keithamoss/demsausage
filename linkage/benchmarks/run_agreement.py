"""Run both matchers side by side on real snapshot series that have no trusted IDs.

Without an answer key we can't score accuracy, but we can see how often the
matchers agree and list every disagreement for a human to judge.

    uv run python benchmarks/run_agreement.py [--out benchmarks/agreement.json]
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from run_benchmark import REPO, SCRAPERS

from linkage.compare import compare_results
from linkage.matchers.rapidfuzz_lsa import RapidfuzzMatcher
from linkage.matchers.splink_matcher import SplinkMatcher
from linkage.pipeline import link
from linkage.records import load_csv

#: (name, glob within scrapers/): first and last matching file are compared.
SERIES = [
    ("wa_2025", "wa_2025/data/*.csv"),
    ("wa_2021", "wa_2021/data/*.csv"),
    ("qld_2024", "qld_2024/data/*.csv"),
    ("qld_2020", "qld_2020/data/*.csv"),
    ("tas_2025", "tas_2025/data/*Polling places.csv"),
    ("tas_2021", "tas_2021/data/tas_2021*.csv"),
    ("act_2024", "act_2024/data/*.csv"),
]

#: Explicit (name, old, new) pairs, e.g. across elections.
PAIRS = [
    (
        "coffs_harbour_2023_state_to_2026_council",
        Path(__file__).parent / "data/nsw_coffs_harbour_state_2023_SG2301-020.csv",
        SCRAPERS / "nsw_coffs_harbour_2026/data/nsw_coffs_harbour_LB2615-031_2026-11-21.csv",
    ),
]


def _rel(path: Path) -> str:
    """Convert a path to a repository-relative string when possible.

    Args:
        path: Path to format.

    Returns:
        A repository-relative path, or an absolute path outside the repository.
    """
    path = path.resolve()
    return str(path.relative_to(REPO)) if path.is_relative_to(REPO) else str(path)


def main() -> int:
    """Generate an agreement report for repeated election data snapshots.

    Returns:
        Process exit status, always zero on success.
    """
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default=str(Path(__file__).parent / "agreement.json"))
    parser.add_argument("--extra", nargs=3, action="append", default=[], metavar=("NAME", "OLD", "NEW"), help="Another pair to compare")
    args = parser.parse_args()

    pairs = []
    for name, pattern in SERIES:
        files = sorted(SCRAPERS.glob(pattern))
        if len(files) >= 2:
            pairs.append((name, files[0], files[-1]))
    for name, old, new in PAIRS:
        if old.is_file() and new.is_file():
            pairs.append((name, old, new))
        else:
            missing = [str(path) for path in (old, new) if not path.is_file()]
            print(
                f"Skipping {name}: snapshot unavailable: {', '.join(missing)}",
                file=sys.stderr,
            )
    pairs += [(n, Path(o), Path(w)) for n, o, w in args.extra]

    out = []
    for name, old, new in pairs:
        left, right = load_csv(old), load_csv(new)
        results = [link(left, right, m) for m in (RapidfuzzMatcher(), SplinkMatcher())]
        comparison = compare_results(*results, left, right)
        counts = {r.matcher: r.counts() for r in results}
        print(
            f"{name:10} {len(left.records):5} -> {len(right.records):5} | agree {comparison['agree']}/{comparison['left_records']} "
            f"| disagree {comparison['disagree']} | rapidfuzz links {counts['rapidfuzz']['links']} "
            f"(review {counts['rapidfuzz']['review']}) | splink links {counts['splink']['links']} (review {counts['splink']['review']})",
            flush=True,
        )
        out.append({"name": name, "old": _rel(old), "new": _rel(new), "counts": counts, **comparison})
    Path(args.out).write_text(json.dumps(out, indent=2))
    print(f"Wrote {args.out}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
