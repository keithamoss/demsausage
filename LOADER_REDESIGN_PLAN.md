# Polling Place Loader Report Redesign Plan

## Context

The polling place loader (`django/demsausage/app/sausage/loader.py`) is a multi-stage Python process that ingests a CSV of polling places for an election. It is invoked as a background RQ job and polled from the frontend every 3 seconds via `useGetPollingPlaceLoaderJobInfoQuery`.

The frontend report UI lives in `admin-redesign/src/features/elections/ElectionLoadPollingPlaces.tsx`.

The current logging mechanism writes formatted strings to a `StringIO` buffer using Python's `logging` module, tagged with `[ERROR]`, `[WARNING]`, and `[INFO]` prefixes, which are then parsed back out by prefix into three flat arrays. This produces an undifferentiated wall of text that is hard to read and impossible to render richly.

---

## Goals

- Replace the flat string log output with fully structured, typed log entries
- Group log entries by stage with timing metadata
- Make the UI stage-aware, outcome-prominent, and type-driven in its rendering
- Store the structured payload in the DB and on disk

---

## Decisions Made

| Decision | Choice |
|---|---|
| Backend changes allowed? | Yes — full backend changes are fine |
| Log transport | Replace `StringIO` + Python `logging` with a plain `self.log_entries: list[dict]` on `self` |
| Message structure | Everything uniformly structured: `{type, level, ...}` |
| Stage grouping | Logs grouped by stage; each stage carries its own errors/warnings/summaries/detail |
| Timing per stage | `started_at`, `finished_at` (ISO 8601, UTC), `duration_seconds` stored on each stage object. `[Timing]` info messages dropped entirely |
| Stage names/labels | Human-readable labels defined in a `STAGE_LABELS` dict in the backend (Python), included in each stage object |
| Summary vs detail split | New `summary` log level (distinct from `info`) for end-of-stage count/stat messages |
| Chatty per-item migration lines | Kept, emitted as `level: "info"` (detail) entries |
| Large error lists | Show first 20 errors, then "Show N more" toggle |
| Dry run UI | Distinct info banner: "Dry run complete — no changes were saved" |
| Overall outcome placement | Prominent banner at top of results area |
| Rollback | Out of scope — no changes to `RollbackPollingPlaces` |
| Complex messages | Fully structured objects with typed `type` field; related events grouped into parent objects with sub-lists rather than emitted as separate flat lines |
| Action guidance | Separate `action: str` field on any entry that requires operator attention, rendered as an amber callout |
| Geocode raw result | Kept as a sub-field on the structured geocode skip object |
| DB serializer | Updated to store the new structure; old shape dropped |
| Old DB payload records | Non-issue — the admin UI has no route to historical `PollingPlaceLoaderEvents` records; old shape never served to the UI |
| Config validation stage | Synthetic `_config` stage wraps `check_config_is_valid` errors so they appear in the stage list rather than as orphaned top-level entries |
| `geocode_skip` not-enabled | Folded into the combined geocoding summary (`"X geocoded, Y skipped — geocoding not enabled"`) — not emitted per polling place |
| `spatial_proximity` stage label field | Named `stage_name` (machine-readable method name, e.g. `"migrate_noms"`) so it's unambiguous regardless of context |
| `mpp_not_found` with detached MPP | Carries `action` field when `detached_mpp: true`; detaching an MPP is a data-significant change that needs operator verification |
| `dedup_merge` / `dedup_discard` levels | Emitted as **both** `summary` AND `info` — operator sees them prominently in Summaries; full list also available in Detail |
| Stage `outcome` field | Explicit `outcome: "ok" \| "warning" \| "error" \| "skipped"` on every stage object, set by `invoke_and_bail_if_errors` after the method returns |
| Top-level polling place stats | `total_polling_places`, `delta_total`, `new_polling_places`, `deleted_polling_places` added to root payload (populated from the `migrate` stage summary) |
| `total_actions_required` | Count of log entries with a non-null `action` field across all stages; shown in the outcome banner alongside errors/warnings |
| Attribution | `run_at` (ISO 8601 UTC, first stage `started_at`) and `run_by` (user identifier from job context, or `null` if unavailable) in root payload |
| Detail section UX | Detail subsection inside each stage body is collapsed behind its own toggle by default, separate from the Summaries/Warnings/Errors sections |
| Live stage label lookup | Live polling applies `STAGE_LABELS` lookup so human-readable labels tick off during the run, not raw method names |
| Partial aborted-load report | Operator sees the partial structured report for loads that fail mid-stage; a banner note clarifies that existing live data is unchanged |
| `is_reload` flag | `is_reload: bool` in root payload; `true` if polling places already existed for this election at load time; used by frontend to contextualise migration warnings and suppress delta stats on first loads |
| Geocoding skipped stage | When geocoding is disabled in config, a synthetic `geocode_missing_locations` stage with `outcome: "skipped"` is appended so the operator always sees this stage in the accordion rather than it being absent |
| `total_entry_count` per stage | `total_entry_count: number` on each stage object; frontend truncates long detail lists client-side; this field provides the full count for "Show N more" labels without requiring the frontend to sum array lengths |
| Bad-config fixture test | A dedicated Phase 1 test with a deliberately invalid `config.json` covers the synthetic `_config` stage |
| `conftest.py` RQ mock | `job.meta` uses a real `dict` so `.update()` and key access work natively; `job.save_meta` is a `MagicMock` noop; both call sites in `__init__` and `invoke_and_bail_if_errors` are covered by one `autouse` patch |

---

## New Log Transport

### Replace `make_logger` / `StringIO`

Remove `make_logger()` and the `StringIO` log buffer entirely. Initialise on `PollingPlacesIngestBase`:

```python
self.log_entries: list[dict] = []
self.stages: list[dict] = []
```

Two core helpers:

```python
def _log(self, level: str, type: str, **kwargs):
    self.log_entries.append({"level": level, "type": type, **kwargs})

def _has_errors(self):
    return any(e["level"] == "error" for e in self.log_entries)
```

Rewrite `has_errors_messages()` and `raise_exception_if_errors()` in terms of `_has_errors()`.

---

## Updated `invoke_and_bail_if_errors`

```python
from datetime import datetime, timezone

STAGE_LABELS = {
    "convert_to_demsausage_schema": "Convert to Schema",
    "check_file_validity": "Check File Validity",
    "fix_polling_places": "Fix Polling Places",
    "prepare_polling_places": "Prepare Polling Places",
    "geocode_missing_locations": "Geocode Missing Locations",
    "check_polling_place_validity": "Validate Polling Places",
    "dedupe_polling_places": "Deduplicate Polling Places",
    "write_draft_polling_places": "Write Draft Polling Places",
    "migrate_unofficial_pending_stalls": "Migrate Unofficial Pending Stalls",
    "migrate_noms": "Migrate Noms",
    "migrate_mpps": "Migrate MPPs",
    "migrate": "Migrate",
    "detect_facility_type": "Detect Facility Types",
    "calculate_chance_of_sausage": "Calculate Chance of Sausage",
    "cleanup": "Cleanup",
}

def invoke_and_bail_if_errors(self, method_name):
    print("Calling {}".format(method_name))

    self.job.meta["_polling_place_loading_stages_log"].append(method_name)
    self.job.save_meta()

    started_at = datetime.now(timezone.utc)
    before = len(self.log_entries)
    getattr(self, method_name)()
    finished_at = datetime.now(timezone.utc)

    stage_entries = self.log_entries[before:]
    has_errors   = any(e["level"] == "error"   for e in stage_entries)
    has_warnings = any(e["level"] == "warning" for e in stage_entries)
    self.stages.append({
        "name": method_name,
        "label": STAGE_LABELS.get(method_name, method_name),
        "started_at": started_at.isoformat(),
        "finished_at": finished_at.isoformat(),
        "duration_seconds": round((finished_at - started_at).total_seconds(), 2),
        "outcome": "error" if has_errors else ("warning" if has_warnings else "ok"),
        "total_entry_count": len(stage_entries),
        "errors":   [e for e in stage_entries if e["level"] == "error"],
        "warnings": [e for e in stage_entries if e["level"] == "warning"],
        "summaries":[e for e in stage_entries if e["level"] == "summary"],
        "detail":   [e for e in stage_entries if e["level"] == "info"],
    })

    self.raise_exception_if_errors()
```

The `"skipped"` outcome is used for stages the loader explicitly decides not to run. For `geocode_missing_locations`, when geocoding is disabled in config, `invoke_and_bail_if_errors` is not called at all; instead a synthetic stage record is appended manually:

```python
if not self.config.get("geocoding", {}).get("enabled", False):
    now = datetime.now(timezone.utc).isoformat()
    self.stages.append({
        "name": "geocode_missing_locations",
        "label": STAGE_LABELS["geocode_missing_locations"],
        "outcome": "skipped",
        "started_at": now,
        "finished_at": now,
        "duration_seconds": 0,
        "total_entry_count": 0,
        "errors": [], "warnings": [], "summaries": [], "detail": [],
    })
    return
# otherwise: call geocode_missing_locations() then invoke_and_bail_if_errors()
```

