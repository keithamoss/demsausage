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

import importlib
import json
import logging
import math
from collections.abc import Sequence
from copy import deepcopy
from dataclasses import dataclass, field
from pathlib import Path
from typing import TYPE_CHECKING, Any, TypedDict

if TYPE_CHECKING:
    from splink import Linker, SettingsCreator

from ..records import Dataset, Record
from ..result import ScoredPair

DEFAULT_MODEL_PATH = (
    Path(__file__).resolve().parent.parent / "models" / "splink_default.json"
)

#: Splink comparison names, mapped to the fields they compare (for explanations).
COMPARISON_COLUMNS = {
    "name": "name",
    "premises": "premises",
    "address": "address",
    "geo": "lat_lon",
    "divisions": "divisions",
}
GRID_OFFSETS = {
    "g1": (0.0, 0.0),
    "g2": (0.005, 0.005),
    "g3": (0.005, 0.0),
    "g4": (0.0, 0.005),
}


class SplinkRow(TypedDict):
    """Typed input row shared by Splink training and prediction.

    Attributes:
        unique_id: Internal record identifier, including dataset and row position.
        grp: Group preventing cross-election training comparisons.
        name: Normalised name, or ``None`` for missing text.
        premises: Normalised venue name, or ``None``.
        address: Normalised address, or ``None``.
        lat: Latitude, or ``None``.
        lon: Longitude, or ``None``.
        divisions: Normalised divisions, or ``None``.
        g1: Unshifted coordinate-grid key.
        g2: Grid shifted by half a cell on both axes.
        g3: Grid shifted on latitude only.
        g4: Grid shifted on longitude only.
        truth: Optional shared trusted identity label.
    """

    unique_id: str
    grp: str
    name: str | None
    premises: str | None
    address: str | None
    lat: float | None
    lon: float | None
    divisions: list[str] | None
    g1: str | None
    g2: str | None
    g3: str | None
    g4: str | None
    truth: str | None


def _require_splink() -> None:
    """Give a clear error when the optional Splink dependency is missing.

    Returns:
        None. Successful completion means Splink can be imported.

    Raises:
        ImportError: If the optional Splink dependency is not installed.
    """
    try:
        importlib.import_module("splink")
    except ImportError as e:  # pragma: no cover - exercised only without the extra
        raise ImportError(
            "The Splink matcher needs the optional dependency: uv sync --extra splink"
        ) from e


def _grid(value: float | None, offset: float = 0.0) -> str | None:
    """Round a coordinate to a blocking-grid key.

    Args:
        value: Latitude or longitude value.
        offset: Small grid offset, usually half of a grid cell.

    Returns:
        A string rounded to at most two decimal places, or ``None`` when missing.

    Examples:
        ``_grid(151.004)`` returns ``"151.0"``; trailing zeros are not added.
    """
    return None if value is None else str(round(value + offset, 2))


def splink_row(
    record: Record, uid: str, label: str | None = None, group: str = ""
) -> SplinkRow:
    """Convert a polling-place record into a Splink input row.

    Args:
        record: Record to convert.
        uid: Unique Splink identifier for this record.
        label: Optional trusted identity label used during training.
        group: Optional election or file group label.

    Returns:
        A dictionary containing Splink comparison and blocking fields.
    """
    # Preserve grid names used by saved models while sharing their offset policy.
    grids = {
        name: (
            f"{_grid(record.lat, lat_offset)}|{_grid(record.lon, lon_offset)}"
            if record.has_coords
            else None
        )
        for name, (lat_offset, lon_offset) in GRID_OFFSETS.items()
    }
    return {
        "unique_id": uid,
        "grp": group,
        "name": record.n_name or None,
        "premises": record.n_premises or None,
        "address": record.n_address or None,
        "lat": record.lat,
        "lon": record.lon,
        "divisions": sorted(record.divisions) or None,
        "g1": grids["g1"],
        "g2": grids["g2"],
        "g3": grids["g3"],
        "g4": grids["g4"],
        "truth": label,
    }


#: One coordinate agreeing to within this many degrees (~50 m) while the other is far
#: off is the signature of a single-coordinate typo (e.g. -32.656 for -31.656).
SINGLE_AXIS_TOLERANCE_DEG = 0.0005


