"""Diff polling place files, one diff per matcher, with an HTML report.

    ppdiff run OLD.csv NEW.csv --out-dir scrapers/<election>/diffs
    ppdiff series "scrapers/<election>/data/*.csv" --out-dir scrapers/<election>/diffs
    ppdiff report scrapers/<election>/diffs/<pair folder>      # rebuild report.html only
    ppdiff index scrapers/<election>/diffs                    # rebuild index.html only
    ppdiff latest "scrapers/<election>/data/*.csv" --out-dir scrapers/<election>/diffs   # newest two only (scrapers call this)

Settings come from diff.json beside the election's config.json (ignore, large_move_m,
replacement_radius_m, matcher); command-line options add to or override them.

Each pair gets a folder holding link.json (both linkage results), diff-<matcher>.json
for each matcher, disagreements.json and report.html. Verdicts on disagreements are
recorded in report.html and imported with `linkage verdicts import`.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from linkage.run import MATCHER_CHOICES

from .index import write_index
from .report import write_report
from .run import check_inputs_unchanged, pair_dir, run_pair, series


def _common(p: argparse.ArgumentParser) -> None:
    """Add options shared by the commands that run diffs.

    Args:
        p: The command parser to add options to.

    Returns:
        ``None``.
    """
    p.add_argument("--out-dir", required=True, help="Usually the scraper's diffs folder")
    p.add_argument("--matcher", choices=MATCHER_CHOICES, help="Default: diff.json's, else both")
    p.add_argument(
        "--ignore",
        action="append",
        default=[],
        help="Column to leave out of the diff (repeatable; adds to diff.json's)",
    )
    p.add_argument(
        "--large-move-m",
        type=float,
        help="Warn about moves at least this far (default: diff.json's, else 1000)",
    )
    p.add_argument(
        "--replacement-radius-m",
        type=float,
        help="Pair removed + added places this close (default: diff.json's, else 500)",
    )
    p.add_argument("--election", help="Label stored with verdicts (default: the out-dir's parent folder name)")
    p.add_argument("--splink-model", help="Splink model JSON (default: the bundled model)")


def _run(args: argparse.Namespace, old: Path, new: Path) -> None:
    """Run one pair and print the path to its report.

    Args:
        args: Parsed command-line options.
        old: The earlier input file.
        new: The later input file.

    Returns:
        ``None``.
    """
    target = run_pair(
        old,
        new,
        Path(args.out_dir),
        matcher=args.matcher,
        ignore=set(args.ignore),
        election=args.election,
        splink_model=args.splink_model,
        large_move_m=args.large_move_m,
        replacement_radius_m=args.replacement_radius_m,
    )
    print(f"{old.name} -> {new.name}: {target / 'report.html'}")


def cmd_run(args: argparse.Namespace) -> int:
    """Run the diff command for two named files.

    Args:
        args: Parsed options and input file paths.

    Returns:
        The process exit code.
    """
    _run(args, Path(args.old), Path(args.new))
    return 0


def cmd_series(args: argparse.Namespace) -> int:
    """Run a diff for every consecutive pair matched by a glob.

    Args:
        args: Parsed options, input glob, and force flag.

    Returns:
        ``1`` when fewer than two files match, otherwise ``0``.
    """
    pairs = series(args.pattern)
    if not pairs:
        print(f"Need at least two files matching {args.pattern!r}", file=sys.stderr)
        return 1
    for old, new in pairs:
        if not args.force and (pair_dir(Path(args.out_dir), old, new) / "report.html").exists():
            print(f"{old.name} -> {new.name}: already done (use --force to redo)")
            continue
        _run(args, old, new)
    return 0


def cmd_latest(args: argparse.Namespace) -> int:
    """Run a diff for the newest two files matched by a glob.

    Args:
        args: Parsed options, input glob, and force flag.

    Returns:
        The process exit code.
    """
    pairs = series(args.pattern)
    if not pairs:
        print(f"Nothing to diff yet: need at least two files matching {args.pattern!r}")
        return 0
    old, new = pairs[-1]
    if not args.force and (pair_dir(Path(args.out_dir), old, new) / "report.html").exists():
        print(f"{old.name} -> {new.name}: already done")
        return 0
    _run(args, old, new)
    return 0


def cmd_reviewed_import(args: argparse.Namespace) -> int:
    """Import downloaded review ticks and rebuild the affected reports.

    Args:
        args: Parsed download path and diffs-folder path.

    Returns:
        ``0`` after the report and index have been rebuilt.
    """
    from .reviewed import import_reviewed

    folder, counts = import_reviewed(Path(args.file), Path(args.diffs_dir))
    write_report(folder)
    write_index(folder.parent)
    print(
        f"{folder.name}: {counts['ticked']} ticked "
        f"({counts['added']} new, {counts['removed']} unticked); report rebuilt"
    )
    return 0


def cmd_report(args: argparse.Namespace) -> int:
    """Rebuild a pair report after confirming its inputs are unchanged.

    Args:
        args: Parsed pair-folder path.

    Returns:
        ``0`` after the report and index have been rebuilt.
    """
    target = Path(args.folder)
    check_inputs_unchanged(target)
    print(write_report(target))
    write_index(target.parent)
    return 0


def cmd_index(args: argparse.Namespace) -> int:
    """Rebuild a diffs folder's index page.

    Args:
        args: Parsed diffs-folder path.

    Returns:
        ``0`` after the index has been written.
    """
    print(write_index(Path(args.folder)))
    return 0


def main(argv: list[str] | None = None) -> int:
    """Parse command-line arguments and run the selected command.

    Args:
        argv: Arguments to parse, or ``None`` to use the process command line.

    Returns:
        The selected command's process exit code.
    """
    parser = argparse.ArgumentParser(
        prog="ppdiff",
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_run = sub.add_parser("run", help="Diff two files")
    p_run.add_argument("old")
    p_run.add_argument("new")
    _common(p_run)
    p_run.set_defaults(func=cmd_run)

    p_series = sub.add_parser("series", help="Diff every consecutive pair of files matching a glob")
    p_series.add_argument("pattern")
    _common(p_series)
    p_series.add_argument("--force", action="store_true", help="Redo pairs that already have a report")
    p_series.set_defaults(func=cmd_series)

    p_latest = sub.add_parser("latest", help="Diff only the newest two files matching a glob (for scrapers to call)")
    p_latest.add_argument("pattern")
    _common(p_latest)
    p_latest.add_argument("--force", action="store_true", help="Redo even if a report exists")
    p_latest.set_defaults(func=cmd_latest)

    p_report = sub.add_parser("report", help="Rebuild report.html from a pair folder's JSON")
    p_report.add_argument("folder")
    p_report.set_defaults(func=cmd_report)

    p_rev = sub.add_parser("reviewed", help="Save review ticks downloaded from a report into the repo")
    rsub = p_rev.add_subparsers(dest="reviewed_command", required=True)
    p_rimp = rsub.add_parser("import", help="Save a 'Download review' file as its pair folder's reviewed.json")
    p_rimp.add_argument("file")
    p_rimp.add_argument("--diffs-dir", required=True, help="The diffs folder holding the report")
    p_rimp.set_defaults(func=cmd_reviewed_import)

    p_index = sub.add_parser("index", help="Rebuild a diffs folder's index.html (pairs + per-place history)")
    p_index.add_argument("folder")
    p_index.set_defaults(func=cmd_index)

    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
