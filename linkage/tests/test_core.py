from __future__ import annotations

import pytest
from helpers import dataset, place

from linkage.assign import assign
from linkage.compare import compare_results
from linkage.evaluate import evaluate
from linkage.matchers.rapidfuzz_lsa import RapidfuzzMatcher
from linkage.normalise import distance_m, norm, norm_name
from linkage.pipeline import exact_pass, link
from linkage.records import ColumnMap
from linkage.result import ScoredPair


def test_norm_folds_case_accents_and_punctuation():
    assert norm("  St. Mary's Café & Hall ") == "st mary s cafe and hall"


def test_norm_name_drops_noise_words():
    assert norm_name("Smith Street Polling Place") == "smith street"


def test_distance_m():
    assert distance_m(-33.0, 151.0, -33.0, 151.0) == 0
    assert distance_m(-33.0, 151.0, -33.01, 151.0) == pytest.approx(1112, rel=0.01)
    assert distance_m(None, 151.0, -33.0, 151.0) is None


def test_detect_columns_for_aec_and_our_formats():
    aec = ColumnMap.detect(["PPName", "PremisesName", "Address1", "Locality", "Postcode", "Lat", "Long", "DivName", "PPId"])
    assert (aec.name, aec.premises, aec.lat, aec.lon, aec.divisions, aec.id) == (
        "PPName", "PremisesName", "Lat", "Long", "DivName", "PPId",
    )
    assert aec.address == ("Address1", "Locality", "Postcode")
    ours = ColumnMap.detect(["name", "premises", "address", "suburb", "lat", "lon", "ec_id"])
    assert ours.address == ("address", "suburb") and ours.id == "ec_id"


def test_detect_rejects_missing_name_and_bad_id_column():
    with pytest.raises(ValueError):
        ColumnMap.detect(["premises", "lat"])
    with pytest.raises(ValueError):
        ColumnMap.detect(["name"], id_column="nope")


def test_trailing_own_division_is_stripped_from_name():
    d = dataset([place(1, "Allawah (Barton)", divisions="Barton"), place(2, "Hall (East Wing)", divisions="Barton")])
    assert d.records[0].n_name == "allawah"
    assert d.records[1].n_name == "hall east wing"


def test_zero_coordinates_are_treated_as_missing():
    d = dataset([place(1, "A", lat=0, lon=0)])
    assert not d.records[0].has_coords


def test_assign_is_one_to_one_and_maximises_total():
    # Greedy would take (0,0)=0.9 and leave 1 unmatched; the optimum is 0->1, 1->0.
    pairs = [ScoredPair(0.9, 0, 0), ScoredPair(0.85, 0, 1), ScoredPair(0.8, 1, 0)]
    chosen = {(p.left, p.right) for p in assign(pairs, min_score=0.5)}
    assert chosen == {(0, 1), (1, 0)}


def test_assign_uses_rank_to_break_saturated_scores():
    pairs = [
        ScoredPair(1.0, 0, 0, rank=20),
        ScoredPair(1.0, 0, 1, rank=30),
        ScoredPair(1.0, 1, 0, rank=30),
        ScoredPair(1.0, 1, 1, rank=20),
    ]
    assert {(p.left, p.right) for p in assign(pairs, 0.5)} == {(0, 1), (1, 0)}


def test_assign_respects_min_score():
    assert assign([ScoredPair(0.4, 0, 0)], min_score=0.5) == []


def test_exact_pass_needs_unique_keys_and_corroboration():
    left = dataset([
        place(1, "Alpha", lat=-33.0, lon=151.0),
        place(2, "Beta", lat=-33.0, lon=151.0),
        place(3, "Beta", lat=-33.1, lon=151.0),  # duplicate key on the left
        place(4, "Gamma", lat=-33.0, lon=151.0),
    ])
    right = dataset([
        place(1, "Alpha", lat=-33.0, lon=151.001),
        place(2, "Beta", lat=-33.0, lon=151.0),
        place(4, "Gamma", lat=-34.0, lon=151.0),  # same name, 111 km away, no shared address
    ])
    links = {(x.left, x.right) for x in exact_pass(left, right)}
    assert links == {(0, 0)}


def test_rapidfuzz_spreads_weights_over_shared_fields():
    left = dataset([place(1, "A", lat=-33.0, lon=151.0)])
    right = dataset([place(1, "A", premises="Hall", lat=-33.0, lon=151.0)])
    weights = RapidfuzzMatcher().active_weights(left, right)
    assert set(weights) == {"name", "geo"}
    assert sum(weights.values()) == pytest.approx(1.0)


def _drift_pair():
    left = dataset([
        place("a", "Smithfield Public School", "Smithfield PS", "1 Main St, Smithfield", -33.85, 150.94, "Prospect"),
        place("b", "Town Hall", "Town Hall", "10 High St, Townsville", -33.80, 150.90, "Prospect"),
        place("c", "Closed Hall", "Closed Hall", "5 Gone Rd, Nowhere", -33.70, 150.80, "Prospect"),
    ])
    right = dataset([
        place("b", "Town Hall", "Town Hall", "10 High St, Townsville", -33.80, 150.90, "Prospect"),
        # Renamed and nudged 30 m: should still link to "a".
        place("a", "Smithfield Primary School", "Smithfield PS", "1 Main Street, Smithfield", -33.8503, 150.94, "Prospect"),
        place("d", "Brand New Centre", "New Centre", "99 Fresh Ave, Elsewhere", -33.60, 150.70, "Prospect"),
    ])
    return left, right


def test_pipeline_links_drifted_record_and_reports_added_and_removed():
    left, right = _drift_pair()
    result = link(left, right, RapidfuzzMatcher())
    pairs = {(x.left, x.right): x for x in result.links}
    assert set(pairs) == {(0, 1), (1, 0)}
    assert pairs[(1, 0)].via == "exact"
    assert pairs[(0, 1)].via == "matcher"
    assert result.unmatched_left == [2]
    assert result.unmatched_right == [2]


def test_evaluate_counts_correct_wrong_missed_and_changed():
    left, right = _drift_pair()
    result = link(left, right, RapidfuzzMatcher())
    ev = evaluate(result, left, right)
    assert (ev.truth_pairs, ev.correct, ev.wrong, ev.missed) == (2, 2, 0, 0)
    assert ev.changed_pairs == 1 and ev.changed_correct == 1


def test_compare_lists_disagreements():
    left, right = _drift_pair()
    a = link(left, right, RapidfuzzMatcher())
    b = link(left, right, RapidfuzzMatcher(name="strict", auto_threshold=0.99, review_threshold=0.99))
    c = compare_results(a, b, left, right)
    assert c["agree"] == 2 and c["disagree"] == 1
    assert c["disagreements"][0]["left"] == 0
    assert c["disagreements"][0]["strict"] is None
