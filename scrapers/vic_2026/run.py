#!/usr/bin/env python3
"""
Scrape, transform, then diff against the previous output. Stops at the first step that fails.

Usage: python run.py [--fresh]
"""

import argparse
import sys

import diff
import scrape
import transform
from common import output_paths


def main(fresh: bool) -> int:
    if scrape.main(fresh=fresh) != 0:
        return 1
    print()
    if transform.main() != 0:
        return 1
    if len(output_paths()) < 2:
        print("\nFirst output; nothing to diff against yet.")
        return 0
    print()
    return diff.main()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        "--fresh",
        action="store_true",
        help="start a new scrape instead of resuming an incomplete one",
    )
    sys.exit(main(parser.parse_args().fresh))