This means the operator always sees "Geocoding — skipped (not enabled)" in the accordion rather than the stage being absent. The same pattern is available for any future stage that may be conditionally skipped.
```

Note: `job.meta["_polling_place_loading_stages_log"]` continues to be updated live after each stage for the existing polling mechanism. This is unchanged — the frontend uses it to tick off stage names during the run. Full structured data only arrives on job completion.

---

## New Payload Shape (`collect_structured_logs`)

Replaces `collects_logs()`. Returns:

```json
{
  "run_at": "2026-03-07T14:20:00.000000+00:00",
  "run_by": "admin@example.com",
  "is_dry_run": false,
  "is_reload": true,
  "total_errors": 3,
  "total_warnings": 1,
  "total_actions_required": 2,
  "total_polling_places": 1423,
  "delta_total": 5,
  "new_polling_places": 8,
  "deleted_polling_places": 3,
  "stages": [
    {
      "name": "migrate_noms",
      "label": "Migrate Noms",
      "outcome": "warning",
      "started_at": "2026-03-07T14:23:01.452819+00:00",
      "finished_at": "2026-03-07T14:23:05.891234+00:00",
      "duration_seconds": 4.44,
      "total_entry_count": 47,
      "errors": [ ... ],
      "warnings": [ ... ],
      "summaries": [ ... ],
      "detail": [ ... ]
    }
  ]
}
```

**Field notes:**
- `run_at` — ISO 8601 UTC timestamp of when the job started (`started_at` of the first stage, or job creation time)
- `run_by` — user identifier from the job context (e.g. email address of the admin who triggered the load); `null` if unavailable
- `is_reload` — `true` if `PollingPlaces` rows already existed for this election at load time (i.e. a subsequent load, not the first). Populated at the very start of `run()` before any DB writes. The frontend uses this to contextualise migration stage outputs in the outcome banner: an `mpp_not_found` entry on a first load warrants more alarm than one during a reload.
- `total_actions_required` — count of log entries across all stages where `action` is non-null; used by the outcome banner
- `total_polling_places` — count of ACTIVE polling places after the load completes (from the `migrate` stage summary); `null` for dry runs
- `delta_total` — net change vs. the previous set (`new_polling_places - deleted_polling_places`); positive = net gain, negative = net loss
- `new_polling_places` — polling places that exist in the new set but not the previous
- `deleted_polling_places` — polling places that were in the previous set but not the new one
- `outcome` on each stage — `"ok"` \| `"warning"` \| `"error"` \| `"skipped"`; set by `invoke_and_bail_if_errors`
- `total_entry_count` on each stage — total count of all log entries (errors + warnings + summaries + detail) before any frontend-side truncation. The frontend truncates long detail lists client-side (e.g. first 20 rows shown, "Show N more" toggle); this field provides the full count without requiring the frontend to sum array lengths.

`is_dry_run: true` is set in the intentional rollback `BadRequest` raised at the end of a dry run, so the frontend can distinguish it from a real failure. Polling place stats fields are `null` for dry runs.

Also writes to disk JSON (`/app/logs/pollingplaceloader-{timestamp}.json`) and DB via `PollingPlaceLoaderEventsSerializer` (serializer updated to store new structure; old shape dropped). Historical records in `PollingPlaceLoaderEvents` use the old shape but this is not a concern — the admin UI has no route to those records.

---

## Log Message Audit

Every active `self.logger.*` call analysed below, grouped by stage. Each entry shows: the current message → the problem(s) → the recommended change.

### Recurring structural problems (apply everywhere)

#### Problem A — Stage prefix strings are redundant
Dozens of messages embed the stage name as a prefix: `"Noms Migration: ..."`, `"MPP Migration: ..."`, `"Deduping: ..."`, `"Unofficial Pending Stall Migration: ..."`, `"Declined/Pending Stall Migration: ..."`, `"[EC_ID Checker] ..."`, `"[Geocoding Skipping - ...] ..."`, `"[Find Home Division] ..."`, `"Address merging: ..."`.

With stage-grouped output, the stage is already visible from the accordion header. All these prefixes should be **stripped from every message**. The message text should be written as if the reader already knows which stage they're in.

#### Problem B — Zero/multiple matches conflated in one message
`migrate_noms`, `migrate_mpps`, and the declined/pending stall sub-step all use the same message for both zero matches and multiple matches:

```
"N matching polling places found in new data: 'Name' (address)"
```

When `N=0` this reads awkwardly. These should be two separate messages: one for no-match, one for multi-match.

#### Problem C — Level confusion on "needs review" messages
`"Noms Migration: User-added polling place ... has been merged successfully ... Is this correct?"` is logged as `warning` even though the underlying operation succeeded. The warning level is being used as a proxy for "needs human review". The correct approach is `info` level with an explicit `action` field: `"Please manually verify this merge is correct."`.

---

### `check_config_is_valid` (runs inside `__init__`)

**Structural issue:** `check_config_is_valid` is called from `__init__`, before `invoke_and_bail_if_errors` is ever called. Config errors are appended to `self.log_entries` but never captured inside any stage's `errors` array — they are orphaned.

**Fix:** After `__init__` completes, wrap any log entries that fired during config validation into a synthetic `_config` stage. The simplest approach: record `len(self.log_entries)` before calling `check_config_is_valid`, then immediately after `__init__`, create a synthetic stage entry:

```python
# At the end of __init__, before returning:
config_entries = self.log_entries  # everything so far is config validation
self.stages.append({
    "name": "_config",
    "label": "Config Validation",
    "started_at": self._init_started_at.isoformat(),
    "finished_at": datetime.now(timezone.utc).isoformat(),
    "duration_seconds": 0.0,
    "outcome": "error" if any(e["level"] == "error" for e in config_entries) else "ok",
    "total_entry_count": len(config_entries),
    "errors":    [e for e in config_entries if e["level"] == "error"],
    "warnings":  [e for e in config_entries if e["level"] == "warning"],
    "summaries": [e for e in config_entries if e["level"] == "summary"],
    "detail":    [e for e in config_entries if e["level"] == "info"],
})
```

Add `"_config": "Config Validation"` to `STAGE_LABELS`. Config errors are relatively rare and small in number, so this stage will usually be empty and the accordion header collapses it cleanly.

| Current message | Level | Issue | Recommendation |
|---|---|---|---|
| `"Config: Invalid field '{}' in config"` | error | Fine. | No change needed. |
| `"Config: address_format required if address_fields provided"` | error | Fine. | No change needed. |
| `"Config: address_fields required if address_format provided"` | error | Fine. | No change needed. |

---

### `convert_to_demsausage_schema`

| Current message | Level | Issue | Recommendation |
|---|---|---|---|
| `"Filtered out {} polling places of {}. New total: {}."` | info | "New total" is derivable from the other two numbers — it's redundant noise. | Simplify: `"{} of {} polling places filtered out"` |
| `"Removed {} columns"` | info | Fine. | Promote to `summary` level. |
| `"Renamed {} columns"` | info | Fine. | Promote to `summary` level. |
| `"Added {} new columns"` | info | Fine. | Promote to `summary` level. |
| `"Created extras field from {} columns"` | info | "extras field" is internal jargon. | Simplify: `"Packed {} column(s) into the extras field"`. Promote to `summary`. |
| `"No regex match for {} for {}"` | error | **Format bug**: 3 args passed but only 2 `{}` placeholders — the `match` value is silently dropped. Also arg order is confusing: field value before regex pattern. | Fix format bug. Rewrite: `"Cleaning regex '{}' did not match field value '{}'"` (pattern first, value second). |
| `"Ran {} cleaning regexes"` | info | Fine. | Promote to `summary` level. |

---

### `check_file_validity`

| Current message | Level | Issue | Recommendation |
|---|---|---|---|
| `"Unknown field in header: {}"` | error | Fires once per unknown field — can generate many errors for one bad header. | Batch all unknowns into a single error: `"Unknown fields in header: {}"` with a list. |
| `"Required field missing in header: {}"` | error | Same batching problem. | Batch: `"Required fields missing from header: {}"` with a list. |
| `"Required address field missing in header: {}"` | error | Same batching problem. | Batch: `"Required address fields missing from header: {}"` with a list. |
| `"Required division field missing in header: {}"` | error | Same batching problem. | Batch: `"Required division fields missing from header: {}"` with a list. |
| `"[EC_ID Checker] Polling place {} ({}) has a non-unique ec_id of {}"` | error | `[EC_ID Checker]` prefix is redundant (Problem A). The phrase "non-unique" is developer jargon. | Strip prefix. Rewrite: `"Duplicate EC ID: '{}' ({}) shares EC ID '{}' with another polling place"` → `ec_id_duplicate` type. |
| `"[EC_ID Checker] {} polling places have blank ec_ids"` | warning | `[EC_ID Checker]` prefix redundant (Problem A). | Strip prefix. `"{} polling places have blank EC IDs"`. Promote to `summary` level. |

---

### `prepare_polling_places`

| Current message | Level | Issue | Recommendation |
|---|---|---|---|
| `"Address merging: No address or address fields found for polling place '{}'"` | error | "Address merging:" prefix redundant (Problem A). | Strip prefix: `"No address or address fields found for '{}'"` |

---

### `geocode_missing_locations`

| Current message | Level | Issue | Recommendation |
|---|---|---|---|
| `"[Geocoding Skipping - No good results found] {} ({})"` | warning | Bracket tag is ugly (Problem A). | Becomes `geocode_skip` with `reason: "no_results"`. |
| `"[Geocoding Skipping - Not accurate enough] {} ({}) {}"` | warning | Bracket tag ugly (Problem A). Raw geocode API result object appended inline — unreadable. | Becomes `geocode_skip` with `reason: "not_accurate_enough"`, raw result as `geocode_result` sub-field. |
| `"[Geocoding Skipping - Not enabled] {} ({})"` | warning | Fired per polling place when geocoding is disabled — could be thousands of entries. "Not enabled" is a configuration choice, not a problem. | **Fold into the combined geocoding summary only**: `"Geocoding complete: {} geocoded, {} skipped — geocoding not enabled"`. Do not emit a per-row `geocode_skip` entry for this case. |
| `"Geocoded {} polling places successfully"` | info | Fine. | Promote to `summary`. |
| `"Geocoding skipped {} polling places"` | info | Slightly redundant alongside the above — together they tell the full story. | Merge both into one `summary`: `"Geocoding complete: {} geocoded, {} skipped"`; append `"— geocoding not enabled"` when the skip reason is config rather than data quality. |

---

### `fix_polling_places`

| Current message | Level | Issue | Recommendation |
|---|---|---|---|
| `"Ran {} field fixers"` | info | Fine. | Promote to `summary`. |

---

### `check_polling_place_validity`

| Current message | Level | Issue | Recommendation |
|---|---|---|---|
| `"Polling place {} ({}) invalid: {}"` | error | Django serializer errors dict appended as raw Python repr — completely unreadable. | Becomes `validation_error` structured type. |
| `"Polling place {} ({}) falls outside the election's boundary"` | error | Fine. | No change (message text). Keep as `text` type. |
| `"Polling place {} ({}) falls outside the election's boundary"` | warning | Same text as the error variant — the only distinction is whether the polling place is in `bbox_validation["ignore"]`. | Add a `reason` or `ignored: true` field to distinguish. Or add `" (ignored)"` suffix on the warning variant. |

---

### `write_draft_polling_places`

| Current message | Level | Issue | Recommendation |
|---|---|---|---|
| `"Polling place invalid: {}"` | error | Raw serializer errors dict. No name or premises attached — makes it impossible to identify which polling place failed. | Add `polling_place["name"]` and `polling_place["premises"]` to the structured `validation_error` entry — same type as `check_polling_place_validity`. |

---

### `dedupe_polling_places`

| Current message | Level | Issue | Recommendation |
|---|---|---|---|
| `"[Find Home Division] Found more than one matching division for {}: {}"` | error | Bracket prefix redundant (Problem A). Python list of division names as repr. | Becomes `find_home_division_error` with `reason: "multiple_matches"`, `candidates` list field. |
| `"[Find Home Division] Found no matching division for {}"` | error | Bracket prefix redundant (Problem A). | Becomes `find_home_division_error` with `reason: "no_match"`. |
| `"[Find Home Division] Could not find electoral boundary division '{}' in polling places divisions list: {}"` | error | Bracket prefix redundant. Comma-joined string of division names. | Becomes `find_home_division_error` with `reason: "not_in_list"`, `eb_division: str`, `candidates` list. |
| `"[Find Home Division] Got 'None' for home division lookup for {}"` | error | **Redundant** — always fired immediately after one of the three `_find_home_division` errors above has already been logged. The `None` return is the direct consequence of those errors, not a new piece of information. | **Drop entirely.** |
| `"Deduping: Found multiple unique polling places sharing the same location: {}"` | error | `"Deduping:"` prefix redundant. Comma-joined names string. | Strip prefix. Becomes `spatial_proximity`-style structured entry with a list of `{name, premises}` objects. |
| `"Deduping: Merged divisions for {} polling places with the same location ({}). Divisions: {}. Polling Places: {}"` | info | Very long; epoch-style `lon,lat` key as location; Python list repr for divisions; semicolon-joined string for polling places. | Becomes `dedup_merge` structured type. **Emitted as both `summary` AND `info`** — operator sees it prominently in Summaries for human sense-checking; full list of polling places also available in Detail. |
| `"Deduping: Discarded {} duplicate polling places with the same location ({}). No divisions were present. Polling Places: {}"` | info | Same problems as above. | Becomes `dedup_discard` structured type. **Emitted as both `summary` AND `info`** — same dual-level approach as `dedup_merge`. |
| `"Deduping: Merged divisions for {} polling places with the same location"` *(line 988)* | info | **Redundant** — this is a trailing summary count that repeats information already encoded in the `dedup_merge` entries above it. The frontend can compute the total from those entries. | **Drop entirely.** |
| `"Deduping: Found {} polling places sharing the same name ({})"` | error | Prefix redundant. | Strip prefix: `"Found {} polling places sharing the same name: '{}'."` |

---

### `migrate_unofficial_pending_stalls`

| Current message | Level | Issue | Recommendation |
|---|---|---|---|
| `"Unofficial Pending Stall Migration: No unofficial pending stalls to migrate"` | info | Prefix redundant (Problem A). | Strip prefix: `"No unofficial pending stalls to migrate"`. Summary level. |
| `"Unofficial Pending Stall Migration: Found {} unofficial pending stall(s) to migrate"` | info | Prefix redundant. | Strip prefix. Summary level. |
| `"Unofficial Pending Stall Migration: No matching polling place found within 100m for stall {} ..."` (no-match error) | error | Long single string mixing primary error + action guidance. Multiple related messages follow. | Becomes `stall_no_match` structured type with `nearby` list sub-field and `action` field. |
| `"Unofficial Pending Stall Migration: No polling places found within 1km of stall {} either."` | error | Secondary inline message that belongs inside the parent no-match entry. | Merge into `stall_no_match.nearby = []` — empty list communicates the same thing. Drop separate message. |
| `"Unofficial Pending Stall Migration: Nearby polling place for stall {} ..."` (per nearby candidate) | error | One error per nearby candidate — many lines for one problem. | Merge into `stall_no_match.nearby` list. Drop per-candidate messages. |
| `"Unofficial Pending Stall Migration: {} polling places found within 100m for stall {} ..."` (multi-match) | error | Prefix redundant. Conflates zero and multi (Problem B — actually only multi here but message structure is confusing). | Becomes `stall_multi_match` structured type. |
| `"Unofficial Pending Stall Migration: Candidate polling place for stall {} ..."` (per candidate) | error | One error per candidate. | Merge into `stall_multi_match.candidates` list. Drop per-candidate messages. |
| `"Unofficial Pending Stall Migration: Stall {} matched successfully ... Please verify this match is correct."` | info | Pipe-delimited comparison. Guidance embedded in string. This is info level even though it needs review. | Becomes `stall_matched` structured type with `action: "Please verify this match is correct."` |
| `"Unofficial Pending Stall Migration: {} unofficial pending stall(s) still have no polling place after migration"` | error | Prefix redundant. | Strip prefix. Fine as `text` error. |
| `"Unofficial Pending Stall Migration: Matched and repointed {} of {} unofficial pending stall(s)"` | info | Prefix redundant. | Strip prefix: `"Matched and repointed {} of {} unofficial pending stall(s)"`. Summary level. |

---

### `migrate_noms`

| Current message | Level | Issue | Recommendation |
|---|---|---|---|
| `"Doing noms migration by ec_id for {}"` | info | Chatty per-item detail. Prefix implied by stage. | Strip prefix; keep as detail `info` `text`. Rename: `"Matching by EC ID: {}"`. |
| `"Find by ec_id [{}]: Found {} existing polling places with that id."` | error | Bracket-tag style inconsistent with the rest. Doesn't say how many were found in a human way. Uses same message for any N≥2 (Problem B applies partially). | Rewrite: `"Multiple polling places share EC ID '{}': {} found. Cannot migrate noms unambiguously."` |
| `"Doing noms migration by distance for {}"` | info | Chatty per-item detail. | Strip prefix; keep as detail `info` `text`. Rename: `"Matching by distance: {}"`. |
| `"Noms Migration: {} matching polling places found in new data: '{}' ({})"` | error | Prefix redundant. Same string for 0 and N>1 (Problem B). "matching polling places" is jargon. | Split into: `"No match found in new data for '{}' ({})"` and `"{} matches found in new data for '{}' ({})"`. |
| `"Noms Migration: {} stalls updated for polling place '{}' ({})"` | info | Prefix redundant. Fine. | Strip prefix. Detail `info`. |
| `"Noms Migration: User-added polling place '{}' ({}) has been merged successfully into the official polling place '{}' ({}). Is this correct?"` | warning | Problem C — success logged as warning. "Is this correct?" is guidance embedded in string. | Change to `info` level. Becomes a `noms_merge_review` type (similar to `stall_matched`) with `action: "Please verify this merge is correct."` |
| `"Noms Migration: Migrated {} polling places"` | info | Prefix redundant. | Strip prefix. Summary level. |
| `"Declined/Pending Stall Migration: {} matching polling places found in new data: '{}' ({})"` | error | The sub-label "Declined/Pending Stall Migration" is confusing — this is a sub-step inside `migrate_noms`, not a separate stage. Same Problem B (0 vs N). | Rename to `"Declined/pending stall: {} matches in new data for '{}' ({})"` and split. |
| `"Declined/Pending Stall Migration: Stall {} updated to point to polling place '{}' ({})"` | info | Sub-label confusing. | Rename: `"Stall {} repointed to '{}' ({})"`. Detail `info`. |
| `"Noms Migration: Migrated {} declined/pending stalls"` | info | Prefix redundant. | Strip prefix. Summary level. |
| `"Found {} old polling places with attached noms. This shouldn't happen."` | error | Fine. Post-validation assertion. | No change needed. |
| `"Polling place with noms still attached: {}"` *(per item)* | error | ID-only — not enough to identify a polling place in the UI. | Add name and address: `"Still has noms: '{}' ({}) [id={}]"` |
| `"Found {} stalls with old polling places attached. This shouldn't happen."` | error | Fine. | No change needed. |
| `"Stall: {}; Polling Place: {}"` *(per item)* | error | Semicolon-separated pair of IDs — minimal information. | Expand: `"Unmigrated stall: stall_id={}, polling_place_id={}"` |

---

### `migrate_mpps`

| Current message | Level | Issue | Recommendation |
|---|---|---|---|
| `"MPP Migration: Polling place not found in new data (it may have been removed) - detaching MPP: '{}' ({})"` | warning | Prefix redundant. Describes a polling place where an MPP *was* attached and was detached. | Merge both warning variants into one: `"Polling place not found in new data (may have been removed): '{}' ({})"` with `detached_mpp: bool` field. |
| `"MPP Migration: Polling place not found in new data (it may have been removed): '{}' ({})"` | warning | Prefix redundant. Same event with slightly different action. | Merge into one (see above). |
| `"MPP Migration: {} matching polling places found in new data: '{}' ({})"` | error | Prefix redundant. Problem B (0 vs N). | Split into no-match and multi-match. |
| `"Error creating MPP: {} (#{})"` | error | **Swallows the exception** — `except Exception as e:` captures `e` but doesn't log it. Impossible to debug. | Include exception: `f"Error creating MPP: {polling_place.name} (#{polling_place.id}): {e}"` |
| `"Error creating MPP task: {} (#{})"` | error | Same exception-swallowing problem. | Include exception: `f"Error creating MPP task: ... : {e}"` |
| `"MPP Migration: Migrated {} active polling places"` | info | Prefix redundant. | Strip prefix. Summary level. |
| `"MPP Migration: Handled {} draft polling places"` | info | Prefix redundant. | Strip prefix. Summary level. |
| `"{count} active polling places have an MPP still attached"` | error | Fine. Post-validation. | No change. |
| `"{count} draft polling places have no MPP"` | error | Fine. Post-validation. | No change. |

---

### `migrate`

| Current message | Level | Issue | Recommendation |
|---|---|---|---|
| `"Loaded {} new polling places (previous set = {}, previous archived = {})"` | info | Fine. Clear and informative. | Summary level. |

---

### `detect_facility_type`

| Current message | Level | Issue | Recommendation |
|---|---|---|---|
| `"Facility types detected from historical data: {}"` | info | Fine. | Summary level. |

---

### `calculate_chance_of_sausage`

| Current message | Level | Issue | Recommendation |
|---|---|---|---|
| `"Chance of Sausage calculations completed: Considered = {}; Updated = {}"` | info | Semicolons in summary message are odd. `"Considered = X"` verb-form inconsistency (`Considered` vs `Updated`). | Rewrite: `"Chance of sausage: considered {}, updated {}"`. Summary level. |

---

### `safe_find_by_distance` (shared utility)

| Current message | Level | Issue | Recommendation |
|---|---|---|---|
| `"Find by distance [{}]: Found {} existing polling places spatially near each other. Polling places: {}"` | error | Bracket-tag prefix. Long sentence. Semicolon-joined polling place list. | Becomes `spatial_proximity` structured type. `label` becomes `context` field. Polling places become a list. |

---

### Summary of all recommended changes

| # | Category | Scope | Action |
|---|---|---|---|
| 1 | Strip stage prefix strings | All stages | Remove `"Noms Migration:"`, `"MPP Migration:"`, `"Deduping:"`, `"Unofficial Pending Stall Migration:"`, `"Declined/Pending Stall Migration:"`, `"[EC_ID Checker]"`, `"[Geocoding Skipping - ...]"`, `"[Find Home Division]"`, `"Address merging:"` from every message |
| 2 | Fix format bug | `convert_to_demsausage_schema` | Line ~363: add `match` to format string or rewrite message |
| 3 | Split zero/multi match | `migrate_noms`, `migrate_mpps`, declined/pending sub-step | Two distinct messages instead of one `"N matching..."` |
| 4 | Fix exception swallowing | `migrate_mpps` | Include `str(e)` in the two MPP creation error messages |
| 5 | Drop redundant secondary errors | `dedupe_polling_places` | Drop `"Got 'None' for home division..."` (line ~867) |
| 6 | Drop redundant summary | `dedupe_polling_places` | Drop the trailing `"Merged divisions for {} polling places..."` count (line ~988) |
| 7 | Merge near-identical MPP warnings | `migrate_mpps` | One message with `detached_mpp: bool` field |
| 8 | Fix level confusion | `migrate_noms` | `"User-added polling place...Is this correct?"` → `info` + `action` field |
| 9 | Merge geocoding summaries | `geocode_missing_locations` | One combined summary instead of two |
| 10 | Batch header field errors | `check_file_validity` | One error listing all unknowns; one listing all missing |
| 11 | Rename "Declined/Pending Stall Migration" sub-label | `migrate_noms` | Shorten to context-appropriate name; not a stage |
| 12 | Add names to per-item validation errors | `write_draft_polling_places` | Add `name`/`premises` to `validation_error` |
| 13 | Expand ID-only per-item error messages | `migrate_noms` | Add name/address to "stall still attached" and "polling place with noms" lines |
| 14 | Promote counts to `summary` level | All stages | All end-of-stage count messages use `summary` level rather than `info` |

---

## Typed Log Entry Catalogue

Every call to `self.logger.*` is replaced with `self._log(level, type, ...)`. The full set of types:

### Simple text (most summary/info messages)

```python
self._log("summary", "text", message="Noms Migration: Migrated 42 polling places")
self._log("info", "text", message="Doing noms migration by ec_id for Acme Hall")
self._log("error", "text", message="Config: address_format required if address_fields provided")
```

```json
{"level": "summary", "type": "text", "message": "..."}
```

### Validation error (check_polling_place_validity)

Replaces: `"Polling place {} ({}) invalid: {}".format(name, premises, serialiser.errors)`

```python
self._log("error", "validation_error",
    name=polling_place["name"],
    premises=polling_place["premises"],
    fields=[
        {"field": field, "messages": messages}
        for field, messages in serialiser.errors.items()
    ]
)
```

```json
{
  "level": "error",
  "type": "validation_error",
  "name": "Acme Hall",
  "premises": "Community Centre",
  "fields": [
    {"field": "state", "messages": ["Value 'VIC' is not a valid choice."]},
    {"field": "divisions", "messages": ["This field is required."]}
  ]
}
```

### Geocode skip (geocode_missing_locations)

Replaces three separate warning strings with different inline reasons.

```python
self._log("warning", "geocode_skip",
    reason="not_accurate_enough",  # or "no_results" | "not_enabled"
    premises=polling_place["premises"],
    address=polling_place["address"],
    geocode_result=geocode_result  # raw Google Maps result kept as-is
)
```

```json
{
  "level": "warning",
  "type": "geocode_skip",
  "reason": "not_accurate_enough",
  "premises": "Community Hall",
  "address": "123 Main St",
  "geocode_result": { ... }
}
```

### Stall — no match (migrate_unofficial_pending_stalls)

Replaces 2–N separate error lines (the "no match" line + "no places within 1km" or N "nearby" lines).

```python
self._log("error", "stall_no_match",
    stall_id=stall.id,
    user_location={
        "name": stall.location_info["name"],
        "address": stall.location_info["address"],
        "state": stall.location_info["state"],
    },
    nearby=[
        {"name": pp.name, "premises": pp.premises, "address": pp.address, "distance_m": round(pp.distance.m)}
        for pp in nearby
    ],
    action="Adjust the distance threshold or update the database manually."
)
```

```json
{
  "level": "error",
  "type": "stall_no_match",
  "stall_id": 42,
  "user_location": {"name": "Corner Deli", "address": "5 High St", "state": "VIC"},
  "nearby": [
    {"name": "Acme Hall", "premises": "Main Hall", "address": "7 High St", "distance_m": 380}
  ],
  "action": "Adjust the distance threshold or update the database manually."
}
```

### Stall — multiple matches (migrate_unofficial_pending_stalls)

Replaces N+1 separate error lines (the "N polling places found" line + N "Candidate" lines).

```python
self._log("error", "stall_multi_match",
    stall_id=stall.id,
    user_location={...},
    candidates=[
        {"name": pp.name, "premises": pp.premises, "address": pp.address, "distance_m": round(pp.distance.m)}
        for pp in matching_polling_places
    ]
)
```

```json
{
  "level": "error",
  "type": "stall_multi_match",
  "stall_id": 42,
  "user_location": {"name": "Corner Deli", "address": "5 High St", "state": "VIC"},
  "candidates": [
    {"name": "Hall A", "premises": "Premises A", "address": "Addr A", "distance_m": 20},
    {"name": "Hall B", "premises": "Premises B", "address": "Addr B", "distance_m": 45}
  ]
}
```

### Stall — matched successfully (migrate_unofficial_pending_stalls)

Replaces the long pipe-delimited info string with a true two-sided object.

```python
self._log("info", "stall_matched",
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
    action="Please verify this match is correct."
)
```

```json
{
  "level": "info",
  "type": "stall_matched",
  "stall_id": 42,
  "distance_m": 38,
  "user_submitted": {"name": "Corner Deli", "address": "5 High St", "state": "VIC"},
  "official": {"name": "Acme Community Hall", "premises": "Acme", "address": "7 High St"},
  "action": "Please verify this match is correct."
}
```

### Spatial proximity (safe_find_by_distance)

Replaces the semicolon-joined string of polling place names.

```python
self._log("error", "spatial_proximity",
    stage_name=label,  # machine-readable method name, e.g. "migrate_noms"
    polling_places=[
        {"name": pp.name, "premises": pp.premises, "address": pp.address}
        for pp in results
    ]
)
```

### Deduplication — merge (dedupe_polling_places)

Replaces the long semicolon-joined info string. Emitted with both `summary` and `info` levels so it surfaces in both the Summaries section (human sense-check) and the Detail section.

```python
# Summary version — visible without expanding Detail
self._log("summary", "dedup_merge",
    count=len(indexes),
    location=key,
    divisions=divisions,
    polling_places=[
        {"name": pp["name"], "premises": pp["premises"], "address": pp["address"]}
        for pp in polling_places
    ]
)
# Detail version — also captured in full detail log
self._log("info", "dedup_merge",
    count=len(indexes),
    location=key,
    divisions=divisions,
    polling_places=[
        {"name": pp["name"], "premises": pp["premises"], "address": pp["address"]}
        for pp in polling_places
    ]
)
```

### Deduplication — discard (dedupe_polling_places)

Emitted with both `summary` and `info` levels, same pattern as `dedup_merge`.

```python
# Summary version
self._log("summary", "dedup_discard",
    count=len(indexes) - 1,
    location=key,
    polling_places=[
        {"name": pp["name"], "premises": pp["premises"], "address": pp["address"]}
        for pp in polling_places
    ]
)
# Detail version
self._log("info", "dedup_discard",
    count=len(indexes) - 1,
    location=key,
    polling_places=[
        {"name": pp["name"], "premises": pp["premises"], "address": pp["address"]}
        for pp in polling_places
    ]
)
```

### EC ID duplicate (check_file_validity)

```python
self._log("error", "ec_id_duplicate",
    name=polling_place["name"],
    premises=polling_place["premises"],
    ec_id=polling_place["ec_id"]
)
```

### Find home division error (dedupe_polling_places)

```python
self._log("error", "find_home_division_error",
    polling_place_name=polling_places[0]["name"],
    reason="multiple_matches",  # or "no_match" | "not_in_list"
    eb_division=eb_division_name,  # only for "not_in_list"
    candidates=list(matching_boundaries.values_list("division_name", flat=True))
)
```

### Noms merge review (migrate_noms, first load only)

Replaces the `warning`-level pipe-style string `"User-added polling place ... has been merged successfully ..."`.

```python
self._log("info", "noms_merge_review",
    user_submitted={
        "name": polling_place.name,
        "address": polling_place.address,
    },
    official={
        "name": matching_polling_places[0].name,
        "address": matching_polling_places[0].address,
    },
    action="Please verify this merge is correct."
)
```

```json
{
  "level": "info",
  "type": "noms_merge_review",
  "user_submitted": {"name": "Corner Deli", "address": "5 High St"},
  "official": {"name": "Acme Community Hall", "address": "7 High St"},
  "action": "Please verify this merge is correct."
}
```

### MPP not found (migrate_mpps)

Replaces the two near-identical warning variants (with/without MPP detachment).

```python
self._log("warning", "mpp_not_found",
    name=polling_place.name,
    address=polling_place.address,
    detached_mpp=polling_place.meta_polling_place is not None,
    action=(
        "This polling place previously had a meta polling place assigned — "
        "please verify the removal is correct."
        if polling_place.meta_polling_place is not None else None
    )
)
```

```json
{
  "level": "warning",
  "type": "mpp_not_found",
  "name": "Acme Hall",
  "address": "5 High St",
  "detached_mpp": true,
  "action": "This polling place previously had a meta polling place assigned — please verify the removal is correct."
}
```

---

## Frontend Changes (ElectionLoadPollingPlaces.tsx)

### Updated TypeScript types

```typescript
// Base
interface LogEntryBase {
  level: 'error' | 'warning' | 'summary' | 'info';
}

