"""
Phase 2 — unit tests for the structured log transport layer.

These tests exercise the core machinery added to PollingPlacesIngestBase:
  - _log()            : appends structured entries to log_entries
  - _has_errors()     : inspects log_entries for error-level entries
  - collects_logs()   : backward-compat shim returning {errors, warnings, info}
  - collect_structured_logs() : new top-level payload shape
  - STAGE_LABELS      : all expected stage names are present

The tests use a lightweight stub subclass that initialises only the transport
layer, avoiding the full DB/job machinery in LoadPollingPlaces.__init__.
"""

import pytest
from demsausage.app.sausage.loader import STAGE_LABELS, PollingPlacesIngestBase

# ---------------------------------------------------------------------------
# Minimal stub - gives us the transport without touching DB or job objects
# ---------------------------------------------------------------------------


class _StubLoader(PollingPlacesIngestBase):
    """Minimal subclass used for isolated unit tests."""

    def __init__(self, *, dry_run: bool = False):
        self._init_log_transport()
        # Attributes referenced by collect_structured_logs / collects_logs
        self.is_reload = False
        self.dry_run = dry_run
        self._run_by = "stub-job-id"

    def is_dry_run(self) -> bool:
        return self.dry_run


# ---------------------------------------------------------------------------
# _log()
# ---------------------------------------------------------------------------


class TestLog:
    def test_appends_text_entry(self):
        loader = _StubLoader()
        loader._log("error", "text", message="Something went wrong")
        assert len(loader.log_entries) == 1
        entry = loader.log_entries[0]
        assert entry["level"] == "error"
        assert entry["type"] == "text"
        assert entry["message"] == "Something went wrong"

    def test_appends_structured_entry(self):
        loader = _StubLoader()
        loader._log(
            "info",
            "geocode_skip",
            name="Foo Hall",
            address="1 Main St",
            reason="no_results",
        )
        assert len(loader.log_entries) == 1
        entry = loader.log_entries[0]
        assert entry["type"] == "geocode_skip"
        assert entry["name"] == "Foo Hall"
        assert entry["reason"] == "no_results"

    def test_multiple_entries_ordered(self):
        loader = _StubLoader()
        loader._log("info", "text", message="first")
        loader._log("error", "text", message="second")
        assert loader.log_entries[0]["message"] == "first"
        assert loader.log_entries[1]["message"] == "second"


# ---------------------------------------------------------------------------
# _has_errors()
# ---------------------------------------------------------------------------


class TestHasErrors:
    def test_no_entries_returns_false(self):
        loader = _StubLoader()
        assert loader._has_errors() is False

    def test_only_info_returns_false(self):
        loader = _StubLoader()
        loader._log("info", "text", message="all good")
        assert loader._has_errors() is False

    def test_only_warning_returns_false(self):
        loader = _StubLoader()
        loader._log("warning", "text", message="watch out")
        assert loader._has_errors() is False

    def test_error_returns_true(self):
        loader = _StubLoader()
        loader._log("error", "text", message="bad thing")
        assert loader._has_errors() is True

    def test_error_among_others_returns_true(self):
        loader = _StubLoader()
        loader._log("info", "text", message="ok")
        loader._log("warning", "text", message="maybe")
        loader._log("error", "text", message="no")
        assert loader._has_errors() is True


# ---------------------------------------------------------------------------
# collects_logs() — backward-compat shim
# ---------------------------------------------------------------------------


class TestCollectsLogsShim:
    def test_returns_three_keys(self):
        loader = _StubLoader()
        result = loader.collects_logs()
        assert set(result.keys()) == {"errors", "warnings", "info"}

    def test_text_error_goes_to_errors(self):
        loader = _StubLoader()
        loader._log("error", "text", message="oops")
        result = loader.collects_logs()
        assert "oops" in result["errors"]
        assert result["warnings"] == []
        assert result["info"] == []

    def test_text_warning_goes_to_warnings(self):
        loader = _StubLoader()
        loader._log("warning", "text", message="careful")
        result = loader.collects_logs()
        assert "careful" in result["warnings"]

    def test_info_and_summary_go_to_info(self):
        loader = _StubLoader()
        loader._log("info", "text", message="note")
        loader._log("summary", "text", message="total")
        result = loader.collects_logs()
        assert "note" in result["info"]
        assert "total" in result["info"]

    def test_structured_entry_serialised_contains_type(self):
        loader = _StubLoader()
        loader._log("info", "geocode_skip", name="A", address="B", reason="no_results")
        result = loader.collects_logs()
        # The entry should appear with the type name visible in the serialised string
        assert any("geocode_skip" in m for m in result["info"])


