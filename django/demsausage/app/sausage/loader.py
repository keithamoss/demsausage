import csv
import json
import re
from datetime import datetime, timezone
from io import StringIO

import chardet
import googlemaps
from demsausage.app.enums import (
    MetaPollingPlaceTaskCategory,
    MetaPollingPlaceTaskStatus,
    MetaPollingPlaceTaskType,
    PollingPlaceState,
    PollingPlaceStatus,
    StallStatus,
)
from demsausage.app.exceptions import BadRequest
from demsausage.app.models import (
    ElectoralBoundaries,
    MetaPollingPlaces,
    MetaPollingPlacesTasks,
    PollingPlaces,
    Stalls,
)
from demsausage.app.sausage.chance_of_sausage import (
    calculate_chance_of_sausage,
    calculate_chance_of_sausage_stats,
)
from demsausage.app.sausage.polling_places import find_by_distance
from demsausage.app.serializers import (
    PollingPlaceLoaderEventsSerializer,
    PollingPlacesManagementSerializer,
)
from demsausage.rq.jobs import task_regenerate_cached_election_data
from demsausage.util import (
    convert_string_to_number,
    get_env,
    is_numeric,
    make_logger,
    merge_and_sum_dicts,
)
from rq import get_current_job

from django.contrib.gis.geos import Point
from django.db import transaction
from django.db.models import Q

logger = make_logger(__name__)

# ---------------------------------------------------------------------------
# Stage labels — human-readable names keyed by method name.
# ---------------------------------------------------------------------------

STAGE_LABELS = {
    "_config": "Config Validation",
    "convert_to_demsausage_schema": "Convert to Schema",
    "check_file_validity": "File Validity",
    "fix_polling_places": "Field Fixers",
    "prepare_polling_places": "Prepare Polling Places",
    "geocode_missing_locations": "Geocoding",
    "check_polling_place_validity": "Polling Place Validity",
    "dedupe_polling_places": "Deduplication",
    "write_draft_polling_places": "Write Draft",
    "migrate_unofficial_pending_stalls": "Unofficial Stall Migration",
    "migrate_noms": "Noms Migration",
    "migrate_mpps": "Meta Polling Place Migration",
    "migrate": "Migration",
    "detect_facility_type": "Facility Type Detection",
    "calculate_chance_of_sausage": "Chance of Sausage",
    "cleanup": "Cleanup",
}


class _LoggerCompat:
    """
    Backward-compatible logger shim used by RollbackPollingPlaces (out of
    scope for the Phase 2 structured-log refactor).  Delegates to _log() on
    the host loader so RollbackPollingPlaces method bodies need no changes.
    """

    def __init__(self, host):
        self._host = host

    def error(self, msg):
        self._host._log("error", "text", message=str(msg))

    def warning(self, msg):
        self._host._log("warning", "text", message=str(msg))

    def info(self, msg):
        self._host._log("info", "text", message=str(msg))


class PollingPlacesIngestBase:
    """
    IMPORTANT: This class assumes it is run inside an @transaction.atomic block.
    """

    # ------------------------------------------------------------------
    # New structured log transport (Phase 2)
    # ------------------------------------------------------------------

    def _init_log_transport(self):
        """Initialise log state.  Must be called at the top of each subclass __init__."""
        self.log_entries: list[dict] = []
        self.stages: list[dict] = []
        # Backward-compat shim for RollbackPollingPlaces (uses self.logger.* directly)
        self.logger = _LoggerCompat(self)

    def _log(self, level: str, type: str, **kwargs):
        """Append a structured log entry."""
        self.log_entries.append({"level": level, "type": type, **kwargs})

    def _has_errors(self) -> bool:
        return any(e["level"] == "error" for e in self.log_entries)

    # ------------------------------------------------------------------
    # Stage snapshotting helpers
    # ------------------------------------------------------------------

    def _current_stage_entries(self, entries_before: list[dict]) -> list[dict]:
        """Return log entries that were added since *entries_before* was captured."""
        return self.log_entries[len(entries_before) :]

    @staticmethod
    def _build_stage(
        name: str,
        label: str,
        started_at: str,
        finished_at: str,
        stage_entries: list[dict],
        outcome: str,
    ) -> dict:
        started = datetime.fromisoformat(started_at)
        finished = datetime.fromisoformat(finished_at)
        duration = round((finished - started).total_seconds(), 3)

        errors = [e for e in stage_entries if e["level"] == "error"]
        warnings = [e for e in stage_entries if e["level"] == "warning"]
        summaries = [e for e in stage_entries if e["level"] == "summary"]
        detail = [e for e in stage_entries if e["level"] == "info"]

        return {
            "name": name,
            "label": label,
            "started_at": started_at,
            "finished_at": finished_at,
            "duration_seconds": duration,
            "outcome": outcome,
            "total_entry_count": len(stage_entries),
            "errors": errors,
            "warnings": warnings,
            "summaries": summaries,
            "detail": detail,
        }

    # ------------------------------------------------------------------
    # Backward-compat helpers (Phase 1 tests use these)
    # ------------------------------------------------------------------

    def has_errors_messages(self) -> bool:
        return self._has_errors()

    def collects_logs(self) -> dict:
        """
        Backward-compat shim: builds the old flat {errors, warnings, info} dict
        from the new log_entries list.  Calls save_logs() with the new structured
        payload so DB / disk always get the new format.

        Used by:
        - Phase 1 test assertions (conftest.run_loader_dry, test_detect_facility)
        - RollbackPollingPlaces (sub-class, overrides run())
        """

        def _text(entry: dict) -> str:
            if entry.get("type") == "text":
                return entry.get("message", "")
            # For structured types include the type so assertions can match on it
            keys = {k: v for k, v in entry.items() if k != "level"}
            return str(keys)

        logs = {
            "errors": [_text(e) for e in self.log_entries if e["level"] == "error"],
            "warnings": [_text(e) for e in self.log_entries if e["level"] == "warning"],
            "info": [
                _text(e) for e in self.log_entries if e["level"] in ("info", "summary")
            ],
        }
        self.save_logs(self.collect_structured_logs())
        return logs

    # ------------------------------------------------------------------
    # New structured payload
    # ------------------------------------------------------------------

    def collect_structured_logs(self) -> dict:
        """
        Build and return the fully structured loader payload (new Phase 2 format).
        Saves to disk and DB via save_logs().
        """
        total_errors = sum(len(s["errors"]) for s in self.stages)
        total_warnings = sum(len(s["warnings"]) for s in self.stages)
        total_actions_required = sum(
            1
            for s in self.stages
            for entries in (s["errors"], s["warnings"], s["summaries"], s["detail"])
            for e in entries
            if e.get("action") is not None
        )

        # Polling place stats — populated by the migrate stage summary entry
        total_polling_places = None
        delta_total = None
        new_polling_places = None
        deleted_polling_places = None
        for stage in self.stages:
            if stage["name"] == "migrate":
                for entry in stage["summaries"]:
                    if entry.get("type") == "migrate_stats":
                        total_polling_places = entry.get("total_polling_places")
                        delta_total = entry.get("delta_total")
                        new_polling_places = entry.get("new_polling_places")
                        deleted_polling_places = entry.get("deleted_polling_places")
                break

        run_at = (
            self.stages[0]["started_at"]
            if self.stages
            else datetime.now(timezone.utc).isoformat()
        )
        run_by = getattr(self, "_run_by", None)

        # Determine overall outcome
        if any(s["outcome"] == "error" for s in self.stages):
            overall_outcome = "error"
        elif any(s["outcome"] == "warning" for s in self.stages):
            overall_outcome = "warning"
        else:
            overall_outcome = "ok"

        return {
            "run_at": run_at,
            "run_by": run_by,
            "is_reload": getattr(self, "is_reload", None),
            "is_dry_run": getattr(self, "dry_run", False),
            "outcome": overall_outcome,
            "total_errors": total_errors,
            "total_warnings": total_warnings,
            "total_actions_required": total_actions_required,
            "total_polling_places": total_polling_places,
            "delta_total": delta_total,
            "new_polling_places": new_polling_places,
            "deleted_polling_places": deleted_polling_places,
            "stages": self.stages,
        }

    def save_logs(self, payload: dict):
        with open(
            "/app/logs/pollingplaceloader-{}.json".format(
                datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")
            ),
            "w",
        ) as f:
            json.dump(payload, f, default=str)

        serializer = PollingPlaceLoaderEventsSerializer(
            data={
                "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S"),
                "payload": payload,
            }
        )

        if serializer.is_valid() is True:
            serializer.save()
        else:
            raise BadRequest("Error saving logs :(")

    # ------------------------------------------------------------------
    # Error checking / flow control
    # ------------------------------------------------------------------

    def raise_exception_if_errors(self):
        if self._has_errors() is True:
            print("Bailing with errors")
            exc = BadRequest(
                {
                    "message": "Oh dear, looks like we hit a snag (get it - snag?!)",
                }
            )
            # Attach the partial structured payload directly on the exception
            # so tests can access it via getattr(exc, "_partial_payload") even
            # when the exception is raised from __init__ (before the loader
            # variable is bound in the caller).
            exc._partial_payload = self.collect_structured_logs()
            raise exc

    def is_dry_run(self):
        return self.dry_run

    def has_pending_stalls(self):
        return (
            Stalls.objects.filter(
                election_id=self.election.id, status=StallStatus.PENDING
            ).count()
            > 0
        )

    # ------------------------------------------------------------------
    # Shared utilities
    # ------------------------------------------------------------------

    def safe_find_by_distance(self, label, *args, **kwargs):
        results = find_by_distance(*args, **kwargs)
        count = results.count()
        if count >= 2:
            self._log(
                "error",
                "spatial_proximity",
                stage_name=label,
                polling_places=[
                    {"name": pp.name, "premises": pp.premises, "address": pp.address}
                    for pp in results
                ],
            )
        return results

    def invoke_and_bail_if_errors(self, method_name):
        print("Calling {}".format(method_name))

        job = getattr(self, "job", None)
        if job is not None:
            job.meta["_polling_place_loading_stages_log"].append(method_name)
            job.save_meta()

        entries_before = list(self.log_entries)
        started_at = datetime.now(timezone.utc).isoformat()

        mid_stage_exc = None
        try:
            getattr(self, method_name)()
        except BadRequest as e:
            # Some stage methods call self.raise_exception_if_errors() themselves
            # before returning.  Catch it here so we can still record the stage
            # entry before re-raising.
            mid_stage_exc = e

        finished_at = datetime.now(timezone.utc).isoformat()
        stage_entries = self._current_stage_entries(entries_before)

        # Determine outcome
        if any(e["level"] == "error" for e in stage_entries):
            outcome = "error"
        elif any(e["level"] == "warning" for e in stage_entries):
            outcome = "warning"
        else:
            outcome = "ok"

        self.stages.append(
            self._build_stage(
                name=method_name,
                label=STAGE_LABELS.get(method_name, method_name),
                started_at=started_at,
                finished_at=finished_at,
                stage_entries=stage_entries,
                outcome=outcome,
            )
        )

        if mid_stage_exc is not None:
            # Re-raise with updated partial payload now that the stage is recorded.
            mid_stage_exc._partial_payload = self.collect_structured_logs()
            raise mid_stage_exc

        self.raise_exception_if_errors()


