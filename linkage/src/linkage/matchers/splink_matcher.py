"""Splink matcher: a probabilistic (Fellegi-Sunter) model with term-frequency adjustments.

Two ways to get a model:
- train_from_labels(): learn m-probabilities from labelled pairs (records that share
  a trusted ID across two files) and save the model as JSON. This is the default
  route, because a single by-election file is far too small for unsupervised EM.
- SplinkMatcher(model=None, unsupervised=True): fit by EM on the two input files.

At prediction time the prior (probability two random records match) is set from
the input sizes, since a model trained on one corpus would otherwise carry that
corpus's prior to a 23-row by-election.

Requires the optional extra: `uv sync --extra splink`.
"""

from __future__ import annotations

import json
import logging
import warnings
from collections import Counter
from collections.abc import Sequence
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from ..records import Dataset, Record
from ..result import ScoredPair

DEFAULT_MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "splink_default.json"

#: Splink comparison names, mapped to the fields they compare (for explanations).
COMPARISON_FIELDS = ("name", "premises", "address", "geo", "divisions")


def _splink():
    try:
        import splink.comparison_library as cl
        from splink import DuckDBAPI, Linker, SettingsCreator, block_on
    except ImportError as e:  # pragma: no cover - exercised only without the extra
        raise ImportError(
            "The Splink matcher needs the optional dependency: uv sync --extra splink"
        ) from e
    return cl, DuckDBAPI, Linker, SettingsCreator, block_on


def _quiet() -> None:
    logging.getLogger("splink").setLevel(logging.ERROR)
    warnings.filterwarnings("ignore", module="splink")


def _grid(value: float | None, offset: float = 0.0) -> str | None:
    return None if value is None else str(round(value + offset, 2))


def splink_row(record: Record, uid: str, label: str | None = None, group: str = "") -> dict:
    return {
        "unique_id": uid,
        "grp": group,
        "name": record.n_name or None,
        "premises": record.n_premises or None,
        "address": record.n_address or None,
        "lat": record.lat,
        "lon": record.lon,
        "divisions": sorted(record.divisions) or None,
        # ~1 km grid cells, plus a half-cell offset so neighbours across a border meet.
        "g1": f"{_grid(record.lat)}|{_grid(record.lon)}" if record.has_coords else None,
        "g2": (
            f"{_grid(record.lat, 0.005)}|{_grid(record.lon, 0.005)}"
            if record.has_coords
            else None
        ),
        "g3": (
            f"{_grid(record.lat, 0.005)}|{_grid(record.lon)}"
            if record.has_coords
            else None
        ),
        "g4": (
            f"{_grid(record.lat)}|{_grid(record.lon, 0.005)}"
            if record.has_coords
            else None
        ),
        "truth": label,
    }


#: One coordinate agreeing to within this many degrees (~50 m) while the other is far
#: off is the signature of a single-coordinate typo (e.g. -32.656 for -31.656).
SINGLE_AXIS_TOLERANCE_DEG = 0.0005


def geo_comparison(single_axis_level: bool = True):
    """Distance bands, plus (optionally) a level for "one axis agrees, the other doesn't".

    Without that level a typo in one coordinate lands in "more than 5 km apart",
    which in a model trained on clean data is near-conclusive evidence against a
    match. As its own level, Splink learns how much that pattern should count:
    it is rare for true matches but also rare for random pairs, so it ends up
    close to neutral and the other fields decide.
    """
    cl, _, _, _, _ = _splink()
    import splink.comparison_level_library as cll

    levels = [
        cll.CustomLevel(
            "lat_l IS NULL OR lat_r IS NULL OR lon_l IS NULL OR lon_r IS NULL",
            label_for_charts="Coordinates missing",
        ).configure(is_null_level=True),
        *(cll.DistanceInKMLevel("lat", "lon", km) for km in (0.05, 0.2, 1, 5)),
    ]
    if single_axis_level:
        t = SINGLE_AXIS_TOLERANCE_DEG
        levels.append(
            cll.CustomLevel(
                f"abs(lat_l - lat_r) < {t} OR abs(lon_l - lon_r) < {t}",
                label_for_charts="One coordinate agrees, the other is far off (likely typo)",
            )
        )
    levels.append(cll.ElseLevel())
    return cl.CustomComparison(
        levels, output_column_name="lat_lon", comparison_description="Distance between places"
    )