def geo_comparison(single_axis_level: bool = True):
    """Distance bands, plus (optionally) a level for "one axis agrees, the other doesn't".

    Args:
        single_axis_level: Whether to add a level for likely single-axis coordinate typos.

    Returns:
        A configured Splink custom comparison.

    Without that level a typo in one coordinate lands in "more than 5 km apart",
    which in a model trained on clean data is near-conclusive evidence against a
    match. As its own level, Splink learns how much that pattern should count:
    it is rare for true matches but also rare for random pairs, so it ends up
    close to neutral and the other fields decide.
    """
    _require_splink()
    import splink.comparison_level_library as cll
    import splink.comparison_library as cl

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
        levels,
        output_column_name="lat_lon",
        comparison_description="Distance between places",
    )


def blocking_rules(all_pairs: bool = False) -> list[Any]:
    """Build shared prediction blocking rules without constructing comparisons.

    Args:
        all_pairs: Whether every pair within a group should be compared.

    Returns:
        Splink blocking rules, or one SQL rule comparing every pair in a group.
    """
    _require_splink()
    from splink import block_on

    if all_pairs:
        return ["l.grp = r.grp"]
    return [
        block_on("grp", column)
        for column in ("name", "premises", "address", *GRID_OFFSETS)
    ]


def settings(
    all_pairs: bool = False,
    single_axis_level: bool = True,
    match_prior: float = 0.0001,
) -> SettingsCreator:
    """Build the Splink settings shared by training and prediction.

    Args:
        all_pairs: Whether to disable blocking and compare every pair in a group.
        single_axis_level: Whether to include the coordinate-typo comparison level.
        match_prior: Probability that two random input records match.

    Returns:
        A Splink settings object.
    """
    _require_splink()
    import splink.comparison_library as cl
    from splink import SettingsCreator

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
        blocking_rules_to_generate_predictions=blocking_rules(all_pairs),
        probability_two_random_records_match=match_prior,
        retain_intermediate_calculation_columns=True,
    )


def _linker(
    left_rows: list[SplinkRow], right_rows: list[SplinkRow], model: Any
) -> Linker:
    """Create a Splink linker from explicitly typed input tables.

    Args:
        left_rows: Records for the left dataset.
        right_rows: Records for the right dataset.
        model: Settings dictionary or Splink settings object.

    Returns:
        A configured Splink linker.
    """
    _require_splink()
    from splink import DuckDBAPI, Linker

    try:
        import pyarrow as pa
    except ImportError as e:  # pragma: no cover - installed with the Splink extra
        raise ImportError("PyArrow is required by the Splink matcher") from e

    schema = pa.schema(
        [
            pa.field("unique_id", pa.string(), nullable=False),
            pa.field("grp", pa.string()),
            pa.field("name", pa.string()),
            pa.field("premises", pa.string()),
            pa.field("address", pa.string()),
            pa.field("lat", pa.float64()),
            pa.field("lon", pa.float64()),
            pa.field("divisions", pa.list_(pa.string())),
            pa.field("g1", pa.string()),
            pa.field("g2", pa.string()),
            pa.field("g3", pa.string()),
            pa.field("g4", pa.string()),
            pa.field("truth", pa.string()),
        ]
    )
    left_table = pa.Table.from_pylist(left_rows, schema=schema)
    right_table = pa.Table.from_pylist(right_rows, schema=schema)

    db = DuckDBAPI()
    db.duckdb_con.execute("SET memory_limit='2GB'")
    return Linker(
        [
            db.register(
                left_table, dataset_display_name="left_ds", table_name="left_ds"
            ),
            db.register(
                right_table, dataset_display_name="right_ds", table_name="right_ds"
            ),
        ],
        model,
        # Leave logging configuration to the host application.
        log_level=None,
    )


def _match_prior(n_left: int, n_right: int) -> float:
    """Estimate the probability that two random records from two datasets match.

    Args:
        n_left: Number of records on the left.
        n_right: Number of records on the right.

    Returns:
        A prior capped at 0.5 so tiny datasets cannot create invalid probabilities.
    """
    if n_left <= 0 or n_right <= 0:
        return 0.5
    return min(min(n_left, n_right) / (n_left * n_right), 0.5)


