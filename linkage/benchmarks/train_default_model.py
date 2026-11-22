"""Train the bundled Splink model (src/linkage/models/splink_default.json).

Uses every labelled case from cases.CASES: within-election snapshots
(SA 2025, VIC 2026) and the federal 2022 -> 2025 cross-election fixtures.

    uv run python benchmarks/train_default_model.py
"""

from __future__ import annotations

import json
import os
import sys

from cases import CASES, REPO
from linkage.matchers.splink_matcher import DEFAULT_MODEL_PATH, train_from_labels


def main() -> int:
    """Train and save the default Splink model used by the package.

    Returns:
        Process exit status, always zero on success.
    """
    pairs = [(case.name, *case.load()) for case in CASES]
    model = train_from_labels(pairs)
    model["training"]["files"] = [
        [os.path.relpath(path, REPO) for path in pair]
        for pair in model["training"]["files"]
    ]
    DEFAULT_MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    DEFAULT_MODEL_PATH.write_text(json.dumps(model, indent=2) + "\n")
    print(
        f"Trained on {model['training']['labelled_pairs']} labelled pairs; wrote {DEFAULT_MODEL_PATH}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