class LoadPollingPlaces(PollingPlacesIngestBase):
    """
    IMPORTANT: This class assumes it is run inside an @transaction.atomic block.
    """

    def __init__(self, election, file, dry_run, config, user_email=None):
        # Initialise new structured log transport first so _log() is available
        # before check_config_is_valid runs.
        self._init_log_transport()

        def _get_config_or_none(param_name, config):
            return (
                config[param_name]
                if self.has_config is True and param_name in config
                else None
            )

        def check_config_is_valid(config):
            if config is not None:
                for field in config.keys():
                    if field not in allowed_fields:
                        self._log(
                            "error",
                            "text",
                            message="Config: Invalid field '{}' in config".format(
                                field
                            ),
                        )

                if "address_fields" in config and "address_format" not in config:
                    self._log(
                        "error",
                        "text",
                        message="Config: address_format required if address_fields provided",
                    )
                if "address_fields" not in config and "address_format" in config:
                    self._log(
                        "error",
                        "text",
                        message="Config: address_fields required if address_format provided",
                    )

                return True

        self.election = election
        self.dry_run = dry_run
        self.is_reload = False  # will be set accurately at the top of run()

        allowed_fields = [
            "filters",
            "exclude_columns",
            "rename_columns",
            "add_columns",
            "extras",
            "cleaning_regexes",
            "address_fields",
            "address_format",
            "division_fields",
            "fix_data_issues",
            "overwrite_distance_thresholds",
            "geocoding",
            "bbox_validation",
            "multiple_division_handling",
        ]

        config_started_at = datetime.now(timezone.utc).isoformat()
        self.has_config = (
            True if config is not None and check_config_is_valid(config) else False
        )
        config_finished_at = datetime.now(timezone.utc).isoformat()

        # Wrap any config-validation log entries in a synthetic _config stage.
        config_entries = list(self.log_entries)
        if config_entries:
            config_outcome = (
                "error" if any(e["level"] == "error" for e in config_entries) else "ok"
            )
        else:
            config_outcome = "ok"
        self.stages.append(
            self._build_stage(
                name="_config",
                label=STAGE_LABELS["_config"],
                started_at=config_started_at,
                finished_at=config_finished_at,
                stage_entries=config_entries,
                outcome=config_outcome,
            )
        )

        self.raise_exception_if_errors()
        for field_name in allowed_fields:
            setattr(self, field_name, _get_config_or_none(field_name, config))

        if self.geocoding is not None and self.geocoding["enabled"] is True:
            self.gmaps = googlemaps.Client(key=get_env("GOOGLE_GEOCODING_API_KEY"))

        self.file = file
        file_body = self.file.read()
        encoding = chardet.detect(file_body)["encoding"]
        self.reader = csv.DictReader(StringIO(file_body.decode(encoding)))
        self.polling_places = list(self.reader)

        self.job = get_current_job()
        self.job.meta["_polling_place_loading_stages_log"] = []
        self.job.save_meta()

        # Capture who triggered this load (passed from the view via the job)
        self._run_by = user_email

    def can_loading_begin(self):
        # if self.has_pending_stalls() is True:
        #     return False
        return True

    def convert_to_demsausage_schema(self):
        def _filter():
            def _apply_filter(polling_place):
                for filter in self.filters:
                    if filter["type"] == "is_exactly":
                        if polling_place[filter["column"]] not in filter["matches"]:
                            return False
                return True

            if self.filters is not None:
                filtered_polling_places = []
                for polling_place in self.polling_places:
                    if _apply_filter(polling_place) is True:
                        filtered_polling_places.append(polling_place)

                self._log(
                    "summary",
                    "text",
                    message="{} of {} polling places filtered out".format(
                        len(self.polling_places) - len(filtered_polling_places),
                        len(self.polling_places),
                    ),
                )
                self.polling_places = filtered_polling_places

        def _exclude_columns():
            def _remove_excluded_fields(polling_place):
                return {
                    field_name: polling_place[field_name]
                    for idx, field_name in enumerate(polling_place)
                    if field_name not in self.exclude_columns
                }

            if self.exclude_columns is not None:
                processed_polling_places = []
                for polling_place in self.polling_places:
                    processed_polling_places.append(
                        _remove_excluded_fields(polling_place)
                    )

                self._log(
                    "summary",
                    "text",
                    message="Removed {} columns".format(len(self.exclude_columns)),
                )
                self.polling_places = processed_polling_places

        def _rename_columns():
            def _rename_fields(polling_place):
                for current_name, new_name in self.rename_columns.items():
                    polling_place[new_name] = polling_place[current_name]
                    del polling_place[current_name]
                return polling_place

            if self.rename_columns is not None:
                processed_polling_places = []
                for polling_place in self.polling_places:
                    processed_polling_places.append(_rename_fields(polling_place))

                self._log(
                    "summary",
                    "text",
                    message="Renamed {} columns".format(len(self.rename_columns)),
                )
                self.polling_places = processed_polling_places

        def _add_columns():
            def _add_fields(polling_place):
                for column_name, column_value in self.add_columns.items():
                    polling_place[column_name] = column_value
                return polling_place

            if self.add_columns is not None:
                processed_polling_places = []
                for polling_place in self.polling_places:
                    processed_polling_places.append(_add_fields(polling_place))

                self._log(
                    "summary",
                    "text",
                    message="Added {} new columns".format(len(self.add_columns)),
                )
                self.polling_places = processed_polling_places

        def _create_extras():
            def _create(polling_place):
                extras = {}
                for field_name in self.extras["fields"]:
                    if is_numeric(polling_place[field_name]) is True:
                        extras[field_name] = convert_string_to_number(
                            polling_place[field_name]
                        )
                    elif polling_place[field_name] is not None:
                        extras[field_name] = polling_place[field_name]
                    del polling_place[field_name]

                polling_place["extras"] = extras
                return polling_place

            if self.extras is not None:
                processed_polling_places = []
                for polling_place in self.polling_places:
                    processed_polling_places.append(_create(polling_place))

                self._log(
                    "summary",
                    "text",
                    message="Packed {} column(s) into the extras field".format(
                        len(self.extras["fields"])
                    ),
                )
                self.polling_places = processed_polling_places

        # def _skip_blank_coordinates():
        #     def _has_blank_coordinates(polling_place):
        #         return len(polling_place["lon"].strip()) == 0 or len(polling_place["lat"].strip()) == 0

        #     processed_polling_places = []
        #     skipped_polling_places = []
        #     for polling_place in self.polling_places:
        #         if _has_blank_coordinates(polling_place) is False:
        #             processed_polling_places.append(polling_place)
        #         else:
        #             skipped_polling_places.append("{} ({})".format(polling_place["name"], polling_place["premises"]))

        #     self.polling_places = processed_polling_places

        #     if len(skipped_polling_places) > 0:
        #         self.logger.warning("Skipped {} polling places with blank coordinates. {}".format(len(skipped_polling_places), ", ".join(skipped_polling_places)))

        def _run_regexes():
            def _apply_regexes(polling_place):
                for regex in self.cleaning_regexes:
                    # If we need to include field names at some point in the future
                    # field_data = {key: value.strip() for (key, value) in dict(polling_place).items() if key in regex["fields"]}
                    # match = re.search(regex["regex"].format(**field_data), polling_place[regex["field"]])

                    match = re.search(
                        regex["regex"], polling_place[regex["field"]].strip()
                    )
                    if match:
                        polling_place[regex["field"]] = match.groupdict()[
                            "main"
                        ].strip()
                    else:
                        self._log(
                            "error",
                            "text",
                            message="Cleaning regex '{}' did not match field value '{}'".format(
                                regex["regex"], polling_place[regex["field"]]
                            ),
                        )
                return polling_place

            if self.cleaning_regexes is not None:
                processed_polling_places = []
                for polling_place in self.polling_places:
                    processed_polling_places.append(_apply_regexes(polling_place))

                self._log(
                    "summary",
                    "text",
                    message="Ran {} cleaning regexes".format(
                        len(self.cleaning_regexes)
                    ),
                )
                self.polling_places = processed_polling_places

        _filter()
        _rename_columns()
        _add_columns()
        _create_extras()
        _exclude_columns()
        # _skip_blank_coordinates()
        _run_regexes()

        self.raise_exception_if_errors()

    def check_file_validity(self):
        def _get_header():
            return self.polling_places[0].keys()

        def check_file_header_validity(header):
            allowable_field_names = [
                f.name for f in PollingPlaces._meta.get_fields()
            ] + ["lat", "lon"]
            if self.address_fields is not None:
                allowable_field_names += self.address_fields
            if self.division_fields is not None:
                allowable_field_names += self.division_fields

            required_model_field_names = [
                f.name
                for f in PollingPlaces._meta.get_fields()
                if hasattr(f, "blank")
                and f.blank is False
                and hasattr(f, "null")
                and f.null is False
                and f.name not in ("geom", "election", "status")
            ] + ["lat", "lon"]

            # We're doing on-the-fly address merging in prepare_polling_places(). This will attach an address field for us.
            if self.address_fields is not None:
                del required_model_field_names[
                    required_model_field_names.index("address")
                ]

            # Batch: check for allowable field names (unknown/excess fields)
            unknown_fields = [
                field for field in header if field not in allowable_field_names
            ]
            if unknown_fields:
                self._log(
                    "error",
                    "text",
                    message="Unknown fields in header: {}".format(
                        ", ".join(unknown_fields)
                    ),
                )

            # Batch: check for mandatory field names
            missing_fields = [
                field for field in required_model_field_names if field not in header
            ]
            if missing_fields:
                self._log(
                    "error",
                    "text",
                    message="Required fields missing from header: {}".format(
                        ", ".join(missing_fields)
                    ),
                )

            # Batch: check for address fields (if necessary)
            if self.address_fields is not None:
                missing_addr = [
                    field for field in self.address_fields if field not in header
                ]
                if missing_addr:
                    self._log(
                        "error",
                        "text",
                        message="Required address fields missing from header: {}".format(
                            ", ".join(missing_addr)
                        ),
                    )

            # Batch: check for division fields (if necessary)
            if self.division_fields is not None:
                missing_div = [
                    field for field in self.division_fields if field not in header
                ]
                if missing_div:
                    self._log(
                        "error",
                        "text",
                        message="Required division fields missing from header: {}".format(
                            ", ".join(missing_div)
                        ),
                    )

        def check_ec_id_is_unique():
            if "ec_id" in self.polling_places[0]:
                ec_id_tracker = []
                blank_ec_id_counter = 0

                for polling_place in self.polling_places:
                    if polling_place["ec_id"] is None or polling_place["ec_id"] == "":
                        blank_ec_id_counter += 1
                    else:
                        if polling_place["ec_id"] in ec_id_tracker:
                            self._log(
                                "error",
                                "ec_id_duplicate",
                                name=polling_place["name"],
                                premises=polling_place["premises"],
                                ec_id=polling_place["ec_id"],
                            )

                        ec_id_tracker.append(polling_place["ec_id"])

                # We only care about blanks if any polling place have an ec_id (not all Electoral Commissions deliver ec_ids)
                if blank_ec_id_counter > 0 and len(ec_id_tracker) > 0:
                    self._log(
                        "warning",
                        "text",
                        message="{} polling places have blank ec_id".format(
                            blank_ec_id_counter
                        ),
                    )

        # Ensure we have all of the required fields and no unknown/excess fields
        check_file_header_validity(_get_header())
        check_ec_id_is_unique()

        self.raise_exception_if_errors()

    def prepare_polling_places(self):
        def _prepare_polling_place(polling_place):
            def get_or_merge_address_fields(polling_place):
                if "address" in polling_place:
                    return polling_place

                if self.address_format is not None:
                    address_data = {
                        key: value.strip()
                        for (key, value) in dict(polling_place).items()
                        if key in self.address_fields
                    }
                    address = self.address_format.format(**address_data)

                    # Handle missing address components
                    address = re.sub(r"\s{2,}", " ", address)
                    address = (
                        address.replace(", ,", ",")
                        .replace(" , ", ", ")
                        .replace(",, ", ", ")
                        .strip()
                    )
                    if address.startswith(",") is True:
                        address = address[1:]
                    if address.endswith(",") is True:
                        address = address[:-1]

                    polling_place["address"] = address

                    # Trim now merged polling place address component fields
                    for field in self.address_fields:
                        del polling_place[field]

                    return polling_place

                self._log(
                    "error",
                    "text",
                    message="No address or address fields found for '{}'".format(
                        polling_place["name"]
                    ),
                )

            def get_or_merge_divisions_fields(polling_place):
                if "divisions" in polling_place:
                    polling_place["divisions"] = [
                        d.strip() for d in polling_place["divisions"].split(",")
                    ]
                    return polling_place

                if self.division_fields is not None:
                    polling_place["divisions"] = [
                        value.strip()
                        for (key, value) in dict(polling_place).items()
                        if key in self.division_fields and value.strip() != ""
                    ]

                    # Trim the now merged divisions fields
                    for field in self.division_fields:
                        del polling_place[field]

                    return polling_place

                return polling_place

            def _has_blank_coordinates(polling_place):
                # Blank (empty)
                if (
                    len(str(polling_place["lon"]).strip()) == 0
                    or len(str(polling_place["lat"]).strip()) == 0
                ):
                    return True

                # Literal string "0"
                if (
                    str(polling_place["lon"]).strip() == "0"
                    or str(polling_place["lat"]).strip() == "0"
                ):
                    return True

                return False

            # Blanks will be filled in by the next step (geocode_missing_locations)
            if _has_blank_coordinates(polling_place) is False:
                polling_place["geom"] = Point(
                    float(polling_place["lon"]), float(polling_place["lat"]), srid=4326
                )
                del polling_place["lon"]
                del polling_place["lat"]

            if (
                "facility_type" not in polling_place
                or polling_place["facility_type"] == ""
            ):
                polling_place["facility_type"] = None
            polling_place["status"] = PollingPlaceStatus.DRAFT
            polling_place["election"] = self.election.id
            polling_place["ec_id"] = (
                polling_place["ec_id"] if polling_place["ec_id"] != "" else None
            )
            polling_place = get_or_merge_address_fields(polling_place)
            polling_place = get_or_merge_divisions_fields(polling_place)

            return polling_place

        # Prepare each polling place for ingest by merging addresses, merging by division, et cetera
        processed_polling_places = []
        for polling_place in self.polling_places:
            processed_polling_places.append(_prepare_polling_place(polling_place))
        self.polling_places = processed_polling_places

        self.raise_exception_if_errors()

    def geocode_missing_locations(self):
        def _geocode_polling_places():
            def _has_blank_coordinates(polling_place):
                return "geom" not in polling_place

            def _geocode(polling_place):
                def _do_geocode(term):
                    def _is_good_result(geocode_result):
                        if len(geocode_result) == 0:
                            return False
                        elif len(geocode_result) > 1:
                            return False
                        else:
                            return True

                    geocode_result = self.gmaps.geocode(
                        term, components=self.geocoding["components"]
                    )

                    if _is_good_result(geocode_result) is False:
                        return None
                    return geocode_result[0]

                def _get_best_result(polling_place):
                    geocode_result = _do_geocode(
                        "{}, {}".format(
                            polling_place["premises"], polling_place["address"]
                        )
                    )

                    if geocode_result is None:
                        geocode_result = _do_geocode(polling_place["premises"])

                        if geocode_result is None:
                            geocode_result = _do_geocode(polling_place["address"])

                            if geocode_result is None:
                                self._log(
                                    "warning",
                                    "geocode_skip",
                                    reason="no_results",
                                    premises=polling_place["premises"],
                                    address=polling_place["address"],
                                )

                    return geocode_result

                def _is_geocoding_accurate_enough(geocode_result):
                    # https://stackoverflow.com/a/32038696
                    if (
                        "partial_match" in geocode_result
                        and geocode_result["partial_match"] is True
                    ):
                        if geocode_result["geometry"]["location_type"] == "ROOFTOP":
                            return True
                        return False

                    return True

                geocode_result = _get_best_result(polling_place)

                if geocode_result is not None:
                    if _is_geocoding_accurate_enough(geocode_result) is True:
                        polling_place["geom"] = Point(
                            float(geocode_result["geometry"]["location"]["lng"]),
                            float(geocode_result["geometry"]["location"]["lat"]),
                            srid=4326,
                        )
                        del polling_place["lon"]
                        del polling_place["lat"]

                        return polling_place
                    else:
                        self._log(
                            "warning",
                            "geocode_skip",
                            reason="not_accurate_enough",
                            premises=polling_place["premises"],
                            address=polling_place["address"],
                            geocode_result=geocode_result,
                        )

                return None

            processed_polling_places = []
            skipped_polling_places = []
            geocoding_success_counter = 0
            geocoding_skipped_counter = 0

            for polling_place in self.polling_places:
                if _has_blank_coordinates(polling_place) is False:
                    processed_polling_places.append(polling_place)
                else:
                    if self.geocoding is not None and self.geocoding["enabled"] is True:
                        new_polling_place = _geocode(polling_place)
                        if new_polling_place is not None:
                            geocoding_success_counter += 1
                            processed_polling_places.append(new_polling_place)
                        else:
                            geocoding_skipped_counter += 1

                    else:
                        geocoding_skipped_counter += 1
                        # "not enabled" is folded into the combined geocoding summary — not a per-row warning

            self.polling_places = processed_polling_places

            # Merged geocoding summary (combines success + skip into one line)
            geocoding_enabled = self.geocoding is not None and self.geocoding.get(
                "enabled", False
            )
            if geocoding_enabled:
                self._log(
                    "summary",
                    "text",
                    message="Geocoding complete: {} geocoded, {} skipped".format(
                        geocoding_success_counter, geocoding_skipped_counter
                    ),
                )
            else:
                self._log(
                    "summary",
                    "text",
                    message="Geocoding complete: {} geocoded, {} skipped — geocoding not enabled".format(
                        geocoding_success_counter, geocoding_skipped_counter
                    ),
                )

        _geocode_polling_places()

        self.raise_exception_if_errors()

    def fix_polling_places(self):
        def _fix():
            def _apply_fix(config, polling_place):
                fixed_polling_place = polling_place
                for defn in config["overwrite"]:
                    if defn["field"] in polling_place:
                        # self.logger.info("Setting {} to {} for {} = {} for '{}'".format(defn["field"], defn["value"], config["field"], config["value"], polling_place["premises"]))
                        polling_place[defn["field"]] = defn["value"]
                return fixed_polling_place

            def _fix_matching_polling_places(config, polling_places):
                processed_polling_places = []

                for polling_place in polling_places:
                    if config["field"] in polling_place and str(
                        polling_place[config["field"]]
                    ) == str(config["value"]):
                        processed_polling_places.append(
                            _apply_fix(config, polling_place)
                        )
                    else:
                        processed_polling_places.append(polling_place)

                return processed_polling_places

            if self.fix_data_issues is not None:
                processed_polling_places = self.polling_places
                for config in self.fix_data_issues:
                    processed_polling_places = _fix_matching_polling_places(
                        config, processed_polling_places
                    )

                self._log(
                    "summary",
                    "text",
                    message="Ran {} field fixers".format(len(self.fix_data_issues)),
                )
                self.polling_places = processed_polling_places

        _fix()

        self.raise_exception_if_errors()

    def check_polling_place_validity(self):
        def is_polling_place_valid(polling_place):
            serialiser = PollingPlacesManagementSerializer(data=polling_place)
            if serialiser.is_valid() is True:
                return True
            return serialiser.errors

        def is_polling_place_within_election_geom(polling_place):
            return polling_place["geom"].within(self.election.geom)

        # Ensure each polling place is valid
        for polling_place in self.polling_places:
            validation = is_polling_place_valid(polling_place)
            if validation is not True:
                # Normalise DRF error dict to a list of {field, messages} objects
                fields = [
                    {"field": field, "messages": list(msgs)}
                    for field, msgs in validation.items()
                ]
                self._log(
                    "error",
                    "validation_error",
                    name=polling_place["name"],
                    premises=polling_place["premises"],
                    fields=fields,
                )

            if polling_place["state"] != "Overseas":
                if is_polling_place_within_election_geom(polling_place) is False:
                    if (
                        self.bbox_validation is not None
                        and polling_place["name"] not in self.bbox_validation["ignore"]
                    ):
                        self._log(
                            "error",
                            "text",
                            message="Polling place {} ({}) falls outside the election's boundary".format(
                                polling_place["name"], polling_place["premises"]
                            ),
                        )
                    else:
                        self._log(
                            "warning",
                            "text",
                            message="Polling place {} ({}) falls outside the election's boundary (ignored)".format(
                                polling_place["name"], polling_place["premises"]
                            ),
                        )

        self.raise_exception_if_errors()

    def dedupe_polling_places(self):
        def _find_home_division(polling_places):
            if (
                self.multiple_division_handling is not None
                and self.multiple_division_handling["determine_home_division"]
                is not None
            ):
                if (
                    self.multiple_division_handling["determine_home_division"]
                    == "USE_ELECTORAL_BOUNDARIES"
                ):
                    matching_boundaries = ElectoralBoundaries.objects.filter(
                        election_ids__contains=self.election.id
                    ).filter(geom__contains=polling_places[0]["geom"])

                    if len(matching_boundaries) > 1:
                        self._log(
                            "error",
                            "find_home_division_error",
                            polling_place_name=polling_places[0]["name"],
                            reason="multiple_matches",
                            candidates=list(
                                matching_boundaries.values_list(
                                    "division_name", flat=True
                                )
                            ),
                        )
                        return None
                    elif len(matching_boundaries) == 0:
                        self._log(
                            "error",
                            "find_home_division_error",
                            polling_place_name=polling_places[0]["name"],
                            reason="no_match",
                        )
                        return None
                    else:
                        eb_division_name = matching_boundaries[0].division_name

                        try:
                            # We pull the matching division name in the polling place data because they're usually capitalised correctly
                            # (The electoral boundary division names aren't)
                            polling_place_divisions = [
                                division
                                for divisions in [
                                    pp["divisions"] for pp in polling_places
                                ]
                                for division in divisions
                            ]
                            polling_place_divisions_lower = [
                                division.lower() for division in polling_place_divisions
                            ]

                            idx = polling_place_divisions_lower.index(
                                eb_division_name.lower()
                            )
                            return polling_place_divisions[idx]
                        except ValueError:
                            self._log(
                                "error",
                                "find_home_division_error",
                                polling_place_name=polling_places[0]["name"],
                                reason="not_in_list",
                                eb_division=eb_division_name,
                                candidates=list(polling_place_divisions),
                            )
                            return None

            # We'll just use the first one - it'll probably be wrong but whatever
            return polling_places[0]["divisions"][0]

        def _merge_divisions(polling_places):
            home_division = _find_home_division(polling_places)

            if home_division is None:
                # find_home_division_error was already logged by _find_home_division;
                # do not emit an additional redundant entry.
                return []

            # Flatten and dedupe
            divisions = []
            for pp in polling_places:
                divisions += pp["divisions"]
            divisions = list(set(divisions))

            divisions.sort()
            divisions = [home_division] + [
                div for div in divisions if div != home_division
            ]
            return divisions

        def _merge_and_sum_extras(polling_places):
            if "extras" in pp and pp["extras"] != "":
                extras = [pp["extras"] for pp in polling_places]
                return merge_and_sum_dicts(extras)
            return ""

        def get_key(polling_place):
            return "{},{}".format(polling_place["geom"].x, polling_place["geom"].y)

        # Group by lon,lat to detect and merge multi-division polling places
        polling_places_group_by = {}

        for polling_place in self.polling_places:
            key = get_key(polling_place)
            if key not in polling_places_group_by:
                polling_places_group_by[key] = []
            polling_places_group_by[key].append(polling_place)

        indexes_to_remove = []
        for polling_places in [
            i for i in polling_places_group_by.values() if len(i) >= 2
        ]:
            # @TOOD Example links or hacky Google Maps debugging help
            # https://www.google.com.au/maps/place/-37.87558+144.79174
            # https://www.google.com.au/maps/place/Queen+of+Peace+Parish+Primary,+62+Everingham+Rd,+Altona+Meadows+VIC+3028 (note: does not zoom, but just need to click result)

            # Try to ensure that the group polling places are actually the same place
            unique_keys = list(
                set(
                    [
                        "{} ({})".format(pp["name"], pp["premises"])
                        for pp in polling_places
                    ]
                )
            )
            if len(unique_keys) > 1:
                self._log(
                    "error",
                    "text",
                    message="Found multiple unique polling places sharing the same location: {}".format(
                        ", ".join(unique_keys)
                    ),
                )

            key = get_key(polling_places[0])
            indexes = [
                i for i, pp in enumerate(self.polling_places) if get_key(pp) == key
            ]

            # Merge divisions for duplicate polling places
            # Divisions are optional - not all states use them
            if "divisions" in polling_places[0]:
                divisions = []
                for pp in polling_places:
                    divisions += pp["divisions"]
                divisions = list(set(divisions))

                self.polling_places[indexes[0]]["divisions"] = _merge_divisions(
                    polling_places
                )
                self.polling_places[indexes[0]]["extras"] = _merge_and_sum_extras(
                    polling_places
                )

                pp_list = [
                    {
                        "name": pp["name"],
                        "premises": pp["premises"],
                        "address": pp["address"],
                    }
                    for pp in polling_places
                ]
                # Emit as both summary (visible without expanding Detail) and info (full Detail)
                self._log(
                    "summary",
                    "dedup_merge",
                    count=len(indexes),
                    location=key,
                    divisions=divisions,
                    polling_places=pp_list,
                )
                self._log(
                    "info",
                    "dedup_merge",
                    count=len(indexes),
                    location=key,
                    divisions=divisions,
                    polling_places=pp_list,
                )
            else:
                pp_list = [
                    {
                        "name": pp["name"],
                        "premises": pp["premises"],
                        "address": pp["address"],
                    }
                    for pp in polling_places
                ]
                # Emit as both summary and info
                self._log(
                    "summary",
                    "dedup_discard",
                    count=len(indexes) - 1,
                    location=key,
                    polling_places=pp_list,
                )
                self._log(
                    "info",
                    "dedup_discard",
                    count=len(indexes) - 1,
                    location=key,
                    polling_places=pp_list,
                )

            # We can safely remove all bar the first polling place
            indexes_to_remove += indexes[1:]

        # Remove deduplicate polling places
        self.polling_places = [
            polling_place
            for idx, polling_place in enumerate(self.polling_places)
            if idx not in indexes_to_remove
        ]
        # (trailing summary of total merges dropped — frontend computes from dedup_merge entries)

        # To be extra sure - group by name and bail out if there are dupes
        polling_places_group_by = {}

        for polling_place in self.polling_places:
            key = "{}:{}:{}".format(
                polling_place["name"],
                polling_place["premises"],
                polling_place["address"],
            )
            if key not in polling_places_group_by:
                polling_places_group_by[key] = []
            polling_places_group_by[key].append(polling_place)

        for polling_places in [
            i for i in polling_places_group_by.values() if len(i) >= 2
        ]:
            self._log(
                "error",
                "text",
                message="Found {} polling places sharing the same name: '{}'".format(
                    len(polling_places), polling_places[0]["name"]
                ),
            )

        self.raise_exception_if_errors()

    def write_draft_polling_places(self):
        for polling_place in self.polling_places:
            serialiser = PollingPlacesManagementSerializer(data=polling_place)
            if serialiser.is_valid() is True:
                serialiser.save()
            else:
                # pragma: no cover — check_polling_place_validity bails first in normal execution
                fields = [
                    {"field": field, "messages": list(msgs)}
                    for field, msgs in serialiser.errors.items()
                ]
                self._log(
                    "error",
                    "validation_error",
                    name=polling_place.get("name", "?"),
                    premises=polling_place.get("premises", "?"),
                    fields=fields,
                )

    def migrate_unofficial_pending_stalls(self):
        """
        Handles pending stalls that were submitted against unofficial (user-provided)
        polling places (i.e. location_info is set and polling_place is None).

        This happens when stalls are submitted before the first official CSV data is
        loaded. On first load, we match each such stall's location_info geom against
        the incoming DRAFT polling places within a 100m threshold and repoint them.

        Only runs on the first polling place load (polling_places_loaded=False).
        """
        if self.election.polling_places_loaded is True:
            return

        queryset = Stalls.objects.filter(
            election=self.election,
            status=StallStatus.PENDING,
            polling_place__isnull=True,
            location_info__isnull=False,
        )

        count = queryset.count()
        if count == 0:
            self._log(
                "summary",
                "text",
                message="No unofficial pending stalls to migrate",
            )
            return

        self._log(
            "summary",
            "text",
            message="Found {} unofficial pending stall(s) to migrate".format(count),
        )

        matched_count = 0
        for stall in queryset:
            coordinates = stall.location_info["geom"]["coordinates"]
            stall_geom = Point(coordinates[0], coordinates[1], srid=4326)

            matching_polling_places = self.safe_find_by_distance(
                "migrate_unofficial_pending_stalls",
                stall_geom,
                distance_threshold_km=0.2,
                limit=None,
                qs=PollingPlaces.objects.filter(
                    election=self.election, status=PollingPlaceStatus.DRAFT
                ),
            )

            num_matches = len(matching_polling_places)

            if num_matches == 0:
                # Expand to 1km to give the human something to work with, but don't auto-match.
                nearby = list(
                    find_by_distance(
                        stall_geom,
                        distance_threshold_km=1.0,
                        limit=None,
                        qs=PollingPlaces.objects.filter(
                            election=self.election, status=PollingPlaceStatus.DRAFT
                        ),
                    )
                )
                self._log(
                    "error",
                    "stall_no_match",
                    stall_id=stall.id,
                    location={
                        "name": stall.location_info["name"],
                        "address": stall.location_info["address"],
                        "state": stall.location_info["state"],
                    },
                    nearby=[
                        {
                            "name": pp.name,
                            "premises": pp.premises,
                            "address": pp.address,
                            "distance_m": round(pp.distance.m),
                        }
                        for pp in nearby
                    ],
                    action="Adjust the distance threshold or update the database manually.",
                )

            elif num_matches > 1:
                self._log(
                    "error",
                    "stall_multi_match",
                    stall_id=stall.id,
                    location={
                        "name": stall.location_info["name"],
                        "address": stall.location_info["address"],
                        "state": stall.location_info["state"],
                    },
                    candidates=[
                        {
                            "name": pp.name,
                            "premises": pp.premises,
                            "address": pp.address,
                            "distance_m": round(pp.distance.m),
                        }
                        for pp in matching_polling_places
                    ],
                )
            else:
                official = matching_polling_places[0]
                self._log(
                    "info",
                    "stall_matched",
                    stall_id=stall.id,
                    distance_m=round(official.distance.m),
                    user_submitted={
                        "name": stall.location_info["name"],
                        "address": stall.location_info["address"],
                        "state": stall.location_info["state"],
                    },
                    official={
                        "name": official.name,
                        "premises": official.premises,
                        "address": official.address,
                    },
                    action="Please verify this match is correct.",
                )

                stall.polling_place_id = official.id
                stall.save()
                matched_count += 1

        # Validate that all unofficial pending stalls have been successfully repointed
        unmatched = Stalls.objects.filter(
            election=self.election,
            status=StallStatus.PENDING,
            polling_place__isnull=True,
            location_info__isnull=False,
        ).count()
        if unmatched > 0:
            self._log(
                "error",
                "text",
                message="{} unofficial pending stall(s) still have no polling place after migration — this shouldn't happen.".format(
                    unmatched
                ),
            )

        self._log(
            "summary",
            "text",
            message="Matched and repointed {} of {} unofficial pending stall(s)".format(
                matched_count, count
            ),
        )

    def migrate_noms(self):
        def _getDistanceThreshold(polling_place):
            threshold = 0.1

            # @TOOD Allow by ec_id where those exist, rather than just name
            if self.overwrite_distance_thresholds is not None:
                item = next(
                    (
                        i
                        for i in self.overwrite_distance_thresholds
                        if i["name"] == polling_place.name
                    ),
                    None,
                )
                if item is not None:
                    threshold = item["threshold"]

            return threshold

        def _fetch_matching(polling_place):
            if polling_place.ec_id is not None:
                self._log(
                    "info",
                    "text",
                    message="Matching by EC ID: {}".format(polling_place.name),
                )
                results = PollingPlaces.objects.filter(
                    election=self.election, status=PollingPlaceStatus.DRAFT
                ).filter(ec_id=polling_place.ec_id)
                count = results.count()
                if count >= 2:
                    self._log(
                        "error",
                        "text",
                        message="Multiple polling places share EC ID '{}': {} found. Cannot migrate noms unambiguously.".format(
                            polling_place.ec_id, count
                        ),
                    )
                return results
            else:
                self._log(
                    "info",
                    "text",
                    message="Matching by distance: {}".format(polling_place.name),
                )
                return self.safe_find_by_distance(
                    "migrate_noms",
                    polling_place.geom,
                    distance_threshold_km=_getDistanceThreshold(polling_place),
                    limit=None,
                    qs=PollingPlaces.objects.filter(
                        election=self.election, status=PollingPlaceStatus.DRAFT
                    ),
                )

        # Migrate polling places with attached noms (and their stalls)
        queryset = PollingPlaces.objects.filter(
            election=self.election, status=PollingPlaceStatus.ACTIVE, noms__isnull=False
        )
        polling_places_to_update_active = []
        polling_places_to_update_draft = []

        for polling_place in queryset:
            # start = timer()

            matching_polling_places = _fetch_matching(polling_place)

            if len(matching_polling_places) != 1:
                if len(matching_polling_places) == 0:
                    self._log(
                        "error",
                        "text",
                        message="No match found in new data for '{}' ({})".format(
                            polling_place.name, polling_place.address
                        ),
                    )
                else:
                    self._log(
                        "error",
                        "text",
                        message="{} matches found in new data for '{}' ({})".format(
                            len(matching_polling_places),
                            polling_place.name,
                            polling_place.address,
                        ),
                    )

            else:
                # Repoint polling place noms table
                noms_id = polling_place.noms

                polling_place.noms = None
                polling_places_to_update_active.append(polling_place)

                matching_polling_places[0].noms = noms_id
                polling_places_to_update_draft.append(matching_polling_places[0])

                # Repoint stalls table
                stalls_updated = Stalls.objects.filter(
                    election_id=self.election.id, polling_place=polling_place.id
                ).update(polling_place=matching_polling_places[0].id)
                if stalls_updated > 0:
                    self._log(
                        "info",
                        "text",
                        message="{} stalls updated for '{}' ({})".format(
                            stalls_updated,
                            matching_polling_places[0].name,
                            matching_polling_places[0].address,
                        ),
                    )

                # If this is our first load of polling place info, log some INFO-level
                # messages to compare the user-entered location info with the official
                # location info. This is a poke for us to pick up any discrepancies.
                if self.election.polling_places_loaded is False:
                    self._log(
                        "info",
                        "noms_merge_review",
                        user_submitted={
                            "name": polling_place.name,
                            "address": polling_place.address,
                        },
                        official={
                            "name": matching_polling_places[0].name,
                            "address": matching_polling_places[0].address,
                        },
                        action="Please verify this merge is correct.",
                    )

            # end = timer()
            # self.logger.info("[Timing - Migrate Noms] {} took {}s".format(polling_place.premises, round(end - start, 2)))

        # Update polling place noms en masse
        # Remove noms from the active polling places first to avoid the uniquness constraint on noms_id triggering in certain circumstances.
        # This only came up in the NSW LG 2024 elections - before this there was a single bulk_update() call here.
        # Not sure why it happened, but this is just doing what we wanted to do anyway (wipe each stall and then replace) - it's just doing it in a more obvious manner.
        PollingPlaces.objects.bulk_update(polling_places_to_update_active, ["noms"])
        PollingPlaces.objects.bulk_update(polling_places_to_update_draft, ["noms"])

        self._log(
            "summary",
            "text",
            message="Migrated {} polling places".format(queryset.count()),
        )

        # Migrate any leftover declined or pending stalls
        queryset = (
            Stalls.objects.filter(election=self.election)
            .filter(Q(status=StallStatus.DECLINED) | Q(status=StallStatus.PENDING))
            .filter(polling_place__status=PollingPlaceStatus.ACTIVE)
        )
        for stall in queryset:
            matching_polling_places = self.safe_find_by_distance(
                "migrate_noms",
                stall.polling_place.geom,
                distance_threshold_km=0.1,
                limit=None,
                qs=PollingPlaces.objects.filter(
                    election=self.election, status=PollingPlaceStatus.DRAFT
                ),
            )

            if len(matching_polling_places) != 1:
                if len(matching_polling_places) == 0:
                    self._log(
                        "error",
                        "text",
                        message="No match found in new data for declined/pending stall '{}' ({})".format(
                            stall.polling_place.name, stall.polling_place.address
                        ),
                    )
                else:
                    self._log(
                        "error",
                        "text",
                        message="{} matches found in new data for declined/pending stall '{}' ({})".format(
                            len(matching_polling_places),
                            stall.polling_place.name,
                            stall.polling_place.address,
                        ),
                    )

            else:
                # Repoint stall
                stall.polling_place_id = matching_polling_places[0].id
                stall.save()

                self._log(
                    "info",
                    "text",
                    message="Stall {} repointed to '{}' ({})".format(
                        stall.id,
                        matching_polling_places[0].name,
                        matching_polling_places[0].address,
                    ),
                )

        self._log(
            "summary",
            "text",
            message="Migrated {} declined/pending stalls".format(queryset.count()),
        )

        # Validate that we've actually migrated all stalls and polling places
        queryset = PollingPlaces.objects.filter(
            election=self.election, status=PollingPlaceStatus.ACTIVE, noms__isnull=False
        )
        count = queryset.count()
        if count > 0:
            self._log(
                "error",
                "text",
                message="Found {} old polling places with attached noms. This shouldn't happen.".format(
                    count
                ),
            )
            for polling_place in queryset:
                self._log(
                    "error",
                    "text",
                    message="Still has noms: '{}' ({}) [id={}]".format(
                        polling_place.name, polling_place.address, polling_place.id
                    ),
                )

        queryset = Stalls.objects.filter(
            election=self.election, polling_place__status=PollingPlaceStatus.ACTIVE
        )
        count = queryset.count()
        if count > 0:
            self._log(
                "error",
                "text",
                message="Found {} stalls with old polling places attached. This shouldn't happen.".format(
                    count
                ),
            )
            for stall in queryset:
                self._log(
                    "error",
                    "text",
                    message="Unmigrated stall: stall_id={}, polling_place_id={}".format(
                        stall.id, stall.polling_place.id
                    ),
                )

    def migrate_mpps(self):
        def _getDistanceThreshold(polling_place):
            threshold = 0.1

            # @TOOD Allow by ec_id where those exist, rather than just name
            if self.overwrite_distance_thresholds is not None:
                item = next(
                    (
                        i
                        for i in self.overwrite_distance_thresholds
                        if i["name"] == polling_place.name
                    ),
                    None,
                )
                if item is not None:
                    threshold = item["threshold"]

            return threshold

        def _fetch_matching(polling_place):
            if polling_place.ec_id is not None:
                # self.logger.info(
                #     f"Doing MPP migration by ec_id for {polling_place.name}"
                # )
                results = PollingPlaces.objects.filter(
                    election=self.election, status=PollingPlaceStatus.DRAFT
                ).filter(ec_id=polling_place.ec_id)
                count = results.count()
                if count >= 2:
                    self._log(
                        "error",
                        "text",
                        message="Multiple polling places share EC ID '{}': {} found. Cannot migrate MPP unambiguously.".format(
                            polling_place.ec_id, count
                        ),
                    )
                return results
            else:
                self._log(
                    "info",
                    "text",
                    message="Matching by distance: {}".format(polling_place.name),
                )
                return self.safe_find_by_distance(
                    "migrate_mpps",
                    polling_place.geom,
                    distance_threshold_km=_getDistanceThreshold(polling_place),
                    limit=None,
                    qs=PollingPlaces.objects.filter(
                        election=self.election, status=PollingPlaceStatus.DRAFT
                    ),
                )

        # Migrate active polling places with attached MPPs (this should be all PPs)
        queryset = PollingPlaces.objects.filter(
            election=self.election, status=PollingPlaceStatus.ACTIVE
        )

        polling_places_to_update_active = []
        polling_places_to_update_draft = []

        for polling_place in queryset:
            # start = timer()

            matching_polling_places = _fetch_matching(polling_place)

            if len(matching_polling_places) == 0:
                if polling_place.meta_polling_place is not None:
                    self._log(
                        "warning",
                        "mpp_not_found",
                        name=polling_place.name,
                        address=polling_place.address,
                        mpp_id=polling_place.meta_polling_place.id,
                        detached_mpp=True,
                        action="MPP detached; polling place may have been removed.",
                    )
                    polling_place.meta_polling_place = None
                    polling_places_to_update_active.append(polling_place)
                else:
                    self._log(
                        "warning",
                        "mpp_not_found",
                        name=polling_place.name,
                        address=polling_place.address,
                        mpp_id=None,
                        detached_mpp=False,
                    )

            elif len(matching_polling_places) > 1:
                self._log(
                    "error",
                    "text",
                    message="{} matches found in new data for '{}' ({})".format(
                        len(matching_polling_places),
                        polling_place.name,
                        polling_place.address,
                    ),
                )

            else:
                # Repoint the meta polling place
                if polling_place.meta_polling_place is not None:
                    mpp_id = polling_place.meta_polling_place

                    polling_place.meta_polling_place = None
                    polling_places_to_update_active.append(polling_place)

                    matching_polling_places[0].meta_polling_place = mpp_id
                    polling_places_to_update_draft.append(matching_polling_places[0])
                else:
                    # Or if no MPP exists, insert a new draft singleton MPP
                    mpp = MetaPollingPlaces(
                        name=polling_place.name,
                        premises=polling_place.premises,
                        jurisdiction=(
                            polling_place.state
                            if polling_place.state != PollingPlaceState.Overseas
                            else None
                        ),
                        overseas=polling_place.state == PollingPlaceState.Overseas,
                        geom_location=polling_place.geom,
                        wheelchair_access=polling_place.wheelchair_access,
                    )

                    try:
                        mpp.full_clean()
                    except Exception as e:
                        self._log(
                            "error",
                            "text",
                            message="Error creating MPP: {} (#{}) — {}".format(
                                polling_place.name, polling_place.id, str(e)
                            ),
                        )

                    mpp.save(force_insert=True)

                    # Link the new MPP to the polling place
                    polling_place.meta_polling_place = mpp
                    polling_places_to_update_draft.append(matching_polling_places[0])

                    # Create the MPP task
                    mpp_task = MetaPollingPlacesTasks(
                        meta_polling_place=mpp,
                        job_name=f"Polling Place Load {self.job.id}",
                        category=MetaPollingPlaceTaskCategory.REVIEW,
                        type=MetaPollingPlaceTaskType.REVIEW_DRAFT,
                    )

                    try:
                        mpp_task.full_clean()
                    except Exception as e:
                        self._log(
                            "error",
                            "text",
                            message="Error creating MPP task: {} (#{}) — {}".format(
                                polling_place.name, polling_place.id, str(e)
                            ),
                        )

                    mpp_task.save(force_insert=True)

            # end = timer()
            # self.logger.info("[Timing - Migrate Noms] {} took {}s".format(polling_place.premises, round(end - start, 2)))

        # Update polling place noms en masse
        # Remove noms from the active polling places first to avoid the uniquness constraint on noms_id triggering in certain circumstances.
        # This only came up in the NSW LG 2024 elections - before this there was a single bulk_update() call here.
        # Not sure why it happened, but this is just doing what we wanted to do anyway (wipe each stall and then replace) - it's just doing it in a more obvious manner.
        PollingPlaces.objects.bulk_update(
            polling_places_to_update_active, ["meta_polling_place"]
        )
        PollingPlaces.objects.bulk_update(
            polling_places_to_update_draft, ["meta_polling_place"]
        )

        self._log(
            "summary",
            "text",
            message="Migrated {} active polling places".format(queryset.count()),
        )

        # Handle draft polling places without an attached MPP
        queryset = PollingPlaces.objects.filter(
            election=self.election, status=PollingPlaceStatus.DRAFT
        ).filter(meta_polling_place__isnull=True)

        polling_places_to_update_draft = []

        for polling_place in queryset:
            # start = timer()

            # Insert a new draft singleton MPP
            mpp = MetaPollingPlaces(
                name=polling_place.name,
                premises=polling_place.premises,
                jurisdiction=(
                    polling_place.state
                    if polling_place.state != PollingPlaceState.Overseas
                    else None
                ),
                overseas=polling_place.state == PollingPlaceState.Overseas,
                geom_location=polling_place.geom,
                wheelchair_access=polling_place.wheelchair_access,
            )

            try:
                mpp.full_clean()
            except Exception as e:
                self._log(
                    "error",
                    "text",
                    message="Error creating MPP: {} (#{}) — {}".format(
                        polling_place.name, polling_place.id, str(e)
                    ),
                )

            mpp.save(force_insert=True)

            # Link the new MPP to the polling place
            polling_place.meta_polling_place = mpp
            polling_places_to_update_draft.append(polling_place)

            # Create the MPP task
            mpp_task = MetaPollingPlacesTasks(
                meta_polling_place=mpp,
                job_name=f"Polling Place Load {self.job.id}",
                category=MetaPollingPlaceTaskCategory.REVIEW,
                type=MetaPollingPlaceTaskType.REVIEW_DRAFT,
            )

            try:
                mpp_task.full_clean()
            except Exception as e:
                self._log(
                    "error",
                    "text",
                    message="Error creating MPP task: {} (#{}) — {}".format(
                        polling_place.name, polling_place.id, str(e)
                    ),
                )

            mpp_task.save(force_insert=True)

            # end = timer()
            # self.logger.info("[Timing - Migrate Noms] {} took {}s".format(polling_place.premises, round(end - start, 2)))

        # Update polling place noms en masse
        # Remove noms from the active polling places first to avoid the uniquness constraint on noms_id triggering in certain circumstances.
        # This only came up in the NSW LG 2024 elections - before this there was a single bulk_update() call here.
        # Not sure why it happened, but this is just doing what we wanted to do anyway (wipe each stall and then replace) - it's just doing it in a more obvious manner.
        PollingPlaces.objects.bulk_update(
            polling_places_to_update_draft, ["meta_polling_place"]
        )

        self._log(
            "summary",
            "text",
            message="Handled {} draft polling places".format(queryset.count()),
        )

        count = (
            PollingPlaces.objects.filter(
                election=self.election, status=PollingPlaceStatus.ACTIVE
            )
            .filter(meta_polling_place__isnull=False)
            .count()
        )
        if count != 0:
            self._log(
                "error",
                "text",
                message="{} active polling places have an MPP still attached".format(
                    count
                ),
            )

        count = (
            PollingPlaces.objects.filter(
                election=self.election, status=PollingPlaceStatus.DRAFT
            )
            .filter(meta_polling_place__isnull=True)
            .count()
        )
        if count != 0:
            self._log(
                "error",
                "text",
                message="{} draft polling places have no MPP".format(count),
            )

    def migrate(self):
        # Migrate to new polling places
        old_archived_polling_places_queryset = PollingPlaces.objects.filter(
            election=self.election, status=PollingPlaceStatus.ARCHIVED
        )
        old_polling_places_queryset = PollingPlaces.objects.filter(
            election=self.election, status=PollingPlaceStatus.ACTIVE
        )
        new_polling_places_queryset = PollingPlaces.objects.filter(
            election=self.election, status=PollingPlaceStatus.DRAFT
        )

        new_count = new_polling_places_queryset.count()
        old_count = old_polling_places_queryset.count()

        self._log(
            "summary",
            "migrate_stats",
            total_polling_places=new_count,
            delta_total=new_count - old_count,
            new_polling_places=max(0, new_count - old_count),
            deleted_polling_places=max(0, old_count - new_count),
            previous_set=old_count,
            previous_archived=old_archived_polling_places_queryset.count(),
        )

        old_archived_polling_places_queryset.delete()
        old_polling_places_queryset.update(status=PollingPlaceStatus.ARCHIVED)
        new_polling_places_queryset.update(status=PollingPlaceStatus.ACTIVE)

        # Update GeoJSON et cetera
        task_regenerate_cached_election_data.delay(election_id=self.election.id)

        # Update election if necessary
        if self.election.polling_places_loaded is False:
            self.election.polling_places_loaded = True
            self.election.save()

    def detect_facility_type(self):
        update_count = 0

        queryset = PollingPlaces.objects.filter(
            election=self.election,
            status=PollingPlaceStatus.ACTIVE,
            facility_type__isnull=True,
        )
        facility_type_queryset = PollingPlaces.objects.filter(
            status=PollingPlaceStatus.ACTIVE, facility_type__isnull=False
        ).exclude(election=self.election)

        for polling_place in queryset:
            most_recent_facility_type = (
                find_by_distance(
                    polling_place.geom, 0.2, limit=None, qs=facility_type_queryset
                )
                .order_by("election_id")
                .last()
            )

            if most_recent_facility_type is not None:
                polling_place.facility_type_id = (
                    most_recent_facility_type.facility_type_id
                )
                polling_place.save()

                update_count += 1

        self._log(
            "summary",
            "text",
            message="Facility types detected from historical data: {}".format(
                update_count
            ),
        )

    def calculate_chance_of_sausage(self):
        update_count = 0
        polling_places = PollingPlaces.objects.filter(
            election=self.election, status=PollingPlaceStatus.ACTIVE, noms__isnull=True
        )

        chance_of_sausage_calculations = calculate_chance_of_sausage_stats(
            self.election, polling_places
        )

        for polling_place in polling_places:
            if polling_place.id not in chance_of_sausage_calculations:
                self._log(
                    "error",
                    "text",
                    message="Could not find the expected Chance of Sausage calculation result for {}".format(
                        polling_place.id
                    ),
                )
            else:
                if chance_of_sausage_calculations[polling_place.id] is not None:
                    polling_place.chance_of_sausage = chance_of_sausage_calculations[
                        polling_place.id
                    ]["chance_of_sausage"]
                    polling_place.chance_of_sausage_stats = (
                        chance_of_sausage_calculations[polling_place.id]
                    )
                    polling_place.save()

                    update_count += 1

        self._log(
            "summary",
            "text",
            message="Chance of sausage: considered {}, updated {}".format(
                polling_places.count(), update_count
            ),
        )

    def cleanup(self):
        # Update GeoJSON et cetera
        task_regenerate_cached_election_data.delay(election_id=self.election.id)

    def run(self):
        self.is_reload = PollingPlaces.objects.filter(
            election=self.election, status=PollingPlaceStatus.ACTIVE
        ).exists()

        if self.can_loading_begin() is False:
            self._log(
                "error",
                "text",
                message="Loading can't begin. There's probably pending stalls.",
            )
        else:
            self.invoke_and_bail_if_errors("convert_to_demsausage_schema")
            self.invoke_and_bail_if_errors("check_file_validity")
            self.invoke_and_bail_if_errors("fix_polling_places")
            self.invoke_and_bail_if_errors("prepare_polling_places")
            self.invoke_and_bail_if_errors("geocode_missing_locations")
            # When geocoding is not configured or disabled, mark the stage as
            # "skipped" for the UI accordion (the method still runs to filter
            # out blank-coordinate polling places).
            if self.geocoding is None or not self.geocoding.get("enabled", False):
                if (
                    self.stages
                    and self.stages[-1]["name"] == "geocode_missing_locations"
                ):
                    self.stages[-1]["outcome"] = "skipped"
            self.invoke_and_bail_if_errors("check_polling_place_validity")
            self.invoke_and_bail_if_errors("dedupe_polling_places")

            with transaction.atomic():
                self.invoke_and_bail_if_errors("write_draft_polling_places")
                self.invoke_and_bail_if_errors("migrate_unofficial_pending_stalls")
                self.invoke_and_bail_if_errors("migrate_noms")
                self.invoke_and_bail_if_errors("migrate_mpps")
                self.invoke_and_bail_if_errors("migrate")

                if self.is_dry_run() is True:
                    # Regenerate GeoJSON et cetera because the loader does this and transactions don't help us here :)
                    task_regenerate_cached_election_data.delay(
                        election_id=self.election.id
                    )
                    raise BadRequest(
                        {
                            "message": "Rollback",
                            "is_dry_run": True,
                            "payload": self.collect_structured_logs(),
                        }
                    )

            if self.is_dry_run() is False:
                # Use a transaction to speed up all of the update calls in here
                with transaction.atomic():
                    self.invoke_and_bail_if_errors("detect_facility_type")
                    self.invoke_and_bail_if_errors("calculate_chance_of_sausage")
                    self.invoke_and_bail_if_errors("cleanup")

            print("All done with loading")
        self.save_logs(self.collect_structured_logs())