def _train_em(linker: Linker) -> None:
    """Learn match patterns from unlabelled records using iterative estimation.

    This expectation-maximisation (EM) training reports rules that find no pairs.
    Unexpected database or training failures propagate to the caller.

    Args:
        linker: Splink linker configured with input-size-specific settings.

    Returns:
        None. The linker's model is updated in place.
    """
    from splink import block_on
    from splink.internals.exceptions import EMTrainingException

    linker.training.estimate_u_using_random_sampling(max_pairs=2e6, seed=1)
    for column in ("name", "g1"):
        rule = block_on(column)
        try:
            linker.training.estimate_parameters_using_expectation_maximisation(rule)
        except EMTrainingException as error:
            logging.getLogger(__name__).warning(
                "Skipping Splink EM training on %s: %s", column, error
            )


def _prediction_pair(row: dict[str, Any]) -> ScoredPair:
    """Convert a Splink prediction into a left-oriented candidate and explanation.

    Args:
        row: Prediction dictionary supplied by Splink.

    Returns:
        A scored candidate using full match weight for assignment.
    """
    left_id, right_id = row["unique_id_l"], row["unique_id_r"]
    if left_id.startswith("R:"):
        left_id, right_id = right_id, left_id

    explain: dict[str, Any] = {"match_weight": round(row["match_weight"], 2)}
    for field_name, column in COMPARISON_COLUMNS.items():
        weight = row.get(f"mw_{column}")
        if weight is not None:
            adjustment = row.get(f"mw_tf_adj_{column}") or 0.0
            explain[f"mw_{field_name}"] = round(weight + adjustment, 2)
    return ScoredPair(
        score=float(row["match_probability"]),
        left=int(left_id.split(":")[1]),
        right=int(right_id.split(":")[1]),
        explain=explain,
        rank=float(row["match_weight"]),
    )


def labelled_rows(
    pairs: Sequence[tuple[str, Dataset, Dataset]],
) -> tuple[list[SplinkRow], list[SplinkRow]]:
    """Build Splink input rows from (group, left, right) pairs labelled by source_id.

    Args:
        pairs: Named left/right dataset pairs to label.

    Returns:
        Separate left and right row lists containing training labels.

    Only IDs that are present and unique in both files become labels.
    """
    left_rows: list[SplinkRow] = []
    right_rows: list[SplinkRow] = []
    for group, left, right in pairs:
        good = left.unique_source_ids().keys() & right.unique_source_ids().keys()
        for r in left.records:
            label = f"{group}|{r.source_id}" if r.source_id in good else None
            left_rows.append(splink_row(r, f"{group}:L:{r.index}", label, group))
        for r in right.records:
            label = f"{group}|{r.source_id}" if r.source_id in good else None
            right_rows.append(splink_row(r, f"{group}:R:{r.index}", label, group))
    return left_rows, right_rows