interface TextEntry extends LogEntryBase {
  type: 'text';
  message: string;
}

interface ValidationErrorEntry extends LogEntryBase {
  type: 'validation_error';
  name: string;
  premises: string;
  fields: { field: string; messages: string[] }[];
}

interface GeocodeSkipEntry extends LogEntryBase {
  type: 'geocode_skip';
  reason: 'no_results' | 'not_accurate_enough' | 'not_enabled';
  premises: string;
  address: string;
  geocode_result?: unknown;
}

interface StallLocation { name: string; address: string; state: string; }
interface PollingPlaceRef { name: string; premises: string; address: string; distance_m?: number; }

interface StallNoMatchEntry extends LogEntryBase {
  type: 'stall_no_match';
  stall_id: number;
  user_location: StallLocation;
  nearby: PollingPlaceRef[];
  action?: string;
}

interface StallMultiMatchEntry extends LogEntryBase {
  type: 'stall_multi_match';
  stall_id: number;
  user_location: StallLocation;
  candidates: PollingPlaceRef[];
}

interface StallMatchedEntry extends LogEntryBase {
  type: 'stall_matched';
  stall_id: number;
  distance_m: number;
  user_submitted: StallLocation;
  official: PollingPlaceRef;
  action?: string;
}

interface SpatialProximityEntry extends LogEntryBase {
  type: 'spatial_proximity';
  stage_name: string;   // machine-readable method name, e.g. "migrate_noms"
  polling_places: PollingPlaceRef[];
}