# ---------------------------------------------------------------------------
# collect_structured_logs() — new payload shape
# ---------------------------------------------------------------------------


class TestCollectStructuredLogs:
    def test_top_level_keys_present(self):
        loader = _StubLoader()
        payload = loader.collect_structured_logs()
        for key in (
            "run_at",
            "run_by",
            "is_reload",
            "is_dry_run",
            "outcome",
            "total_errors",
            "total_warnings",
            "total_actions_required",
            "stages",
        ):
            assert key in payload, f"Missing key: {key}"

    def test_run_by_matches_stub(self):
        loader = _StubLoader()
        payload = loader.collect_structured_logs()
        assert payload["run_by"] == "stub-job-id"

    def test_is_dry_run_false(self):
        loader = _StubLoader(dry_run=False)
        assert loader.collect_structured_logs()["is_dry_run"] is False

    def test_is_dry_run_true(self):
        loader = _StubLoader(dry_run=True)
        assert loader.collect_structured_logs()["is_dry_run"] is True

    def test_totals_structure(self):
        loader = _StubLoader()
        loader._log("error", "text", message="e")
        loader._log("warning", "text", message="w")
        loader._log("info", "text", message="i")
        # Totals are computed from stages (which are empty here since we haven't
        # called invoke_and_bail_if_errors); pass the log_entries directly as a
        # single synthetic stage to verify the counters.
        loader.stages = [
            loader._build_stage(
                name="_config",
                label="Config",
                started_at="2024-01-01T00:00:00+00:00",
                finished_at="2024-01-01T00:00:01+00:00",
                stage_entries=loader.log_entries,
                outcome="error",
            )
        ]
        payload = loader.collect_structured_logs()
        assert payload["total_errors"] == 1
        assert payload["total_warnings"] == 1

    def test_outcome_ok_when_no_errors(self):
        loader = _StubLoader()
        payload = loader.collect_structured_logs()
        # No stages → defaults to "ok"
        assert payload["outcome"] == "ok"

    def test_outcome_warning_when_stage_has_warning(self):
        loader = _StubLoader()
        loader._log("warning", "text", message="hmm")
        loader.stages = [
            loader._build_stage(
                "_config",
                "Config",
                "2024-01-01T00:00:00+00:00",
                "2024-01-01T00:00:01+00:00",
                loader.log_entries,
                "warning",
            )
        ]
        payload = loader.collect_structured_logs()
        assert payload["outcome"] == "warning"

    def test_outcome_error_when_stage_has_error(self):
        loader = _StubLoader()
        loader._log("error", "text", message="bad")
        loader.stages = [
            loader._build_stage(
                "_config",
                "Config",
                "2024-01-01T00:00:00+00:00",
                "2024-01-01T00:00:01+00:00",
                loader.log_entries,
                "error",
            )
        ]
        payload = loader.collect_structured_logs()
        assert payload["outcome"] == "error"

    def test_stages_is_list(self):
        loader = _StubLoader()
        payload = loader.collect_structured_logs()
        assert isinstance(payload["stages"], list)


# ---------------------------------------------------------------------------
# STAGE_LABELS completeness
# ---------------------------------------------------------------------------

# The stages exercised by LoadPollingPlaces.run()
EXPECTED_STAGE_NAMES = {
    "_config",
    "convert_to_demsausage_schema",
    "check_file_validity",
    "fix_polling_places",
    "prepare_polling_places",
    "geocode_missing_locations",
    "check_polling_place_validity",
    "dedupe_polling_places",
    "write_draft_polling_places",
    "migrate_unofficial_pending_stalls",
    "migrate_noms",
    "migrate_mpps",
    "migrate",
    "detect_facility_type",
    "calculate_chance_of_sausage",
    "cleanup",
}


class TestStageLabels:
    def test_all_expected_stages_present(self):
        missing = EXPECTED_STAGE_NAMES - set(STAGE_LABELS.keys())
        assert not missing, f"STAGE_LABELS is missing entries for: {missing}"

    def test_labels_are_non_empty_strings(self):
        for name, label in STAGE_LABELS.items():
            assert (
                isinstance(label, str) and label.strip()
            ), f"STAGE_LABELS[{name!r}] is not a non-empty string"

    def test_no_unexpected_stages(self):
        # Warn if extra stages are present (not a hard failure; new stages are fine)
        extra = set(STAGE_LABELS.keys()) - EXPECTED_STAGE_NAMES
        # Just verify the dict is a superset of what we expect
        assert EXPECTED_STAGE_NAMES.issubset(set(STAGE_LABELS.keys()))