def smooth_m_probabilities(model: dict, n_labelled: int, pseudo_count: float) -> None:
    """Keep rare match patterns possible by adding imaginary training examples.

    Within one election almost nothing changes, so some comparison patterns never
    appear among known matches. Splink would otherwise treat those patterns as
    impossible for a true match. Adding imaginary observations keeps them possible
    but unlikely.

    Args:
        model: Splink model dictionary to update.
        n_labelled: Number of labelled pairs in the training data.
        pseudo_count: Imaginary observations added to each non-null comparison level.

    Returns:
        None. The model's true-match probabilities are updated in place.
    """
    for comparison in model["comparisons"]:
        levels = [
            lv for lv in comparison["comparison_levels"] if not lv.get("is_null_level")
        ]
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
    """Learn how often field comparisons agree for matching and unrelated places.

    Args:
        pairs: Named left/right datasets containing trusted source IDs.
        out_path: Optional path at which to save the trained model JSON.
        pseudo_count: Smoothing observations added to each comparison level.
        single_axis_level: Whether to include the single-axis coordinate-typo level.

    Returns:
        The trained model dictionary, optionally also written to ``out_path``.
    """
    left_rows, right_rows = labelled_rows(pairs)
    linker = _linker(
        left_rows, right_rows, settings(single_axis_level=single_axis_level)
    )
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
    """Score places using a bundled or trained Splink probabilistic model.

    Attributes:
        name: Short matcher identifier used in reports.
        auto_threshold: Match probability treated as a confident link.
        review_threshold: Minimum probability eligible for linking; selected pairs
            below ``auto_threshold`` need human review.
        model: Model dictionary, JSON path, or ``None`` for the bundled model.
        unsupervised: Whether to estimate probabilities with EM instead of a model.
        single_axis_level: Whether to use the coordinate-typo comparison level.
        all_pairs_limit: Maximum pair count that is safe to compare directly.
    """

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
    _model_dict: dict[str, Any] | None = field(default=None, init=False, repr=False)

    def params(self) -> dict[str, Any]:
        """Return matcher settings and model provenance.

        Returns:
            Thresholds, model source, and training metadata.
        """
        if self.unsupervised:
            source = "unsupervised EM on the inputs"
        elif isinstance(self.model, dict):
            source = "in-memory model"
        else:
            source = str(self.model or DEFAULT_MODEL_PATH)
        training = None if self.unsupervised else self._load_model().get("training")
        return {
            "auto_threshold": self.auto_threshold,
            "review_threshold": self.review_threshold,
            "model": source,
            "training": training,
        }

    def assignment_baseline(self) -> float:
        """Return unmatched match weight corresponding to the review threshold.

        Thresholds of zero or one use the nearest finite probability inside that
        interval, so the assignment matrix always has a finite unmatched option.

        Returns:
            Base-two log odds on the same scale as Splink candidate ranks.

        Raises:
            ValueError: If the review threshold is outside zero through one.
        """
        if not 0 <= self.review_threshold <= 1:
            raise ValueError("Splink review_threshold must be between 0 and 1")
        probability = min(
            max(self.review_threshold, math.nextafter(0.0, 1.0)),
            math.nextafter(1.0, 0.0),
        )
        return math.log2(probability) - math.log2(1 - probability)

    def _load_model(self) -> dict[str, Any]:
        """Load or cache the configured Splink model dictionary.

        Returns:
            The model dictionary.

        Raises:
            FileNotFoundError: If a configured model JSON file does not exist.
            ValueError: If the model JSON is not an object.
        """
        if self._model_dict is not None:
            return self._model_dict
        if isinstance(self.model, dict):
            model = self.model
        else:
            path = Path(self.model) if self.model else DEFAULT_MODEL_PATH
            if not path.exists():
                raise FileNotFoundError(
                    f"No Splink model at {path}. Train one with `linkage train-splink`."
                )
            model = json.loads(path.read_text())
            if not isinstance(model, dict):
                raise ValueError("Splink model JSON must be an object")  # noqa: TRY004
        self._model_dict = model
        return model

    def _prediction_settings(self, n_left: int, n_right: int) -> Any:
        """Build settings for a prediction, including the correct random-match prior.

        Args:
            n_left: Number of records in the left dataset.
            n_right: Number of records in the right dataset.

        Returns:
            A settings dictionary or settings object accepted by Splink.
        """
        all_pairs = n_left * n_right <= self.all_pairs_limit
        prior = _match_prior(n_left, n_right)
        if self.unsupervised:
            return settings(all_pairs, self.single_axis_level, match_prior=prior)
        model = deepcopy(self._load_model())
        model.pop("training", None)
        model["blocking_rules_to_generate_predictions"] = blocking_rules(all_pairs)
        model["retain_intermediate_calculation_columns"] = True
        # Within one comparison, at most min(n) of the n_left * n_right pairs are matches.
        model["probability_two_random_records_match"] = prior
        return model

    def score(
        self,
        left: Dataset,
        right: Dataset,
        left_indices: Sequence[int],
        right_indices: Sequence[int],
    ) -> list[ScoredPair]:
        """Predict candidate pairs using Splink.

        Args:
            left: First input dataset.
            right: Second input dataset.
            left_indices: Left record indices still available for linking.
            right_indices: Right record indices still available for linking.

        Returns:
            Match probabilities, ranks, and field-level match explanations.
        """
        # Use whole files to measure how common each value is; exact-pass leftovers
        # can make rare names look common and weaken otherwise convincing matches.
        wanted_left, wanted_right = set(left_indices), set(right_indices)
        left_rows = [splink_row(r, f"L:{r.index}") for r in left.records]
        right_rows = [splink_row(r, f"R:{r.index}") for r in right.records]
        prediction_settings = self._prediction_settings(len(left_rows), len(right_rows))
        linker = _linker(left_rows, right_rows, prediction_settings)

        if self.unsupervised:
            _train_em(linker)

        predictions = linker.inference.predict(
            threshold_match_probability=min(0.01, self.review_threshold)
        ).as_record_list()
        pairs: list[ScoredPair] = []
        for row in predictions:
            pair = _prediction_pair(row)
            if pair.left in wanted_left and pair.right in wanted_right:
                pairs.append(pair)
        return pairs
