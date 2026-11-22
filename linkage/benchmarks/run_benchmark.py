"""Benchmark both matchers on real file pairs that have a trusted ID column.

Splink is trained leave-one-dataset-out: for each test dataset, its model is
trained only on the other datasets, so it never sees the answers it's scored on.

    uv run python benchmarks/run_benchmark.py [--out benchmarks/results.json]
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

from cases import CASES, test_cases
from linkage.evaluate import evaluate
from linkage.matchers.rapidfuzz_lsa import RapidfuzzMatcher
from linkage.matchers.splink_matcher import SplinkMatcher, train_from_labels
from linkage.pipeline import link

EM_MIN_RECORDS = 200


def main() -> int:
    """Run benchmark cases and write metrics to a JSON file.

    Returns:
        Process exit status, always zero on success.
    """
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default=str(Path(__file__).parent / "results.json"))
    parser.add_argument("--only", help="Run only this case")
    args = parser.parse_args()

    cases = test_cases()
    loaded = {case.name: case.load() for case in cases}
    models: dict[str, tuple[dict, float]] = {}
    rows = []
    for case in cases:
        if args.only and not case.name.startswith(args.only):
            continue
        left, right = loaded[case.name]
        train_pairs = [
            (c.name, *loaded[c.name]) for c in CASES if c.group != case.group
        ]
        if case.group not in models:
            started = time.perf_counter()
            models[case.group] = (
                train_from_labels(train_pairs),
                time.perf_counter() - started,
            )
        model, train_s = models[case.group]
        matchers = [RapidfuzzMatcher(), SplinkMatcher(model=model)]
        # Unsupervised EM needs enough records to estimate from; skip it on small files.
        if min(len(left.records), len(right.records)) >= EM_MIN_RECORDS:
            matchers.append(SplinkMatcher(name="splink-em", unsupervised=True))
        for use_exact in (True, False):
            for matcher in matchers:
                started = time.perf_counter()
                result = link(left, right, matcher, use_exact_pass=use_exact)
                linking_seconds = time.perf_counter() - started
                training_seconds = train_s if matcher.name == "splink" else 0.0
                ev = evaluate(result, left, right)
                row = {
                    "case": case.name,
                    "kind": case.kind,
                    "note": case.note,
                    "exact_pass": use_exact,
                    "matcher": matcher.name,
                    "splink_trained_on": (
                        [g for g, _, _ in train_pairs]
                        if matcher.name == "splink"
                        else "unsupervised EM on this pair"
                        if matcher.name == "splink-em"
                        else None
                    ),
                    "seconds": round(linking_seconds + training_seconds, 2),
                    "linking_seconds": round(linking_seconds, 2),
                    "training_seconds": round(training_seconds, 2),
                    "records": [len(left.records), len(right.records)],
                    "counts": result.counts(),
                    **ev.to_dict(),
                }
                rows.append(row)
                print(
                    f"{case.name:42} exact={'on ' if use_exact else 'off'} {matcher.name:9} "
                    f"truth {ev.truth_pairs:5} changed {ev.changed_pairs:4} | correct {ev.correct:5} "
                    f"wrong {ev.wrong:3} (auto {ev.wrong_auto}, review {ev.wrong_review}) "
                    f"missed {ev.missed:4} | changed ok {ev.changed_correct}/{ev.changed_pairs} "
                    f"| review band ok {ev.correct_review} | false links {ev.false_links} | {row['seconds']}s",
                    flush=True,
                )
    Path(args.out).write_text(json.dumps(rows, indent=2))
    print(f"Wrote {args.out}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