interface DedupMergeEntry extends LogEntryBase {
  type: 'dedup_merge';
  count: number;
  location: string;
  divisions: string[];
  polling_places: PollingPlaceRef[];
}

interface DedupDiscardEntry extends LogEntryBase {
  type: 'dedup_discard';
  count: number;
  location: string;
  polling_places: PollingPlaceRef[];
}

interface EcIdDuplicateEntry extends LogEntryBase {
  type: 'ec_id_duplicate';
  name: string;
  premises: string;
  ec_id: string;
}

interface FindHomeDivisionErrorEntry extends LogEntryBase {
  type: 'find_home_division_error';
  polling_place_name: string;
  reason: 'multiple_matches' | 'no_match' | 'not_in_list';
  eb_division?: string;
  candidates?: string[];
}

interface NomsMergeReviewEntry extends LogEntryBase {
  type: 'noms_merge_review';
  user_submitted: { name: string; address: string };
  official: { name: string; address: string };
  action?: string;
}

interface MppNotFoundEntry extends LogEntryBase {
  type: 'mpp_not_found';
  name: string;
  address: string;
  detached_mpp: boolean;
  action?: string;  // present when detached_mpp is true
}

export type LogEntry =
  | TextEntry
  | ValidationErrorEntry
  | GeocodeSkipEntry
  | StallNoMatchEntry
  | StallMultiMatchEntry
  | StallMatchedEntry
  | SpatialProximityEntry
  | DedupMergeEntry
  | DedupDiscardEntry
  | EcIdDuplicateEntry
  | FindHomeDivisionErrorEntry
  | NomsMergeReviewEntry
  | MppNotFoundEntry;

export interface LoaderStage {
  name: string;
  label: string;
  outcome: 'ok' | 'warning' | 'error' | 'skipped';
  started_at: string;
  finished_at: string;
  duration_seconds: number;
  /** Total entries across all log levels before any frontend-side truncation. */
  total_entry_count: number;
  errors: LogEntry[];
  warnings: LogEntry[];
  summaries: LogEntry[];
  detail: LogEntry[];
}