def settings(all_pairs: bool = False, single_axis_level: bool = True):
    """Comparisons and blocking. Shared by training and prediction."""
    cl, _, _, SettingsCreator, block_on = _splink()
    blocking = [
        block_on("grp", "name"),
        block_on("grp", "premises"),
        block_on("grp", "address"),
        block_on("grp", "g1"),
        block_on("grp", "g2"),
        block_on("grp", "g3"),
        block_on("grp", "g4"),
    ]
    if all_pairs:
        blocking = ["l.grp = r.grp"]
    return SettingsCreator(
        link_type="link_only",
        unique_id_column_name="unique_id",
        comparisons=[
            cl.NameComparison("name").configure(term_frequency_adjustments=True),
            cl.JaroWinklerAtThresholds("premises", [0.92, 0.8]).configure(
                term_frequency_adjustments=True
            ),
            cl.JaroWinklerAtThresholds("address", [0.92, 0.8]).configure(
                term_frequency_adjustments=True
            ),
            geo_comparison(single_axis_level),
            cl.ArrayIntersectAtSizes("divisions", [2, 1]),
        ],
        blocking_rules_to_generate_predictions=blocking,
        retain_intermediate_calculation_columns=True,
    )


def _linker(left_rows: list[dict], right_rows: list[dict], model: Any):
    _, DuckDBAPI, Linker, _, _ = _splink()
    _quiet()
    db = DuckDBAPI()
    db.duckdb_con.execute("SET memory_limit='2GB'")
    return Linker(
        [
            db.register(left_rows, dataset_display_name="left_ds", table_name="left_ds"),
            db.register(right_rows, dataset_display_name="right_ds", table_name="right_ds"),
        ],
        model,
        log_level=logging.ERROR,
    )


def _match_prior(n_left: int, n_right: int) -> float:
    if n_left <= 0 or n_right <= 0:
        return 0.5
    return min(min(n_left, n_right) / (n_left * n_right), 0.5)


def labelled_rows(pairs: Sequence[tuple[str, Dataset, Dataset]]) -> tuple[list[dict], list[dict]]:
    """Build Splink input rows from (group, left, right) pairs labelled by source_id.

    Only IDs that are present and unique in both files become labels.
    """
    left_rows, right_rows = [], []
    for group, left, right in pairs:
        lc = Counter(r.source_id for r in left.records if r.source_id)
        rc = Counter(r.source_id for r in right.records if r.source_id)
        good = {i for i in lc if lc[i] == 1 and rc.get(i) == 1}
        for r in left.records:
            label = f"{group}|{r.source_id}" if r.source_id in good else None
            left_rows.append(splink_row(r, f"{group}:L:{r.index}", label, group))
        for r in right.records:
            label = f"{group}|{r.source_id}" if r.source_id in good else None
            right_rows.append(splink_row(r, f"{group}:R:{r.index}", label, group))
    return left_rows, right_rows


def smooth_m_probabilities(model: dict, n_labelled: int, pseudo_count: float) -> None:
    """Additive smoothing of m-probabilities, in place.

    Within one election almost nothing drifts, so labelled pairs leave many levels
    (e.g. "name Jaro-Winkler >= 0.92") with m = 0, which Splink reads as "a true match
    can never look like this" and vetoes the pair. Adding `pseudo_count` imaginary
    observations to every non-null level keeps those levels possible but unlikely.
    """
    for comparison in model["comparisons"]:
        levels = [lv for lv in comparison["comparison_levels"] if not lv.get("is_null_level")]
        total = n_labelled + pseudo_count * len(levels)
        for lv in levels:
            m = lv.get("m_probability") or 0.0
            lv["m_probability"] = (m * n_labelled + pseudo_count) / total


def train_from_labels(
    pairs: Sequence[tuple[str, Dataset, Dataset]],
    out_path: str | Path | None = None,
    pseudo_count: float = 1.0,
    single_axis_level: bool = True,
) -> dict:
    """Train m and u probabilities from labelled pairs; return (and optionally save) the model."""
    left_rows, right_rows = labelled_rows(pairs)
    linker = _linker(left_rows, right_rows, settings(single_axis_level=single_axis_level))
    linker.training.estimate_u_using_random_sampling(max_pairs=2e6, seed=1)
    linker.training.estimate_m_from_label_column("truth")
    model = linker.misc.save_model_to_json()
    n_labelled = sum(1 for r in left_rows if r["truth"])
    smooth_m_probabilities(model, n_labelled, pseudo_count)
    model["training"] = {
        "groups": [g for g, _, _ in pairs],
        "files": [[left.path, right.path] for _, left, right in pairs],
        "labelled_pairs": n_labelled,
        "m_pseudo_count": pseudo_count,
        "single_axis_level": single_axis_level,
    }
    if out_path is not None:
        Path(out_path).parent.mkdir(parents=True, exist_ok=True)
        Path(out_path).write_text(json.dumps(model, indent=2))
    return model


