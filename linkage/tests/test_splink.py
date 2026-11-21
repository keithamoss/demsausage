from __future__ import annotations

import random

import pytest
from helpers import dataset, place

pytest.importorskip("splink")

from linkage.matchers.splink_matcher import DEFAULT_MODEL_PATH, SplinkMatcher, train_from_labels  # noqa: E402
from linkage.pipeline import link  # noqa: E402

STREETS = ["Main", "High", "Church", "Station", "Park", "King", "Queen", "George", "Victoria", "Albert"]
SUBURBS = ["Northside", "Southvale", "Eastwood", "Westbury", "Hillcrest", "Lakeside", "Riverton", "Oakdale"]


def _synthetic(n, seed):
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
    rng = random.Random(seed)
    out = [dict(r) for r in rows]
    for r in rng.sample(out, len(out) // 10):
        r["name"] = r["name"].replace("Public School", "Primary School").replace("Hall", "Community Hall")
        r["lat"] = str(float(r["lat"]) + 0.0003)
    return out


@pytest.fixture(scope="module")
def model():
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
    left = dataset([
        place(1, "Whittlesea", "Secondary College", "55 Laurel St, Whittlesea", -37.51496, 145.12108, "Yan Yean"),
        place(2, "Whittlesea Centre", "Masonic Hall", "20 Beech St, Whittlesea", -37.51085, 145.11945, "Yan Yean"),
    ] + _synthetic(30, 3))
    right = dataset([dict(r.raw) for r in left.records])
    result = link(left, right, SplinkMatcher(model=model))
    assert all(x.left == x.right for x in result.links)


@pytest.mark.skipif(not DEFAULT_MODEL_PATH.exists(), reason="bundled model not trained")
def test_bundled_model_loads_and_links():
    base = _synthetic(25, 11)
    result = link(dataset(base), dataset(_drifted(base, 12)), SplinkMatcher())
    assert result.params["training"]["labelled_pairs"] > 0
    assert all(x.left == x.right for x in result.links)