export interface LoaderJobResponse {
  run_at: string;
  run_by: string | null;
  is_dry_run: boolean;
  /** true if polling places already existed for this election at load time */
  is_reload: boolean;
  total_errors: number;
  total_warnings: number;
  total_actions_required: number;
  /** null for dry runs */
  total_polling_places: number | null;
  /** net change vs previous set: new_polling_places - deleted_polling_places */
  delta_total: number | null;
  new_polling_places: number | null;
  deleted_polling_places: number | null;
  stages: LoaderStage[];
}
```

### Outcome banner

Shown at the top of the results area when the job finishes:

- `severity="info"` — dry run (`is_dry_run: true`): "Dry run complete — no changes were saved."
- `severity="error"` — `total_errors > 0`: "Loading failed with N error(s) across M stage(s)."
- `severity="warning"` — `total_errors === 0 && total_warnings > 0`: "Loaded successfully with N warning(s)."
- `severity="success"` — clean: "Polling places loaded successfully."

In all non-error cases where `total_actions_required > 0`, append a secondary line below the banner severity text: **"N item(s) require manual verification — see amber callouts below."**

Below the outcome severity, show a stats row:
- `{total_polling_places} polling places loaded` (omitted for dry run)
- `▲ {new_polling_places} new` / `▼ {deleted_polling_places} removed` / net delta chip (omitted for dry run; also omitted when `is_reload: false` since there is no previous set to compare against)
- When `is_reload: false`, prepend "First load — " to the banner body to contextualise any migration-stage warnings (e.g. `mpp_not_found` on a first load is expected and not alarming)
- Run time: `{run_at}` — `{run_by}`

For aborted/failed loads: banner shows the error state. Add a secondary note: "The load did not complete — your existing live data is unchanged." Stats fields will be `null` and the stats row is omitted.

### Stage accordion list

- **Live (during run):** stage names tick off via `job.meta["_polling_place_loading_stages_log"]`. The frontend applies `STAGE_LABELS` lookup to display human-readable labels in real time — not raw method names.
- **On completion:** full structured detail panel replaces the live ticker.
- Each `Accordion` row header: label, `outcome` badge (coloured: green/amber/red/grey), duration chip (e.g. `4.4s`), error/warning count chips.
- Auto-expanded if `outcome === "error"`; collapsed otherwise.
- Stage body layout:
  1. **Errors** — always visible if present; first 20 shown, "Show N more" toggle
  2. **Warnings** — always visible if present
  3. **Summaries** — always visible
  4. **Detail** — collapsed behind a secondary toggle ("Show detail / N entries") by default; the operator must opt in to see per-item lines

### Entry renderers (type-driven)

| `type` | Renderer |
|---|---|
| `text` | Plain `<ListItemText>` |
| `validation_error` | Table: field → error messages |
| `geocode_skip` | Single line + reason badge + collapsible raw result |
| `stall_no_match` | Parent error card + collapsible nearby candidate list |
| `stall_multi_match` | Parent error card + collapsible candidate list |
| `stall_matched` | Side-by-side comparison card (user-submitted vs. official) |
| `noms_merge_review` | Side-by-side comparison card (user-submitted vs. official); identical layout to `stall_matched` |
| `spatial_proximity` | Parent row + collapsible polling place list |
| `dedup_merge` / `dedup_discard` | Collapsible card in Summaries section (prominent, human sense-check); same entry also appears in Detail section behind the detail toggle |
| `ec_id_duplicate` | Single line: name, premises, ec_id |
| `find_home_division_error` | Single line + reason badge + collapsible candidates |
| `mpp_not_found` | Single line + `"MPP detached"` badge if `detached_mpp: true`; action callout below when `action` is present |
| Any entry with `action` field | Amber "Action required" callout rendered below the entry |

**Note on `stall_id`:** The `stall_no_match`, `stall_multi_match`, and `stall_matched` entries include `stall_id`. There are currently no admin UI pages for stalls or MPPs, so this is rendered as a plain ID. The field is present to support future deep-linking once those pages exist.

Error entries: first 20 shown, "Show N more" toggle.

---

## Implementation Sequence

**Phase 0 — Tests first (before any loader changes)**
1. Add test dev-dependencies to `pyproject.toml` (`pytest-django`, `factory-boy`)
2. Create `conftest.py` with mock job, test election, and autouse patches
3. Copy real election CSVs and `config.json` pairs for the 7 fixture elections into `tests/fixtures/elections/`. See `scrapers/CONFIG_MATRIX.md` for which elections to use and why.
4. Write the data integrity tests in `test_data_integrity.py` (dry-run rollback check, full-load count, spot-check, `detect_facility_type` run, `calculate_chance_of_sausage` run)
   ✅ Regression baseline locked in

**Phase 1 — Comprehensive synthetic test suite (see dedicated section below)**
6. Add `electoral_boundaries` fixture and `make_csv()` helper to `conftest.py`
7. `test_config_validation.py` — `_config` stage with bad config; valid config variations (6 tests)
8. `test_convert.py` — rename_columns, address_format × 3 variants, extras, fix_data_issues × 2 patterns, cleaning_regexes, filters (type="is_exactly"), division_fields merging (12 tests — covers convert_to_demsausage_schema, fix_polling_places, prepare_polling_places stages)
9. `test_check_validity.py` — bbox error path (name not in ignore list), bbox warning path (name in ignore list), bbox warning when no bbox_validation config, serialiser validation failure (4 tests). **Note:** `write_draft_polling_places`'s own `serialiser.errors` branch is unreachable in normal execution because `check_polling_place_validity` bails first — document this with a `# pragma: no cover` comment when refactoring rather than writing a contorted test.
10. `test_validate.py` — missing required field, duplicate ec_id, blank ec_id warning, dedup_merge, dedup_discard, same-location different-places error, post-dedup name duplicate error, `spatial_proximity` error from `safe_find_by_distance` (8 tests). **Note:** `dedup_discard` requires a CSV with **no** `divisions` column at all (use `no_divisions.csv` synthetic fixture); the real-election fixture CSVs all have `divisions` and will hit the `dedup_merge` branch instead. **xfail test (bug #1):** add a ninth test `test_dedup_merge_with_extras_crashes` using a CSV that has `extras` AND produces a dedup merge — this exposes the `NameError: pp` bug in `_merge_and_sum_extras` and is marked `@pytest.mark.xfail(strict=True, reason="Bug: pp unbound in _merge_and_sum_extras outer if")` so it documents the bug without blocking CI.
11. `test_geocode.py` — enabled, disabled (skipped stage), skip reasons: no_results, not_accurate_enough (4 tests). Each skip-reason test additionally asserts `len(loader.polling_places)` equals the initial row count minus the number of skipped rows, confirming skipped places are dropped from the list and not silently included.
12. `test_find_home_division.py` — `USE_ELECTORAL_BOUNDARIES` (happy path, no-match error, multi-match error) + first-division fallback (4 tests)
13. `test_write.py` — full-pipeline: ACTIVE count, reload archives old places, no DRAFT rows remaining (3 tests)
14. `test_migrate_noms.py` — stall_matched (FK repointed), stall_no_match (error logged + no FK update), stall_multi_match, noms_merge_review warning present on first load (`polling_places_loaded=False`), noms_merge_review **absent** on reload (`polling_places_loaded=True`), ec_id collision in noms migration (`Find by ec_id` multi-match error logged + no noms transferred), `overwrite_distance_thresholds` respected during distance-based noms migration (polling place whose name matches a threshold entry migrates at custom distance, not at default 100m) — Phase 1 asserts DB state and error/warning presence; structured entry-type assertions are Phase 2 (7 tests)
15. `test_migrate_mpps.py` — mpp_not_found detached=True (action field present), mpp_not_found detached=False (no action), successful migration (MPP FK repointed on DRAFT), new MPP created on first load, ec_id collision in MPP migration (`Find by ec_id` multi-match error logged), `overwrite_distance_thresholds` respected during distance-based MPP migration (6 tests). **xfail test (bug #2):** add a seventh test `test_new_mpp_full_clean_failure_does_not_save` where `MetaPollingPlaces.full_clean()` is patched to raise `ValidationError` — asserts that `mpp.save()` is NOT called when `full_clean()` raises; marked `@pytest.mark.xfail(strict=True, reason="Bug: mpp.save() runs unconditionally after full_clean() try/except")`. Same for the `mpp_task.full_clean()` path.
16. `test_migrate_stalls.py` — unofficial pending stall: no_match (error logged, FK not updated), unofficial pending stall: multi_match (error logged, candidates listed), unofficial pending stall: early exit when `polling_places_loaded=True` (method returns immediately, no log entries emitted), unofficial pending stall: matched successfully (FK repointed, stall_matched log present), declined stall migration (FK repointed to DRAFT PP), declined stall: zero-match error (no DRAFT PP within 100m), declined stall: multi-match / `spatial_proximity` error from `safe_find_by_distance` (7 tests)
17. `test_detect_facility.py` — proximity match from seeded historical data sets `facility_type`; no nearby historical data → `facility_type` remains null; `calculate_chance_of_sausage` happy path (update_count > 0 when historical noms exist); `calculate_chance_of_sausage` error path where `calculate_chance_of_sausage_stats` returns a dict missing a polling place ID (error message logged for that polling place) (4 tests)
18. `test_transforms.py` — `_log()`, `_has_errors()`, `STAGE_LABELS` completeness (pure unit, no DB) — **written at start of Phase 2, not Phase 1**
    ✅ Full loader *pre-refactor* behaviour specified in tests before a single line of loader code changes

**Phase 2 — Backend refactor**
19. Define full TypeScript union type (discriminated on `type`) — types only, no rendering yet
20. Replace `make_logger` / `StringIO` with `self.log_entries` list on `PollingPlacesIngestBase`
21. Rewrite `invoke_and_bail_if_errors` with stage snapshotting and `datetime.now(timezone.utc)`
22. Replace each `self.logger.*` call with `self._log(...)` using the typed catalogue and audit recommendations
23. Write `collect_structured_logs()`, update `save_logs()` and the `PollingPlaceLoaderEventsSerializer` / model
    → Synthetic tests must stay green throughout — any failure means logic was broken

**Phase 3 — Frontend**
24. Frontend: outcome banner + stage accordion shell (no entry rendering yet)
25. Frontend: implement each entry type renderer
26. Frontend: wire `action` callout for entries with `action` field

---

## Testing Strategy

### Context

- **Zero existing test infrastructure** — no pytest, no fixtures, no `tests/` directory. `pyproject.toml` has empty `dev-dependencies`. The `test_data/` folder contains manual seed scripts for a live DB, not automated tests.
- **PostGIS required** — the DB engine is `django.contrib.gis.db.backends.postgis`. Tests cannot run against SQLite. The existing Docker Compose `db` container is the test target.
- **RQ coupling** — `get_current_job()` is called in `__init__` and `invoke_and_bail_if_errors` and must be mocked.
- **Real CSV inputs available** — `scrapers/` and the per-election `data/` subdirectories contain real historical election CSVs.
- **CI wiring** — deferred; get tests running in Docker first.

---

### Chosen Approach: Synthetic tests + data integrity tests

~~Golden-file (characterisation) tests were considered and rejected.~~ The approach of snapshotting the full log output for 7 real election CSVs was abandoned: the snapshots would capture thousands of polling place–level log lines whose content is tied to the exact CSV data (polling place names, addresses, ec_ids, dedup results). Any change to the fixture CSV — or any innocuous change to the loader that altered timing or ordering — would produce a spurious full-snapshot diff that is impossible to review meaningfully. The snapshots would become noise rather than a safety net.

Instead, regression coverage comes from two complementary layers:
- **Data integrity tests** (`test_data_integrity.py`) — run the loader against the 7 real-election CSVs and assert only on stable DB-state facts (row counts, active/archived status, spot-checked field values). These are immune to log format changes and survive the Phase 2 refactor unchanged.
- **Synthetic tests** (all other Phase 1 files) — unit-test every loader behaviour with purpose-built minimal CSVs and assert precisely on outcomes that matter. These are the living spec for Phase 2.

---

### Tech Stack (all new dev dependencies)

```toml
[tool.poetry.dev-dependencies]
pytest = "^8.0"
pytest-django = "^4.8"
pytest-mock = "^3.14"
factory-boy = "^3.3"     # DB fixture factories
```

---

### What Needs Mocking

| Dependency | Why | Mock |
|---|---|---|
| `get_current_job()` | Called in `__init__` and `invoke_and_bail_if_errors` | Return a `MagicMock` with `meta = {"_polling_place_loading_stages_log": []}`, `save_meta()` as noop, `id = "test-job-id"` |
| `task_regenerate_cached_election_data.delay()` | Called in `migrate()` and `cleanup()` | Patch to noop |
| `save_logs()` | Writes to `/app/logs/` (won't exist outside the app container) | Patch to noop in all tests |
| Google Maps geocode API | Only called when `geocoding.enabled = True` | The `_run_dry()` test helper always sets `config["geocoding"]["enabled"] = False` before constructing the loader. For real election configs where geocoding is already disabled this is a no-op; for any future test using a geocoding-enabled config it prevents API calls. |

---

### Test Database Setup

Add a `TEST` block to the default database config in `settings.py`:

```python
DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        ...
        "TEST": {
            "NAME": "demsausage_test",
        },
    }
}
```

The existing `db` Docker Compose container is the PostGIS target. Run tests from inside the `django` container:

```bash
docker compose exec django pytest tests/ -v
```

Django's test runner creates and destroys `demsausage_test` automatically. PostGIS extension must exist on the Postgres instance (it does — the container has it).

---

### Directory Structure

```
django/
  tests/
    __init__.py
    conftest.py                           # shared fixtures: mock job, test election, patches
    fixtures/
      elections/
        vic_2022/
          polling_places.csv              # latest CSV from scrapers/vic_2022/
          config.json                     # from scrapers/vic_2022/config.json
        sa_2022/
          polling_places.csv              # latest CSV from scrapers/sa_2022/
          config.json                     # from scrapers/sa_2022/config.json
        sa_2025/
          polling_places.csv              # latest CSV from scrapers/sa_2025/
          config.json                     # from scrapers/sa_2025/config.json
        tas_2025/
          polling_places.csv              # latest CSV from scrapers/tas_2025/
          config.json                     # from scrapers/tas_2025/config.json
        nsw_lg_2024/
          polling_places.csv              # latest CSV from scrapers/nsw_lg_2024/
          config.json                     # from scrapers/nsw_lg_2024/config.json
        federal_2025/
          polling_places.csv              # latest CSV from scrapers/federal_2025/
          config.json                     # from scrapers/federal_2025/config.json
        federal_2022/
          polling_places.csv              # latest CSV from scrapers/federal_2022/
          config.json                     # from scrapers/federal_2022/config.json
    synthetic/                          # Phase 1 — per-scenario fixture CSVs (for full-pipeline tests)
      multi_division_federal.csv        # USE_ELECTORAL_BOUNDARIES scenarios
      stall_migration_base.csv          # migrate_noms seeded scenarios
      no_divisions.csv                  # dedup_discard path: same geom, two rows, no divisions column at all
      extras_dedup.csv                  # xfail bug#1: extras column + same geom → _merge_and_sum_extras NameError
    loader/
      test_data_integrity.py             # Phase 0 — DB state assertions (must stay GREEN throughout)
      test_config_validation.py          # Phase 1 — _config stage + bad config
      test_convert.py                    # Phase 1 — convert_to_demsausage_schema + fix_polling_places + prepare_polling_places config features
      test_check_validity.py             # Phase 1 — check_polling_place_validity (bbox error/warning paths, serialiser validation)
      test_validate.py                   # Phase 1 — check_file_validity: required fields, duplicate ec_id, blank ec_id warning, dedup paths
      test_geocode.py                    # Phase 1 — geocode_missing_locations
      test_find_home_division.py         # Phase 1 — find_home_division (all 4 variants)
      test_write.py                      # Phase 1 — write_draft, migrate, cleanup
      test_migrate_noms.py               # Phase 1 — migrate_noms
      test_migrate_mpps.py               # Phase 1 — migrate_mpps
      test_migrate_stalls.py             # Phase 1 — unofficial/declined stall migration
      test_detect_facility.py            # Phase 1 — detect_facility_type + calculate_chance_of_sausage
      test_transforms.py                 # Phase 2 — pure unit tests for _log, _has_errors, STAGE_LABELS (written at start of Phase 2)
      test_known_bugs.py                 # xfail tests documenting pre-existing bugs (see "Known pre-existing bugs" section)
```

---

### `conftest.py` Layout

```python
import pytest
from unittest.mock import MagicMock, patch
from django.contrib.gis.geos import Polygon
from demsausage.app.models import Elections
from demsausage.app.enums import PollingPlaceJurisdiction
from datetime import datetime
import pytz

@pytest.fixture
def mock_job():
    job = MagicMock()
    job.id = "test-job-id"
    # Use a real dict so .update() and key access work natively without further mocking.
    # get_current_job() is called in two places in loader.py:
    #   1. LoadPollingPlaces.__init__: self.job = get_current_job()
    #   2. invoke_and_bail_if_errors: job.meta["_polling_place_loading_stages_log"].append(...)
    #      followed by job.save_meta()
    job.meta = {"_polling_place_loading_stages_log": []}
    # save_meta() is called after each stage update; a noop MagicMock is sufficient
    job.save_meta = MagicMock()
    return job

@pytest.fixture(autouse=True)
def patch_rq(mock_job):
    # Patch in loader.py's import namespace, not in the rq package itself
    with patch("demsausage.app.sausage.loader.get_current_job", return_value=mock_job):
        yield

@pytest.fixture(autouse=True)
def patch_task_regenerate():
    with patch("demsausage.app.sausage.loader.task_regenerate_cached_election_data"):
        yield

@pytest.fixture(autouse=True)
def patch_save_logs():
    with patch("demsausage.app.sausage.loader.PollingPlacesIngestBase.save_logs"):
        yield

@pytest.fixture
def test_election(db):
    # Polygon covering all of Australia — contains all real polling place coordinates
    # used across the fixture elections (SA, VIC, QLD etc.)
    geom = Polygon((
        (112.0, -44.0), (155.0, -44.0), (155.0, -9.0), (112.0, -9.0), (112.0, -44.0)
    ), srid=4326)
    return Elections.objects.create(
        name="Test Election",
        short_name="test_election",
        geom=geom,
        is_test=True,
        polling_places_loaded=False,
        election_day=datetime(2030, 1, 1, tzinfo=pytz.utc),
        jurisdiction=PollingPlaceJurisdiction.State.value,
        is_state=True,
    )
```

---

### `_run_dry()` helper

`_run_dry()` is a plain function (not a fixture) in `conftest.py`, shared by Phase 1 tests and `test_data_integrity.py`. It runs the loader in `dry_run=True` mode against a named fixture election directory and returns the captured log dict from the `BadRequest` exception that the dry-run path always raises. Safety overrides applied on every call:
- `config["geocoding"]["enabled"]` forced to `False` — no API calls
- `multiple_division_handling` stripped — no PostGIS boundary lookups (covered separately in `test_find_home_division.py`)

---

### Known pre-existing bugs (tracked as `xfail`)

These are bugs found in `loader.py` during test design. Tests for them are written immediately alongside Phase 1 tests so the behaviour is documented and fails the moment someone fixes the bug (strict xfail). They live in `test_known_bugs.py` but are also referenced inline in the owning test file where it makes sense to co-locate them.

| # | Bug | Location | xfail test name | Strict? |
|---|---|---|---|---|
| 1 | `NameError: pp` — `_merge_and_sum_extras` outer `if` references `pp` before the comprehension that defines it | `dedupe_polling_places._merge_and_sum_extras` | `test_dedup_merge_with_extras_crashes` | Yes |
| 2 | `mpp.save()` and `mpp_task.save()` run unconditionally after `try: full_clean() / except: log_error` — invalid objects are persisted | `migrate_mpps` (two call sites: active MPP without match; DRAFT loop) | `test_new_mpp_full_clean_failure_does_not_save`, `test_mpp_task_full_clean_failure_does_not_save` | Yes |
| 3 | `self.election.polling_places_loaded.save()` in `RollbackPollingPlaces.cleanup()` calls `.save()` on a `bool` — raises `AttributeError` | `RollbackPollingPlaces.cleanup` | `test_rollback_cleanup_sets_polling_places_loaded_false` | Yes (out of scope for Phase 1 load tests; add to `test_known_bugs.py` for traceability) |

All three use `@pytest.mark.xfail(strict=True, reason="...")`. `strict=True` means the test PASSES when the bug is present (expected failure) and FAILS (surprise pass) the moment the bug is fixed — at which point the `xfail` marker should be removed and the test promoted to a normal assertion.

---

**Note on `multiple_division_handling` override:** All federal and referendum configs use `determine_home_division: USE_ELECTORAL_BOUNDARIES`, which requires `ElectoralBoundaries` rows to exist in the DB. `_run_dry()` pops this key from the config before constructing the loader, so all other federal config features (filters, cleaning_regexes, bbox_validation, 6-field address merge, extras, fix_data_issues) are exercised without a boundary lookup. The `USE_ELECTORAL_BOUNDARIES` path is covered separately by `test_find_home_division.py` with a PostGIS boundary fixture.

**Note on `config.json` geocoding override:** The helper always sets `config["geocoding"]["enabled"] = False`. For state elections where geocoding is already disabled this is a no-op. For federal_2025 (geocoding: true) it prevents any API call.

---

### CSV Fixture Strategy

Use **the latest timestamped CSV** from each chosen scraper directory alongside its **matching `config.json`**, copied into `tests/fixtures/elections/{election}/`. The CSV and config.json are self-consistent because the config was written against that exact CSV version — field names, column structures, and fix rules all match.

**Why not use synthetic CSVs?** The config.json files contain `fix_data_issues`, `cleaning_regexes`, `rename_columns`, and `address_format` rules tied to specific column structures. A hand-crafted CSV won't match those rules reliably — you'd get spurious errors during test setup that are nothing to do with the loader logic.

**Complete feature matrix across all 20 election configs surveyed:**

| Election | filters | exclude | rename | add_cols | addr merge | extras | fix_data | regex | bbox | dist_thresh | geocoding | multi_div |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `vic_2022` | — | — | — | ✓ | — | — | — | — | — | — | off | — |
| `sa_2022` | — | ✓ | ✓ | ✓ | — | ✓(empty) | ✓ | — | — | — | off | — |
| `sa_2025` | — | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | — | — | off | — |
| `tas_2025` | — | — | ✓ | — | ✓ | ✓ | ✓ | — | — | — | off | — |
| `nsw_lg_2024` | — | — | — | — | — | — | ✓(lat/lon) | — | — | ✓ | off | — |
| `federal_2025` | ✓ | ✓ | ✓ | — | ✓(6 fields) | ✓ | ✓ | ✓ | ✓ | — | **on** | **USE_EB** |
| qld_2024, act_2024, wa_2025, nt_2024, nsw_2023, wa_2021, act_2020, qld_2020, nsw_by_2024 | — | — | — | — | — | — | — | — | — | — | off | — |
| federal_2019, federal_2022, referendum_2023 | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✓ | — | on | USE_EB |

The 9 elections in the last two rows are either structurally redundant with the chosen 6, or require `ElectoralBoundaries` without adding new config dimensions.

**Chosen elections (6 distinct config shapes):**

| Election | Config shape | Unique features exercised |
|---|---|---|
| `vic_2022` | Bare minimum | Baseline — loader with almost no config transformation |
| `sa_2022` | SA proprietary (old) | `rename_columns` + `add_columns` (hardcoded `"state": "SA"`, `"ec_id": ""`) + `exclude_columns` + `extras` (empty list) + `fix_data_issues` (short code → full string: `F/A/N` → wheelchair labels). Pre-formatted address column — no `address_fields`/`address_format` merge. |
| `sa_2025` | SA proprietary (current) | Same rename/exclude/add_columns shape as sa_2022 but adds `address_fields`/`address_format` (address merging path) and richer `fix_data_issues` |
| `tas_2025` | AEC state format | `rename_columns` using AEC column naming (`Premise_Name`, `Polling_Place_Name` etc.) + multi-field `address_format` + `extras` with a non-empty field list + `fix_data_issues` |
| `nsw_lg_2024` | Distance threshold + coordinate fix | `overwrite_distance_thresholds` (match-by-name distance override) + `fix_data_issues` that overwrite `lat`/`lon` by name — the only election using distance threshold overrides |
| `federal_2025` | Full federal AEC | `filters` (Status = Current \| Appointment), `exclude_columns`, `rename_columns`, `fix_data_issues` (2 entries: entrance_desc fix + wheelchair empty→Unknown), `cleaning_regexes`, 6-field `address_format`, `extras`, `bbox_validation` (Lord Howe Is., Norfolk Is.), geocoding (overridden to false), `multiple_division_handling` (popped by test helper) |
| `federal_2022` | Federal AEC at scale | Same shape as federal_2025 but with dozens of ec_id-keyed lat/lon `fix_data_issues` entries — exercises the fixer loop under load and confirms correctness across a full federal CSV from a different election year |

**`multiple_division_handling` override:** All federal and referendum configs use `USE_ELECTORAL_BOUNDARIES`, which requires `ElectoralBoundaries` rows in the DB. The `_run_dry()` helper pops this key before running, so all other federal features are tested without needing boundary fixture data. The `USE_ELECTORAL_BOUNDARIES` dedup path can be added later as a separate test with boundary fixtures.

**Geocoding override:** `_run_dry()` always forces `config["geocoding"]["enabled"] = False`. For state elections (already disabled) this is a no-op. For `federal_2025` (enabled in config) this prevents any API call.

---

### Data Integrity Tests (DB state — must stay GREEN throughout the entire refactor)

This is the second, separate test category. These tests assert that the **loader's actual behaviour** — what gets written to the database — has not changed. They are explicitly NOT golden-file tests. They use concrete assertions that should pass before refactoring, during refactoring, and after refactoring. If they go red, logic has broken, not just format.

**Critical constraint**: The refactor only changes the log transport. The surrounding `if/else` logic, the DB operations, the conditions that call `raise_exception_if_errors()`, and the polling place data written must all be byte-for-byte identical before and after.

```python
# tests/loader/test_data_integrity.py
import json
import pytest
from demsausage.app.sausage.loader import LoadPollingPlaces
from demsausage.app.exceptions import BadRequest
from demsausage.app.models import PollingPlaces
from demsausage.app.enums import PollingPlaceStatus


def _load_full(election, csv_path, config_path):
    """Run a full (non-dry-run) load. Returns the completed loader."""
    with open(config_path) as f:
        config = json.load(f)
    config.pop("multiple_division_handling", None)
    if "geocoding" in config:
        config["geocoding"]["enabled"] = False
    with open(csv_path, "rb") as f:
        loader = LoadPollingPlaces(election=election, file=f, dry_run=False, config=config)
        loader.run()
    return loader


@pytest.mark.django_db(transaction=True)
def test_sa_2025_dry_run_writes_nothing(test_election):
    """dry_run=True must leave zero polling places in the DB — the atomic rollback works."""
    with open("tests/fixtures/elections/sa_2025/config.json") as f:
        config = json.load(f)
    if "geocoding" in config:
        config["geocoding"]["enabled"] = False

    with open("tests/fixtures/elections/sa_2025/polling_places.csv", "rb") as f:
        loader = LoadPollingPlaces(election=test_election, file=f, dry_run=True, config=config)
        try:
            loader.run()
        except BadRequest:
            pass  # expected

    assert PollingPlaces.objects.filter(election=test_election).count() == 0


@pytest.mark.django_db(transaction=True)
def test_sa_2025_full_load_count(test_election):
    """Full load must produce the expected number of ACTIVE polling places."""
    _load_full(
        test_election,
        "tests/fixtures/elections/sa_2025/polling_places.csv",
        "tests/fixtures/elections/sa_2025/config.json",
    )
    active_count = PollingPlaces.objects.filter(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    ).count()
    # Determined by running once before refactoring and hardcoding:
    assert active_count == EXPECTED_SA_2025_COUNT  # fill in after first run


@pytest.mark.django_db(transaction=True)
def test_sa_2025_spot_check_polling_place(test_election):
    """Spot-check that a known polling place has the right name, address, and geom."""
    _load_full(
        test_election,
        "tests/fixtures/elections/sa_2025/polling_places.csv",
        "tests/fixtures/elections/sa_2025/config.json",
    )
    # Assert specific rows exist with correct field values — these survive any log format change
    pp = PollingPlaces.objects.get(election=test_election, name="...", premises="...")
    assert pp.address == "..."
    assert pp.status == PollingPlaceStatus.ACTIVE


@pytest.mark.django_db(transaction=True)
def test_detect_facility_type_runs(test_election):
    """detect_facility_type does not run under dry_run=True. This full-run test
    confirms the stage completes without raising.

    NOTE: detect_facility_type() fills facility types from historical polling places
    in OTHER elections. In a fresh test DB there is no historical data, so the update
    count will be 0 regardless of correctness. The only realistic assertion here is
    that no exception is raised and ACTIVE rows exist (i.e. the stage was actually
    reached). Actual proximity-based facility type detection is tested in test_detect_facility.py."""
    _load_full(
        test_election,
        "tests/fixtures/elections/sa_2025/polling_places.csv",
        "tests/fixtures/elections/sa_2025/config.json",
    )
    # Confirm the load completed (detect_facility_type was reached)
    assert PollingPlaces.objects.filter(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    ).count() > 0


@pytest.mark.django_db(transaction=True)
def test_calculate_chance_of_sausage_runs(test_election):
    """calculate_chance_of_sausage does not run under dry_run=True.
    This test confirms it completes without error after a full load."""
    _load_full(
        test_election,
        "tests/fixtures/elections/vic_2022/polling_places.csv",
        "tests/fixtures/elections/vic_2022/config.json",
    )
    # No assertion on count — chance_of_sausage requires historical stall data to be non-trivial.
    # Just confirming the stage ran without raising.
    assert PollingPlaces.objects.filter(election=test_election, status=PollingPlaceStatus.ACTIVE).count() > 0


@pytest.mark.django_db(transaction=True)
def test_pending_stalls_blocks_load(test_election):
    """can_loading_begin() returns False when pending stalls exist.
    run() must log an error and return without executing any stages.
    Verifies the abort path at the very top of run()."""
    from demsausage.app.models import Stalls
    from demsausage.app.enums import StallStatus

    # Create a pending stall for the election
    Stalls.objects.create(election=test_election, status=StallStatus.PENDING)

    with open("tests/fixtures/elections/sa_2025/config.json") as f:
        config = json.load(f)
    config["geocoding"]["enabled"] = False

    with open("tests/fixtures/elections/sa_2025/polling_places.csv", "rb") as f:
        loader = LoadPollingPlaces(election=test_election, file=f, dry_run=True, config=config)
        loader.run()

    # No polling places should have been written (the abort fired immediately)
    assert PollingPlaces.objects.filter(election=test_election).count() == 0
    # The loader's log should contain the can_loading_begin error
    assert loader.has_errors_messages()
```

**Migration path tests (Phase 1 — before refactor):**

The migration stages (`migrate_noms`, `migrate_mpps`, `migrate_unofficial_pending_stalls`) require pre-seeded noms, stalls, and MPPs to exercise any meaningful behaviour. These are the most complex structured entry types and need dedicated per-scenario tests. They are part of Phase 1 and are high priority:

- `test_migrate_noms_stall_match` — seed a user-added polling place with noms; run load; assert `stall_matched` entry in logs and noms repointed
- `test_migrate_noms_no_match` — seed a stall at a location with no nearby polling place; assert `stall_no_match` entry
- `test_migrate_unofficial_pending_stall_multi_match` — seed a stall equidistant from two polling places; assert `stall_multi_match` entry
- `test_migrate_mpps_not_found` — seed an MPP on a polling place removed in the new CSV; assert `mpp_not_found` entry with `detached_mpp: true`

**Bad-config fixture test (Phase 1):**

The `_config` synthetic stage only appears when `check_config_is_valid` finds errors. All 7 real-election fixture CSVs pass config validation, so the `_config` stage is never exercised by the data integrity tests. Add a dedicated unit test:

```python
# tests/loader/test_config_validation.py
@pytest.mark.django_db
def test_bad_config_produces_config_stage(test_election, tmp_path):
    """A deliberately invalid config must abort before any rows are processed.
    Phase 1 (pre-refactor): asserts that a BadRequest is raised with error-level
    log content and that no polling places were written.
    Phase 2 update: add assertion on structured _config stage with outcome='error'."""
    bad_config = {"address_format": "__not_a_valid_format__"}
    csv_content = b"polling_place_id,name\n1,Test\n"
    csv_path = tmp_path / "pp.csv"
    csv_path.write_bytes(csv_content)

    with open(csv_path, "rb") as f:
        loader = LoadPollingPlaces(election=test_election, file=f, dry_run=True, config=bad_config)
        try:
            loader.run()
            raise AssertionError("Expected BadRequest but loader returned normally")
        except BadRequest as e:
            # Pre-refactor: error raised with "Oh dear" message (not "Rollback")
            assert e.detail.get("message") != "Rollback", "Load should have aborted at config, not dry_run rollback"
            logs = e.detail.get("logs", {})

    # Config errors must surface in the error list
    assert len(logs.get("errors", [])) > 0
    # No polling places should have been written
    from demsausage.app.models import PollingPlaces
    assert PollingPlaces.objects.filter(election=test_election).count() == 0
```

The exact config key that triggers `check_config_is_valid` failure should be confirmed when writing the test. The invalid config above is illustrative — `address_format` without `address_fields` is known to trigger an error.

**Workflow for data integrity tests:**
1. Run before refactoring → all green → record expected counts
2. Run during refactoring after every significant change
3. Run after refactoring → must still be all green with zero changes
4. Any failure = logic broken, stop and investigate before continuing

---

### Phase 1 — Comprehensive Synthetic Test Suite

> **Critical scope note — log assertions in Phase 1:** Phase 1 tests are written against the **current (pre-refactor) loader**. The current loader emits flat strings, not structured dicts. Therefore:
> - **DB state assertions** (row counts, FK repointing, field values) can be written in Phase 1 and must remain green through Phase 2.
> - **Log content assertions** in Phase 1 must use the current API: `loader.has_errors_messages()` (True/False), or check strings in `e.detail["logs"]["errors"]` / `["warnings"]` / `["info"]` from the `BadRequest` payload. **Do not assert on structured `type`/`level`/`action` fields in Phase 1 — those fields don't exist yet.**
> - The structured entry types shown in the test tables below (e.g. `stall_matched`, `mpp_not_found`) document the **post-refactor target shape** for reference. They become the actual assertions once Phase 2 is complete and the synthetic tests are updated.
>
> The exception is `test_transforms.py` — those tests exclusively test new post-refactor helpers (`_log`, `_has_errors`, `STAGE_LABELS`) and **cannot be written until Phase 2**. See that section for details.

All Phase 1 tests use **synthetic CSV data** (inline `io.BytesIO` for single-scenario unit tests; small fixture files in `tests/fixtures/synthetic/` for full-pipeline integrated tests that need realistic multi-row inputs). All are integrated DB tests (`@pytest.mark.django_db`). `test_transforms.py` is the exception — it is Phase 2 only (no DB, no `@pytest.mark.django_db`) and is listed here for structural completeness.

A shared `make_csv(headers, rows)` helper in `conftest.py` returns `io.BytesIO` to eliminate boilerplate across all inline-CSV tests:

```python
import io, csv

def make_csv(headers: list[str], rows: list[list]) -> io.BytesIO:
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(headers)
    writer.writerows(rows)
    return io.BytesIO(buf.getvalue().encode())
```

---

#### `test_config_validation.py` — Config stage + config feature correctness

| Test | What it proves |
|---|---|
| `test_bad_config_produces_config_stage` | Deliberately invalid config → `_config` stage with `outcome="error"`, at least one error entry, no subsequent stages ran |
| `test_valid_config_no_config_stage` | Valid config → `_config` stage absent (or `outcome="ok"` with zero entries) |
| `test_address_fields_without_format_raises` | `address_fields` present but `address_format` absent → config error |
| `test_address_format_without_fields_raises` | `address_format` present but `address_fields` absent → config error |
| `test_unknown_config_key_raises` | Unrecognised top-level config key → config error |
| `test_valid_config_all_known_keys` | Config with every known key populated with valid values → no errors |

---

#### `test_convert.py` — `convert_to_demsausage_schema` + `fix_polling_places` + `prepare_polling_places` config features

One test per config feature. All use `dry_run=True` + `_run_dry()` style; assertions check structured log entries and/or DB state after a full pipeline run on minimal inline CSVs. These three stages are tested together because they share config options (`fix_data_issues`, `address_fields`/`address_format`) and a full-pipeline run is simpler than isolating individual stage calls.

| Test | Config feature exercised | Key assertion |
|---|---|---|
| `test_rename_columns` | `rename_columns` | Input column `"Polling_Place_Name"` → field `"name"` on every polling place |
| `test_add_columns_hardcoded` | `add_columns` (hardcoded value) | Every polling place has `state="SA"` injected |
| `test_exclude_columns` | `exclude_columns` | Excluded column is absent from written polling places |
| `test_address_format_two_fields` | `address_fields` + `address_format` (2 fields) | `address` field is `"{street}, {suburb}"` |
| `test_address_format_six_fields` | `address_fields` + `address_format` (6 fields, federal shape) | `address` field merges all 6 columns correctly |
| `test_address_format_ignores_empty_parts` | `address_format` with optional empty fields | Empty columns are dropped cleanly (trailing/leading commas stripped) from the merged address |
| `test_extras_included` | `extras` (non-empty field list) | Named extra columns appear in `extras` dict on polling place |
| `test_fix_data_issues_string_replace` | `fix_data_issues` (value substitution) | Short code `"F"` → `"Fully accessible"` on target field |
| `test_fix_data_issues_coordinate_override` | `fix_data_issues` (lat/lon override by `ec_id`) | Polling place with matching `ec_id` has overridden `lat`/`lon` |
| `test_cleaning_regexes` | `cleaning_regexes` | Regex substitution applied to target field on every row |
| `test_filters_is_exactly` | `filters` with `type="is_exactly"` and `matches=[...]` | Only rows where `filter["column"]` value is in `filter["matches"]` list survive; all others are excluded. Note: `is_exactly` is the only implemented filter type in the loader. |
| `test_division_fields_merge` | `division_fields` (multiple column → divisions list) | `divisions` field on each polling place is a deduplicated list of values from the named `division_fields` columns; original columns are removed from the polling place dict |

> **Note on `_filter()` filter types:** The loader only implements `type: "is_exactly"`. Any other `type` value is silently ignored — no rows are excluded. This is existing behaviour and is **not** changed by the refactor. The test uses the correct config shape: `{"type": "is_exactly", "column": "Status", "matches": ["Current"]}`.

---

#### `test_check_validity.py` — `check_polling_place_validity` (bbox + serialiser)

This stage runs after `prepare_polling_places()` and after `geocode_missing_locations()`. It validates each polling place using `PollingPlacesManagementSerializer` and checks whether the polling place falls within the election's geometry boundary. It is a separate stage from `check_file_validity()`.

> **Fixture note:** The standard `test_election` fixture uses a polygon covering all of Australia — no Australian coordinate can fall outside it. The bbox tests require a dedicated `small_election` fixture with a tight boundary (e.g. SA only, roughly `[[138.0, -36.0], [141.0, -36.0], [141.0, -32.0], [138.0, -32.0], [138.0, -36.0]]`) so that a Lord Howe Island-style coordinate (e.g. `159.0, -31.5`) falls outside the boundary. Use this `small_election` only for `test_check_validity.py`.

| Test | What it proves | Key assertion |
|---|---|---|
| `test_bbox_error_name_not_in_ignore` | Row outside election boundary with `bbox_validation` config set and name NOT in ignore list | `validation_error` log entry emitted as ERROR; stage `outcome="error"` |
| `test_bbox_warning_name_in_ignore_list` | Row outside election boundary with `bbox_validation` config set and name in `ignore` list | `validation_error` log entry emitted as WARNING (not error); stage `outcome="warning"` |
| `test_bbox_warning_no_bbox_config` | Row outside election boundary with no `bbox_validation` config at all | WARNING emitted; stage does not abort with error |
| `test_serialiser_validation_failure` | A polling place dict that fails `PollingPlacesManagementSerializer.is_valid()` (e.g. `name` missing) | `validation_error` entry with `reason` containing serialiser errors; stage `outcome="error"` |

---

#### `test_validate.py` — `check_file_validity` + `dedupe_polling_places`

| Test | What it proves | Key assertion |
|---|---|---|
| `test_missing_required_field` | Required column absent from CSV entirely | `validation_error` entry with `reason` referencing the missing field; stage `outcome="error"` |
| `test_duplicate_ec_id` | Two rows with the same non-blank `ec_id` | `ec_id_duplicate` entry with `ec_id`, `name`; stage `outcome="error"` |
| `test_blank_ec_id_warning` | Some rows have `ec_id`, some are blank | Warning emitted (not error); stage completes successfully |
| `test_spatial_dedup_merge` | Two rows at the same location with the same name/premises, divisions present | `dedup_merge` entry emitted as both `summary` and `info`; `count` and `stage_name` fields on the entry |
| `test_spatial_dedup_discard` | Two rows at the same location, no divisions configured | `dedup_discard` entry emitted as both `summary` and `info`; duplicate row removed |
| `test_spatial_proximity_warning` | Two rows within proximity threshold but above merge threshold | `spatial_proximity` entry with `stage_name` matching the stage that triggered it |
| `test_dedup_different_place_same_location` | Two DIFFERENT polling places (different name/premises) share the same lat/lon | ERROR entry emitted; stage `outcome="error"` — this is a data problem, not a normal dedup |
| `test_post_dedup_name_duplicate` | After spatial dedup, two rows still share the same name+premises+address key | ERROR entry emitted; stage `outcome="error"` |

---

#### `test_geocode.py` — `geocode_missing_locations`

| Test | What it proves | Key assertion |
|---|---|---|
| `test_geocode_disabled_produces_skipped_stage` | `geocoding.enabled=false` in config | `geocode_missing_locations` stage present with `outcome="skipped"`, zero entries, `total_entry_count=0`; geocoding summary absent |
| `test_geocode_enabled_all_coords_present` | `geocoding.enabled=true` but all rows have lat/lon | Stage runs, no geocode API called (mock), geocoding summary shows 0 geocoded |
| `test_geocode_skip_no_results` | Mock API returns empty results | `geocode_skip` entry with `reason="no_results"`, correct `name` and `address` fields |
| `test_geocode_skip_not_accurate_enough` | Mock API returns result below accuracy threshold | `geocode_skip` entry with `reason="not_accurate_enough"`, `name`, `address` |

The geocode API call must be mocked via `patch("demsausage.app.sausage.loader.geocode")` or equivalent. No external HTTP calls in tests.

---

#### `test_find_home_division.py` — `find_home_division`

> **How the loader actually works:** `_find_home_division()` has only **two real code paths**. If `multiple_division_handling["determine_home_division"] == "USE_ELECTORAL_BOUNDARIES"` it does a PostGIS intersection query against `ElectoralBoundaries`. For every other value (or if the key is absent entirely) it falls through to `return polling_places[0]["divisions"][0]` — the first-division fallback. There is no `USE_GEOCODED_COORDINATES` or `USE_FIRST_DIVISION` handling in the code.

The `electoral_boundaries` conftest fixture creates a real `ElectoralBoundaries` PostGIS geometry row covering a known test coordinate, enabling the `USE_ELECTORAL_BOUNDARIES` path.

```python
@pytest.fixture
def electoral_boundaries(db):
    """Create an ElectoralBoundaries row whose geometry contains the test coordinate
    (138.6, -34.9) used in the synthetic CSVs for USE_ELECTORAL_BOUNDARIES tests."""
    from demsausage.app.models import ElectoralBoundaries
    from django.contrib.gis.geos import GEOSGeometry
    geom = GEOSGeometry(
        '{"type":"MultiPolygon","coordinates":[[[[138.5,-35.0],[139.0,-35.0],[139.0,-34.8],[138.5,-34.8],[138.5,-35.0]]]]]}',
        srid=4326
    )
    return ElectoralBoundaries.objects.create(
        name="Test Division",
        short_name="test_division",
        geom=geom,
    )
```

| Test | `multiple_division_handling` value | Key assertion |
|---|---|---|
| `test_home_division_first_fallback` | Key absent (or any value other than `"USE_ELECTORAL_BOUNDARIES"`) | `home_division` is set to `polling_places[0]["divisions"][0]` — the first division value from the first row sharing that location |
| `test_home_division_electoral_boundaries` | `USE_ELECTORAL_BOUNDARIES` | `home_division` set to `"Test Division"` via PostGIS intersection with the boundary fixture; no `find_home_division_error` log entry emitted |
| `test_home_division_electoral_boundaries_no_match` | `USE_ELECTORAL_BOUNDARIES` with polling place outside the boundary fixture geom | ERROR log entry emitted: "Found no matching division"; `home_division` is null |
| `test_home_division_electoral_boundaries_multi_match` | `USE_ELECTORAL_BOUNDARIES` with polling place inside two overlapping boundary fixtures | ERROR log entry emitted: "Found more than one matching division"; `home_division` is null |
---

#### `test_write.py` — `write_draft`, `migrate`

> **Status lifecycle reminder:** `migrate()` does three things atomically: (1) ARCHIVED rows are DELETED, (2) ACTIVE rows become ARCHIVED, (3) DRAFT rows become ACTIVE. `cleanup()` only triggers GeoJSON regeneration — it does not touch polling place rows.

| Test | What it proves | Key assertion |
|---|---|---|
| `test_full_load_active_count` | `migrate` marks the correct rows ACTIVE | `PollingPlaces.objects.filter(status=ACTIVE).count()` == row count in CSV |
| `test_reload_archives_old_places` | On a reload, previously ACTIVE polling places become ARCHIVED | After a second load, the first load's polling places have `status=ARCHIVED`; new load's rows are ACTIVE |
| `test_no_draft_rows_after_migrate` | `migrate` promotes all DRAFT rows; none are left behind | Zero `PollingPlaces` with `status=DRAFT` after a full non-dry-run load |

---

#### `test_migrate_noms.py` — `migrate_noms` + `migrate_unofficial_pending_stalls`

All tests pre-seed rows using direct model creation (or `factory-boy` factories once defined). Each uses a full non-dry-run load against a synthetic CSV. **Phase 1 assertions are DB state** (FK repointing, counts, field values) and error *presence* checks via `has_errors_messages()`. Structured log entry type assertions (e.g. `stall_matched`, `noms_merge_review`) are Phase 2 updates once the new transport is in place.

| Test | Scenario | Seeded state | Key assertion |
|---|---|---|---|
| `test_stall_match` | User-added stall matches new polling place by proximity | `PollingPlaceStall` at coordinates matching a polling place in the new CSV | `stall_matched` log entry: `stall_id`, `name`, `address` fields correct; stall's `polling_place` FK repointed |
| `test_stall_no_match` | Stall is too far from any new polling place | `PollingPlaceStall` at coordinates with no nearby polling place | `stall_no_match` log entry: `stall_id`, `name`, `address` fields correct; `action` field present |
| `test_stall_multi_match` | Stall equidistant from two polling places | `PollingPlaceStall` at midpoint between two polling places in the new CSV | `stall_multi_match` log entry: `stall_id`, `candidates` list contains both polling place names |
| `test_noms_merge_review` | Existing noms conflict with new noms on a matched polling place | `PollingPlaceNoms` on a stall that gets matched | `noms_merge_review` log entry with `stall_id` and both `existing_noms` and `new_noms` fields |

---

#### `test_migrate_mpps.py` — `migrate_mpps`

| Test | Scenario | Seeded state | Key assertion |
|---|---|---|---|
| `test_mpp_not_found_detached` | MPP's polling place is absent from the new CSV | `MetaPollingPlace` linked to a polling place not in the new CSV | `mpp_not_found` entry: `name`, `address`, `detached_mpp=True`, `action` field present |
| `test_mpp_not_found_not_detached` | MPP's polling place exists but doesn't match | `MetaPollingPlace` linked to a polling place that moves in the new CSV beyond threshold | `mpp_not_found` entry: `detached_mpp=False`, `action` field absent |
| `test_mpp_successfully_migrated` | MPP's polling place matches cleanly in the new CSV | `MetaPollingPlace` linked to a stable polling place | No `mpp_not_found` entry; MPP's `polling_place` FK updated to the new ACTIVE row |
| `test_mpp_new_created_on_first_load` | First load — no pre-existing MPPs; all DRAFT polling places need new MPPs | No pre-existing `MetaPollingPlace` rows; `polling_places_loaded=False` on election | A new `MetaPollingPlace` + `MetaPollingPlacesTasks` row created for every polling place in the CSV; no draft polling places remain without an MPP in post-validation check |

> **Note on MPP creation:** The `migrate_mpps()` method has two loops. The first migrates existing active polling places (repointing or creating new MPPs for matched DRAFT rows). The second loop picks up any DRAFT polling places that still have no MPP after the first loop. On a first-ever load, all polling places fall into the second loop. `test_mpp_new_created_on_first_load` specifically exercises this second-loop path.

---

#### `test_migrate_stalls.py` — `migrate_unofficial_pending_stalls` + `migrate_declined_pending_stalls`

| Test | Scenario | Key assertion |
|---|---|---|
| `test_unofficial_pending_no_match` | Unofficial pending stall has no matching polling place in new CSV | Stall's `polling_place` FK remains null; `has_errors_messages()` is True (error logged) |
| `test_declined_stall_migration` | Declined stall associated with an ACTIVE polling place is repointed during load | Stall's `polling_place_id` updated to point to the new ACTIVE polling place; `status` on the stall is unchanged |

---

#### `test_detect_facility.py` — `detect_facility_type`

This stage does not run with `dry_run=True`; all tests use a full non-dry-run load. `detect_facility_type()` works by **spatial proximity to historical data from other elections**, not keyword matching. It queries `PollingPlaces` from other elections that already have a `facility_type` set and copies the most recent match within 200m. To exercise this, tests must pre-seed an older election's polling places with `facility_type` values.

| Test | Scenario | Seeded state | Key assertion |
|---|---|---|---|
| `test_proximity_match_sets_facility_type` | Polling place in new CSV is within 200m of a seeded historical polling place with a known `facility_type` | An ACTIVE `PollingPlace` from a different election at the same coordinates with `facility_type` set | After load, the matching polling place in the new election has `facility_type` matching the historical row |
| `test_no_nearby_historical_leaves_null` | Polling place in new CSV has no historical polling place within 200m | No seeded historical rows | `facility_type` is null on all loaded polling places |

---

#### `test_transforms.py` — Pure unit tests for new helpers (Phase 2 only)

> **These tests cannot be written until Phase 2.** `_log()`, `_has_errors()`, and `STAGE_LABELS` are new additions that don't exist in the current loader. Write this file immediately after those helpers are added, before touching any of the `self.logger.*` call sites. They serve as the unit-level spec for the new transport layer.

No `@pytest.mark.django_db`. Uses `object.__new__(LoadPollingPlaces)` to bypass `__init__` and set attributes directly.

| Test | What it proves |
|---|---|
| `test_log_appends_entry` | `_log("error", "text", message="x")` appends `{"level": "error", "type": "text", "message": "x"}` to `self.log_entries` |
| `test_has_errors_true` | `_has_errors()` returns `True` when any entry has `level="error"` |
| `test_has_errors_false_on_warnings_only` | `_has_errors()` returns `False` when entries are all warnings |
| `test_stage_labels_covers_all_stage_methods` | `STAGE_LABELS` has a key for every public stage method name in the loader (confirms no stage will display a raw method name in the UI) |

---

### Known Untested Paths (accepted gaps)

The following code paths in `loader.py` are not covered by any Phase 0 or Phase 1 test. Each is a minor or degenerate error-handling branch that is impractical to exercise in an automated test without significant additional setup:

| Path | Location | Why not tested |
|---|---|---|
| `migrate_noms()` post-validation check (ACTIVE PPs still have noms attached) | end of `migrate_noms()` | This invariant is only violated if the migration itself has a bug; it's a safeguard that would only fire in a broken state we can't easily synthesise without bypassing the transaction |
| `migrate_noms()` post-validation check (stalls still point to ACTIVE PPs) | end of `migrate_noms()` | Same – internal consistency check that fires only on a coding error |
| `migrate_mpps()` post-validation checks (ACTIVE PPs with MPP still attached; DRAFT PPs without MPP) | end of `migrate_mpps()` | Same – safeguards against internal bugs, not exercisable from the outside |
| `calculate_chance_of_sausage()` missing calculation error | `calculate_chance_of_sausage()` | Requires `calculate_chance_of_sausage_stats()` to return an incomplete dict; that function is external and would need to be mocked to produce the broken state |
| `_run_regexes()` regex with no `(?P<main>...)` named group | `_run_regexes()` | All real-election configs use correctly structured regexes; a test that deliberately provides a malformed regex is low value and the error message is clear |
| `chardet` encoding detection on non-UTF-8 file | `LoadPollingPlaces.__init__` | All real CSVs are UTF-8; encoding detection is a defensive wrapper around `pd.read_csv` — not directly testable without a specially crafted binary file |

---

### Refactoring Workflow (how the test categories are used together)

```
Phase 0 — Now (before any code changes):
  1. Add test dependencies to pyproject.toml
  2. Create conftest.py + fixture election directories
  3. Write data integrity tests (DB state)
  4. Run pytest — ALL tests green
  ✅ Regression baseline locked in for data behaviour

Phase 1 — Comprehensive synthetic test suite (before any code changes):
  5. Write all synthetic tests against the CURRENT loader behaviour
  6. Run pytest — ALL synthetic tests green
  ✅ Full loader behaviour specified and locked in before a single line changes

Phase 2 — Backend refactor (log transport + all log call sites):
  7. Make loader changes
  8. Run pytest after each significant change:
     - data_integrity tests: must stay GREEN — any failure means logic was accidentally broken
     - synthetic tests: must stay GREEN — any failure means logic was accidentally broken
  9. Once all log call sites are updated:
     Confirm: data_integrity and synthetic tests are still GREEN
  ✅ If both stayed green: refactor is safe

Phase 3 — Frontend (ongoing):
  10. Build the new admin UI; synthetic tests continue to serve as the living spec
```

**The two-test-category contract:**

| Category | Will change during Phase 2 refactor? | Action if it fails |
|---|---|---|
| `test_data_integrity.py` (DB state) | NO — must stay green the whole time | Stop. Logic was broken. Fix it before continuing. |
| Synthetic suite (`test_convert.py` etc.) | NO — must stay green the whole time | Stop. Logic was broken. Fix it before continuing. |

---

## Files Affected

| File | Change |
|---|---|
| `django/pyproject.toml` | Add `pytest`, `pytest-django`, `pytest-mock`, `factory-boy` to dev-dependencies |
| `django/demsausage/settings.py` | Add `TEST: {NAME: demsausage_test}` block to default DB config |
| `django/tests/__init__.py` | New (empty) |
| `django/tests/conftest.py` | New — mock job, test election, autouse patches |
| `django/tests/fixtures/elections/vic_2022/polling_places.csv` | Copied from `scrapers/vic_2022/` (latest timestamped CSV) |
| `django/tests/fixtures/elections/vic_2022/config.json` | Copied from `scrapers/vic_2022/config.json` |
| `django/tests/fixtures/elections/sa_2022/polling_places.csv` | Copied from `scrapers/sa_2022/` |
| `django/tests/fixtures/elections/sa_2022/config.json` | Copied from `scrapers/sa_2022/config.json` |
| `django/tests/fixtures/elections/sa_2025/polling_places.csv` | Copied from `scrapers/sa_2025/` |
| `django/tests/fixtures/elections/sa_2025/config.json` | Copied from `scrapers/sa_2025/config.json` |
| `django/tests/fixtures/elections/tas_2025/polling_places.csv` | Copied from `scrapers/tas_2025/` |
| `django/tests/fixtures/elections/tas_2025/config.json` | Copied from `scrapers/tas_2025/config.json` |
| `django/tests/fixtures/elections/nsw_lg_2024/polling_places.csv` | Copied from `scrapers/nsw_lg_2024/` |
| `django/tests/fixtures/elections/nsw_lg_2024/config.json` | Copied from `scrapers/nsw_lg_2024/config.json` |
| `django/tests/fixtures/elections/federal_2025/polling_places.csv` | Copied from `scrapers/federal_2025/` |
| `django/tests/fixtures/elections/federal_2025/config.json` | Copied from `scrapers/federal_2025/config.json` |
| `django/tests/fixtures/elections/federal_2022/polling_places.csv` | Copied from `scrapers/federal_2022/` |
| `django/tests/fixtures/elections/federal_2022/config.json` | Copied from `scrapers/federal_2022/config.json` |
| `django/tests/loader/test_data_integrity.py` | New — Phase 0: DB state assertions (must stay green throughout refactor) |
| `django/tests/fixtures/synthetic/multi_division_federal.csv` | New — Phase 1: synthetic CSV for USE_ELECTORAL_BOUNDARIES tests |
| `django/tests/fixtures/synthetic/stall_migration_base.csv` | New — Phase 1: synthetic CSV for migrate_noms seeded tests |
| `django/tests/loader/test_config_validation.py` | New — Phase 1: `_config` stage + config feature correctness (6 tests) |
| `django/tests/loader/test_convert.py` | New — Phase 1: convert_to_demsausage_schema, fix_polling_places, prepare_polling_places config features (12 tests) |
| `django/tests/loader/test_check_validity.py` | New — Phase 1: check_polling_place_validity bbox error/warning paths + serialiser validation (4 tests) |
| `django/tests/loader/test_validate.py` | New — Phase 1: check_file_validity + dedupe_polling_places (8 tests) |
| `django/tests/loader/test_geocode.py` | New — Phase 1: geocode_missing_locations (4 tests) |
| `django/tests/loader/test_find_home_division.py` | New — Phase 1: find_home_division — USE_ELECTORAL_BOUNDARIES (happy path, no-match, multi-match) + first-division fallback (4 tests) |
| `django/tests/loader/test_write.py` | New — Phase 1: write_draft, migrate, cleanup (3 tests) |
| `django/tests/loader/test_migrate_noms.py` | New — Phase 1: migrate_noms + stall migration (4 tests) |
| `django/tests/loader/test_migrate_mpps.py` | New — Phase 1: migrate_mpps (4 tests) |
| `django/tests/loader/test_migrate_stalls.py` | New — Phase 1: unofficial/declined stall migration (2 tests) |
| `django/tests/loader/test_detect_facility.py` | New — Phase 1: detect_facility_type (2 tests) |
| `django/tests/loader/test_transforms.py` | New — Phase 1: pure unit tests for _log, _has_errors, STAGE_LABELS (4 tests) |
| `django/demsausage/app/sausage/loader.py` | Full rewrite of logging mechanism and all log call sites |
| `django/demsausage/app/serializers.py` | Update `PollingPlaceLoaderEventsSerializer` for new payload shape |
| `django/demsausage/app/models.py` | Update `PollingPlaceLoaderEvents` model if payload field is typed |
| `admin-redesign/src/features/elections/ElectionLoadPollingPlaces.tsx` | Full UI redesign |
| `admin-redesign/src/app/services/elections.ts` | Update RTK Query types for new job response shape |