@dataclass
class SplinkMatcher:
    name: str = "splink"
    #: Thresholds are on Splink's match_probability.
    auto_threshold: float = 0.95
    review_threshold: float = 0.5
    #: A trained model (dict or path to JSON). None means DEFAULT_MODEL_PATH, unless
    #: unsupervised is set.
    model: dict | str | Path | None = None
    unsupervised: bool = False
    #: Only used when training by EM; a loaded model carries its own comparisons.
    single_axis_level: bool = True
    #: Score every pair when left x right is at most this; otherwise use blocking.
    all_pairs_limit: int = 250_000
    _model_dict: dict | None = field(default=None, init=False, repr=False)

    def params(self) -> dict[str, Any]:
        source = (
            "unsupervised EM on the inputs"
            if self.unsupervised
            else str(self.model or DEFAULT_MODEL_PATH)
            if not isinstance(self.model, dict)
            else "in-memory model"
        )
        training = None if self.unsupervised else self._load_model().get("training")
        return {
            "auto_threshold": self.auto_threshold,
            "review_threshold": self.review_threshold,
            "model": source,
            "training": training,
        }

    def _load_model(self) -> dict:
        if self._model_dict is None:
            if isinstance(self.model, dict):
                self._model_dict = self.model
            else:
                path = Path(self.model) if self.model else DEFAULT_MODEL_PATH
                if not path.exists():
                    raise FileNotFoundError(
                        f"No Splink model at {path}. Train one with `linkage train-splink`."
                    )
                self._model_dict = json.loads(path.read_text())
        return self._model_dict

    def _prediction_settings(self, n_left: int, n_right: int) -> Any:
        all_pairs = n_left * n_right <= self.all_pairs_limit
        if self.unsupervised:
            return settings(all_pairs, self.single_axis_level)
        model = json.loads(json.dumps(self._load_model()))
        model.pop("training", None)
        model["blocking_rules_to_generate_predictions"] = (
            settings(all_pairs).create_settings_dict("duckdb")[
                "blocking_rules_to_generate_predictions"
            ]
        )
        model["retain_intermediate_calculation_columns"] = True
        # Within one comparison, at most min(n) of the n_left * n_right pairs are matches.
        model["probability_two_random_records_match"] = _match_prior(n_left, n_right)
        return model

    def score(
        self,
        left: Dataset,
        right: Dataset,
        left_indices: Sequence[int],
        right_indices: Sequence[int],
    ) -> list[ScoredPair]:
        # Give Splink every record, not just the ones still to link: term frequencies
        # (how common each name/premises/address is) must come from the whole files.
        # With only the leftovers, two records sharing a name look like a 50% value
        # and an exact premises match counts for almost nothing. Pairs outside the
        # requested indices are dropped after prediction.
        wanted_left, wanted_right = set(left_indices), set(right_indices)
        left_rows = [splink_row(r, f"L:{r.index}") for r in left.records]
        right_rows = [splink_row(r, f"R:{r.index}") for r in right.records]
        linker = _linker(left_rows, right_rows, self._prediction_settings(len(left_rows), len(right_rows)))

        if self.unsupervised:
            _, _, _, _, block_on = _splink()
            linker._settings_obj._probability_two_random_records_match = _match_prior(
                len(left_rows), len(right_rows)
            )
            linker.training.estimate_u_using_random_sampling(max_pairs=2e6, seed=1)
            for rule in (block_on("name"), block_on("g1")):
                try:
                    linker.training.estimate_parameters_using_expectation_maximisation(rule)
                except Exception:  # noqa: BLE001 - EM can fail to converge on tiny inputs
                    pass

        predictions = linker.inference.predict(
            threshold_match_probability=min(0.01, self.review_threshold)
        ).as_record_list()
        pairs = []
        for row in predictions:
            a, b = row["unique_id_l"], row["unique_id_r"]
            if a.startswith("R:"):
                a, b = b, a
            i, j = int(a.split(":")[1]), int(b.split(":")[1])
            if i not in wanted_left or j not in wanted_right:
                continue
            # Per-field match weights (log2 Bayes factors, including any term-frequency
            # adjustment): positive is evidence for a match, negative against, 0 neutral.
            explain: dict[str, Any] = {"match_weight": round(row["match_weight"], 2)}
            for field_name, column in zip(
                COMPARISON_FIELDS, ("name", "premises", "address", "lat_lon", "divisions")
            ):
                mw = row.get(f"mw_{column}")
                if mw is not None:
                    explain[f"mw_{field_name}"] = round(mw + (row.get(f"mw_tf_adj_{column}") or 0.0), 2)
            pairs.append(
                ScoredPair(
                    score=float(row["match_probability"]),
                    left=i,
                    right=j,
                    explain=explain,
                    rank=float(row["match_weight"]),
                )
            )
        return pairs
