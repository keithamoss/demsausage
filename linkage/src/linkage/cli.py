"""Command line: link two files, evaluate, train Splink, manage verdicts.

    linkage link OLD.csv NEW.csv [--matcher rapidfuzz|splink|both] [--out result.json]
    linkage evaluate OLD.csv NEW.csv --id-column COL [--matcher ...]
    linkage train-splink --pair GROUP OLD.csv NEW.csv ID_COLUMN [--pair ...] --out model.json
    linkage verdicts import DOWNLOADED.json      # from a diff report's "Download verdicts"
    linkage verdicts tally
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from . import verdicts as verdict_store
from .evaluate import evaluate
from .pipeline import link
from .records import load_csv
from .run import MATCHER_CHOICES, link_files, make_matchers


def cmd_link(args: argparse.Namespace) -> int:
    _, _, output = link_files(
        args.old,
        args.new,
        matcher=args.matcher,
        id_column=args.id_column,
        splink_model=args.splink_model,
        use_exact_pass=not args.no_exact_pass,
    )
    for r in output["results"]:
        print(f"{r['matcher']:10} {r['counts']}", file=sys.stderr)
    if "comparison" in output:
        c = output["comparison"]
        print(f"agreement  {c['agree']}/{c['left_records']} ({c['disagree']} disagreements)", file=sys.stderr)
    text = json.dumps(output, indent=2)
    if args.out:
        Path(args.out).write_text(text)
        print(f"Wrote {args.out}", file=sys.stderr)
    else:
        print(text)
    return 0


def cmd_evaluate(args: argparse.Namespace) -> int:
    left = load_csv(args.old, id_column=args.id_column)
    right = load_csv(args.new, id_column=args.id_column)
    for m in make_matchers(args.matcher, args.splink_model):
        result = link(left, right, m, use_exact_pass=not args.no_exact_pass)
        print(json.dumps(evaluate(result, left, right).to_dict(), indent=2))
    return 0


def cmd_train_splink(args: argparse.Namespace) -> int:
    from .matchers.splink_matcher import train_from_labels

    pairs = [
        (group, load_csv(old, id_column=col), load_csv(new, id_column=col))
        for group, old, new, col in args.pair
    ]
    model = train_from_labels(pairs, out_path=args.out, pseudo_count=args.pseudo_count)
    print(f"Trained on {model['training']['labelled_pairs']} labelled pairs; wrote {args.out}")
    return 0


def cmd_verdicts_import(args: argparse.Namespace) -> int:
    counts = verdict_store.import_file(Path(args.file), Path(args.store))
    print(f"Imported into {args.store}: {counts['added']} new, {counts['replaced']} updated, {counts['total']} in total")
    return 0


def cmd_verdicts_tally(args: argparse.Namespace) -> int:
    print(verdict_store.format_tally(verdict_store.tally(verdict_store.load(Path(args.store)))))
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="linkage", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)

    def common(p: argparse.ArgumentParser) -> None:
        p.add_argument("old")
        p.add_argument("new")
        p.add_argument("--matcher", choices=MATCHER_CHOICES, default="both")
        p.add_argument("--splink-model", help="Splink model JSON (default: the bundled model)")
        p.add_argument("--no-exact-pass", action="store_true", help="Send every record to the matcher")

    p_link = sub.add_parser("link", help="Link two files")
    common(p_link)
    p_link.add_argument("--id-column", help="Carry this column through as source_id (not used for matching)")
    p_link.add_argument("--out", help="Write JSON here instead of stdout")
    p_link.set_defaults(func=cmd_link)

    p_eval = sub.add_parser("evaluate", help="Score matchers against a trusted ID column")
    common(p_eval)
    p_eval.add_argument("--id-column", required=True)
    p_eval.set_defaults(func=cmd_evaluate)

    p_train = sub.add_parser("train-splink", help="Train a Splink model from labelled file pairs")
    p_train.add_argument("--pair", nargs=4, action="append", required=True, metavar=("GROUP", "OLD", "NEW", "ID_COLUMN"))
    p_train.add_argument("--out", required=True)
    p_train.add_argument("--pseudo-count", type=float, default=1.0)
    p_train.set_defaults(func=cmd_train_splink)

    p_verdicts = sub.add_parser("verdicts", help="The record of human verdicts on matcher disagreements")
    vsub = p_verdicts.add_subparsers(dest="verdicts_command", required=True)
    p_import = vsub.add_parser("import", help="Merge a verdicts file downloaded from a diff report")
    p_import.add_argument("file")
    p_import.add_argument("--store", default=str(verdict_store.DEFAULT_PATH))
    p_import.set_defaults(func=cmd_verdicts_import)
    p_tally = vsub.add_parser("tally", help="Summarise who was right, by reason")
    p_tally.add_argument("--store", default=str(verdict_store.DEFAULT_PATH))
    p_tally.set_defaults(func=cmd_verdicts_tally)

    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