class RollbackPollingPlaces(PollingPlacesIngestBase):
    """
    IMPORTANT: This class assumes it is run inside an @transaction.atomic block.
    """

    def __init__(self, election, dry_run):
        self._init_log_transport()
        self.election = election
        self.dry_run = dry_run

    def has_draft_polling_places(self):
        return (
            PollingPlaces.objects.filter(
                election=self.election, status=PollingPlaceStatus.DRAFT
            ).count()
            > 0
        )

    def all_polling_places_are_unofficial(self):
        return (
            Stalls.objects.filter(
                election_id=self.election.id, location_info__isnull=True
            ).count()
            > 0
        )

    def can_loading_begin(self):
        if self.has_pending_stalls() is True:
            return False
        if self.has_draft_polling_places() is True:
            return False
        return True

    def rollback_noms(self):
        queryset = PollingPlaces.objects.filter(
            election=self.election, status=PollingPlaceStatus.ACTIVE, noms__isnull=False
        )
        for polling_place in queryset:
            matching_polling_places = self.safe_find_by_distance(
                "Noms Rollback",
                polling_place.geom,
                0.2,
                limit=None,
                qs=PollingPlaces.objects.filter(
                    election=self.election, status=PollingPlaceStatus.ARCHIVED
                ),
            )

            if len(matching_polling_places) != 1:
                if len(matching_polling_places) == 0:
                    self._log(
                        "error",
                        "text",
                        message="No match found in archived data for '{}' ({})".format(
                            polling_place.name, polling_place.address
                        ),
                    )
                else:
                    self._log(
                        "error",
                        "text",
                        message="{} matches found in archived data for '{}' ({})".format(
                            len(matching_polling_places),
                            polling_place.name,
                            polling_place.address,
                        ),
                    )

            else:
                # Repoint polling place noms table
                noms_id = polling_place.noms

                polling_place.noms = None
                polling_place.save()

                matching_polling_places[0].noms = noms_id
                matching_polling_places[0].save()

                # Repoint stalls table
                stalls_updated = Stalls.objects.filter(
                    election_id=self.election.id, polling_place=polling_place.id
                ).update(polling_place=matching_polling_places[0].id)
                if stalls_updated > 0:
                    self._log(
                        "info",
                        "text",
                        message="{} stalls updated for '{}' ({})".format(
                            stalls_updated,
                            matching_polling_places[0].name,
                            matching_polling_places[0].address,
                        ),
                    )

        self._log(
            "summary",
            "text",
            message="Rolled back {} polling places and stalls".format(queryset.count()),
        )

        queryset = PollingPlaces.objects.filter(
            election=self.election, status=PollingPlaceStatus.ACTIVE, noms__isnull=False
        )
        count = queryset.count()
        if count > 0:
            self._log(
                "error",
                "text",
                message="Found {} old polling places with attached noms. This shouldn't happen.".format(
                    count
                ),
            )
            for polling_place in queryset:
                self._log(
                    "error",
                    "text",
                    message="Still has noms: '{}' ({}) [id={}]".format(
                        polling_place.name, polling_place.address, polling_place.id
                    ),
                )

        queryset = Stalls.objects.filter(
            election=self.election, polling_place__status=PollingPlaceStatus.ACTIVE
        )
        count = queryset.count()
        if count > 0:
            self._log(
                "error",
                "text",
                message="Found {} stalls with old polling places attached. This shouldn't happen.".format(
                    count
                ),
            )
            for stall in queryset:
                self._log(
                    "error",
                    "text",
                    message="Unmigrated stall: stall_id={}, polling_place_id={}".format(
                        stall.id, stall.polling_place.id
                    ),
                )

    def cleanup(self):
        # Rollback to archived polling places
        active_polling_places_queryset = PollingPlaces.objects.filter(
            election=self.election, status=PollingPlaceStatus.ACTIVE
        )
        archived_polling_places_queryset = PollingPlaces.objects.filter(
            election=self.election, status=PollingPlaceStatus.ARCHIVED
        )

        self._log(
            "summary",
            "text",
            message="Rolled back to {} archived polling places (previous active set={})".format(
                archived_polling_places_queryset.count(),
                active_polling_places_queryset.count(),
            ),
        )

        active_polling_places_queryset.delete()
        archived_polling_places_queryset.update(status=PollingPlaceStatus.ACTIVE)

        # Update GeoJSON et cetera
        task_regenerate_cached_election_data.delay(election_id=self.election.id)

        # Update election if necessary
        if self.all_polling_places_are_unofficial() is True:
            self.election.polling_places_loaded = False
            self.election.polling_places_loaded.save()

    def run(self):
        if self.can_loading_begin() is False:
            self._log(
                "error",
                "text",
                message="Rollback can't begin. There's probably pending stalls or draft polling places left over.",
            )
        else:
            self.invoke_and_bail_if_errors("rollback_noms")
            self.invoke_and_bail_if_errors("cleanup")
            print("All done with rollback")
