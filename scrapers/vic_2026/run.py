#!/usr/bin/env python3
"""
Scrape, transform, then diff against the previous output. Stops at the first step that fails.

The diff here (diff.py) compares by VEC venue ID. After it, the repo's generic polling place
diff (diff/, linkage-based, one diff per matcher) also runs into diffs-linkage/; a failure
there doesn't fail the run.

Usage: python run.py [--fresh] [--no-linkage-diff]
"""

import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path

import diff
import scrape
import transform
from common import output_paths


HERE = Path(__file__).resolve().parent


def linkage_diff() -> None:
    """Run the generic diff (repo's diff/ tool) on the newest two outputs, into diffs-linkage/."""
    if shutil.which("uv") is None:
        print("\nSkipping the linkage diff: uv isn't installed.")
        return
    print("\nLinkage diff (diffs-linkage/):")
    result = subprocess.run(
        [
            "uv", "run", "--project", str(HERE.parent.parent / "diff"), "ppdiff", "latest",
            str(HERE / "data" / "*polling places.csv"), "--out-dir", str(HERE / "diffs-linkage"),
        ],
        check=False,
        # Let uv use the diff project's own environment, not this scraper's.
        env={k: v for k, v in os.environ.items() if k != "VIRTUAL_ENV"},
    )
    if result.returncode != 0:
        print("The linkage diff failed (the run itself is fine). See the output above.")


def main(fresh: bool, run_linkage_diff: bool = True) -> int:
    if scrape.main(fresh=fresh) != 0:
        return 1
    print()
    if transform.main() != 0:
        return 1
    if len(output_paths()) < 2:
        print("\nFirst output; nothing to diff against yet.")
        return 0
    print()
    status = diff.main()
    if run_linkage_diff:
        linkage_diff()
    return status


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        "--fresh",
        action="store_true",
        help="start a new scrape instead of resuming an incomplete one",
    )
    parser.add_argument(
        "--no-linkage-diff",
        action="store_true",
        help="skip the generic linkage-based diff into diffs-linkage/",
    )
    args = parser.parse_args()
    sys.exit(main(args.fresh, not args.no_linkage_diff))
