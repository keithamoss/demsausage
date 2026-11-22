from __future__ import annotations

import logging
import math
import random
import warnings
from unittest.mock import Mock

import pytest
from helpers import dataset, place

pytest.importorskip("splink")

from linkage.matchers.splink_matcher import (
    DEFAULT_MODEL_PATH,
    SplinkMatcher,
    _train_em,
    splink_row,
    train_from_labels,
)
from linkage.pipeline import link

STREETS = [
    "Main",
    "High",
    "Church",
    "Station",
    "Park",
    "King",
    "Queen",
    "George",
    "Victoria",
    "Albert",
]
SUBURBS = [
    "Northside",
    "Southvale",
    "Eastwood",
    "Westbury",
    "Hillcrest",
    "Lakeside",
    "Riverton",
    "Oakdale",
]


def _synthetic(n, seed):
    """Create reproducible polling-place rows for training and prediction tests.

    Args:
        n: Number of rows to generate.
        seed: Random seed selecting names, addresses, divisions, and coordinates.

    Returns:
        CSV-shaped rows with distinct source IDs and venue details.
    """
    rng = random.Random(seed)
    rows = []
    for i in range(n):
        suburb = rng.choice(SUBURBS)
        rows.append(
            place(
                i,
                f"{suburb} {rng.choice(['Public School', 'Hall', 'Church', 'Library'])} {i}",
                f"{suburb} Venue {i}",
                f"{rng.randint(1, 300)} {rng.choice(STREETS)} St, {suburb}",
                -33.0 - rng.random(),
                151.0 + rng.random(),
                rng.choice(["North", "South"]),
            )
        )
    return rows


def _drifted(rows, seed):
    """Copy test rows and rename or move a tenth of their places.

    Args:
        rows: Source rows, left unchanged.
        seed: Random seed selecting which rows receive changes.

    Returns:
        Copied rows with selected latitudes shifted and name replacements applied.
    """
    rng = random.Random(seed)
    out = [dict(r) for r in rows]
    for r in rng.sample(out, len(out) // 10):
        r["name"] = (
            r["name"]
            .replace("Public School", "Primary School")
            .replace("Hall", "Community Hall")
        )
        r["lat"] = str(float(r["lat"]) + 0.0003)
    return out


@pytest.fixture(scope="module")
def model():
    """Train a reusable model on reproducible places and their changed snapshots.

    Returns:
        A Splink model dictionary learned from 150 labelled place pairs.
    """
    base = _synthetic(150, 1)
    return train_from_labels([("synthetic", dataset(base), dataset(_drifted(base, 2)))])


def test_trained_model_has_no_zero_m_probabilities(model):
    for comparison in model["comparisons"]:
        for level in comparison["comparison_levels"]:
            if not level.get("is_null_level"):
                assert level["m_probability"] > 0


def test_splink_links_drifted_records(model):
    base = _synthetic(60, 7)
    left, right = dataset(base), dataset(_drifted(base, 8))
    result = link(left, right, SplinkMatcher(model=model), use_exact_pass=False)
    assert all(x.left == x.right for x in result.links)
    assert len(result.links) >= 57


def test_splink_assignment_does_not_swap_records_with_shared_names(model):
    # Two venues share a name; everything else differs. Probabilities saturate at
    # 1.0 for both pairings, so assignment must use match weights to get it right.
    left = dataset(
        [
            place(
                1,
                "Whittlesea",
                "Secondary College",
                "55 Laurel St, Whittlesea",
                -37.51496,
                145.12108,
                "Yan Yean",
            ),
            place(
                2,
                "Whittlesea Centre",
                "Masonic Hall",
                "20 Beech St, Whittlesea",
                -37.51085,
                145.11945,
                "Yan Yean",
            ),
        ]
        + _synthetic(30, 3)
    )
    right = dataset([dict(r.raw) for r in left.records])
    result = link(left, right, SplinkMatcher(model=model), use_exact_pass=False)
    assert all(x.left == x.right for x in result.links)


@pytest.mark.skipif(not DEFAULT_MODEL_PATH.exists(), reason="bundled model not trained")
def test_bundled_model_loads_and_links():
    base = _synthetic(25, 11)
    result = link(dataset(base), dataset(_drifted(base, 12)), SplinkMatcher())
    assert result.params["training"]["labelled_pairs"] > 0
    assert all(x.left == x.right for x in result.links)


def test_single_axis_coordinate_typo_does_not_veto_a_match(model):
    # Same place, but the old file's latitude is off by exactly one degree (~111 km).
    others = _synthetic(40, 21)
    good = place(
        "x",
        "Northam Town Hall",
        "",
        "Cnr Wellington & Gordon Streets, Northam",
        -31.656332,
        116.671239,
    )
    typo = dict(good, lat="-32.656332")
    left, right = dataset([typo] + others), dataset([good] + [dict(r) for r in others])
    pairs = SplinkMatcher(model=model, review_threshold=0.0).score(
        left, right, [0], [0]
    )
    assert pairs and pairs[0].explain["mw_geo"] > -3
    geo = next(c for c in model["comparisons"] if c["output_column_name"] == "lat_lon")
    assert any(
        "typo" in (lv.get("label_for_charts") or "") for lv in geo["comparison_levels"]
    )


@pytest.mark.parametrize(
    ("left_coords", "right_coords", "matching_grid"),
    [
        ((-33.0049, 151.0001), (-33.0051, 150.9999), "g3"),
        ((-33.0001, 151.0049), (-32.9999, 151.0051), "g4"),
    ],
)
def test_splink_blocks_across_both_coordinate_grid_axes(
    model, left_coords, right_coords, matching_grid
):
    left = dataset([place("left", "Old Hall", "Old Hall", "1 Old Road", *left_coords)])
    right = dataset(
        [place("right", "New School", "New School", "2 New Road", *right_coords)]
    )
    left_row = splink_row(left.records[0], "L:0")
    right_row = splink_row(right.records[0], "R:0")
    assert left_row["g1"] != right_row["g1"]
    assert left_row["g2"] != right_row["g2"]
    assert left_row[matching_grid] == right_row[matching_grid]

    pairs = SplinkMatcher(model=model, review_threshold=0.0, all_pairs_limit=0).score(
        left, right, [0], [0]
    )
    assert [(pair.left, pair.right) for pair in pairs] == [(0, 0)]


@pytest.mark.parametrize("unsupervised", [False, True])
@pytest.mark.parametrize("matching", [False, True], ids=["unrelated", "matching"])
def test_singleton_inputs_have_finite_match_weights(model, unsupervised, matching):
    left_record = place(
        "left", "Northside Primary School", "Northside School", "1 Main Road"
    )
    right_record = (
        dict(left_record, id="right")
        if matching
        else place("right", "Westbury Community Hall", "Westbury Hall", "99 Other Road")
    )
    left = dataset([left_record])
    right_dataset = dataset([right_record])
    matcher = SplinkMatcher(
        model=model, unsupervised=unsupervised, review_threshold=0.0
    )

    pairs = matcher.score(left, right_dataset, [0], [0])

    assert pairs
    assert all(pair.rank is not None and math.isfinite(pair.rank) for pair in pairs)
    assert all(0 <= pair.score <= 1 for pair in pairs)


def test_em_reports_empty_training_rules(caplog):
    from splink.internals.exceptions import EMTrainingException

    linker = Mock()
    linker.training.estimate_parameters_using_expectation_maximisation.side_effect = (
        EMTrainingException("no record pairs")
    )

    _train_em(linker)

    assert "Skipping Splink EM training on name" in caplog.text
    assert "Skipping Splink EM training on g1" in caplog.text


def test_em_propagates_unexpected_failures():
    linker = Mock()
    linker.training.estimate_parameters_using_expectation_maximisation.side_effect = (
        RuntimeError("unexpected database failure")
    )

    with pytest.raises(RuntimeError, match="unexpected database failure"):
        _train_em(linker)


def test_prediction_preserves_host_diagnostics(model, caplog):
    """Check that predicting links does not reconfigure the host's diagnostics.

    Args:
        model: Trained model fixture, which also initialises Splink dependencies.
        caplog: Fixture temporarily setting and restoring the logger level.

    Returns:
        None. Assertions check logger settings, warning filters, and prediction.
    """
    logger = logging.getLogger("splink")
    records = dataset([place("same", "Town Hall", "Town Hall", "1 Main Road")])

    with caplog.at_level(logging.WARNING, logger="splink"):
        handlers = list(logger.handlers)
        warning_filters = list(warnings.filters)

        pairs = SplinkMatcher(model=model).score(records, records, [0], [0])

        assert [(pair.left, pair.right) for pair in pairs] == [(0, 0)]
        assert logger.level == logging.WARNING
        assert logger.handlers == handlers
        assert warnings.filters == warning_filters
