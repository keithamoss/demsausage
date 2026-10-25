# Unofficial Stalls: Admin Review UI (the "hacky" version)

October 2026, ahead of the Victorian 2026 election.

## Why

The public site lets people submit stalls for **unofficial** locations, picked with a Mapbox search, before the electoral commission publishes official polling places. These are stalls with `location_info` set and no `polling_place`. When the pending-stall admin UI was redesigned, review of these submissions was deliberately left out. This change adds a simple, separate admin page to approve them, without touching the polished Pending Submissions UI. The proper long-term version will tie into meta polling places.

## How it works

### Before official polling places are loaded
1. Submissions appear on **Pending Unofficial** (`/pending_unofficial/`) in the admin app. They're grouped by election and sorted by geohash, so nearby submissions sit together.
2. **Approve** (`POST stalls/<id>/approve_and_add/`):
   - creates a `PollingPlaceNoms` from the stall's noms, name, description, opening hours and website, with change reason `APPROVED_UNOFFICIAL`;
   - creates an `ACTIVE` `PollingPlaces` row: `name = location_info.name`, blank premises, wheelchair access `UNKNOWN`, no facility type;
   - links the stall, marks it approved and sends the normal "Stall approved!" email.
3. **Decline** uses the existing `stalls/<id>/decline/` endpoint.
4. If the submitter edits an approved stall, it goes back to pending. It's now attached to the unofficial polling place, so it appears in the **regular** Pending Submissions UI and is approved through the normal merge screen.

### When official polling places are loaded
- **Pending** unofficial stalls are matched to an official polling place within 200m (`migrate_unofficial_pending_stalls`). They stay pending and show up in Pending Submissions.
- **Approved** unofficial polling places have their noms and stalls moved to the official polling place within 100m by `migrate_noms`, the same as on any reload. Use `overwrite_distance_thresholds` (matched by name) when one sits just outside 100m.
- **Declined** unofficial stalls are left alone. If a submitter later edits one, it reappears on Pending Unofficial. Approving is then disabled, and the admin uses **Match** (`POST stalls/<id>/match_to_polling_place/`) to link it to one of the nearest official polling places (up to 5 within 1km). It then goes to Pending Submissions.

## Decisions worth remembering

- **The submitted `state` is untrusted.** Mapbox often gives a suburb name instead. It's only shown as a warning on the card. The polling place's state comes from the election's jurisdiction.
- **Federal elections are blocked** from unofficial approval, because there's no reliable state to use. Meta polling places will fix this later.
- **Duplicates:**
  - In the UI, there's a red "Possible duplicate!" alert when an approved polling place is within 100m. It includes an "Edit polling place" link, and Approve becomes "Approve anyway" with a confirmation.
  - There's a softer warning for other *pending* submissions within 100m.
  - In the loader, if two polling places with noms match the same new polling place, `migrate_noms` logs an error and the load stops, instead of silently dropping one set of noms. Fix it by hand or with distance overrides.
- **Change reason** `APPROVED_UNOFFICIAL` ("Approved and added as an unofficial polling place") is counted as an approval in election stats and is skipped in the polling place history timeline, the same as the other approval reasons.

## What changed

**Django**
- **New file `app/views/stall_unofficial_views.py`:**
  - the list endpoint, with nearby polling places, nearby pending submissions, a state-match flag, the previously-declined diff, and who triaged it;
  - `ApproveUnofficialStallView` and `MatchUnofficialStallView`, both with row locks;
  - `get_pending_unofficial_stalls_queryset()`, limited to active elections.
- **`stall_views.py`:**
  - `decline` takes a row lock and returns the friendly 418 when the stall was already triaged;
  - "Latest changes" skips history rows with no polling place, i.e. declined unofficial stalls;
  - `stalls/pending/` now returns an `unofficial_pending_count` for each election.
- **`mailgun.py`:**
  - all stall emails use `location_info` when the stall has no polling place;
  - the "edited" emails only include the stall permalink when the stall is actually visible on the map (new `{STALL_PROMOTION}` placeholder in the two edited templates).
- **`loader.py`:**
  - duplicate-target check in `migrate_noms`;
  - `is_reload` is now worked out from `election.polling_places_loaded`;
  - official premises and stall names added to the load report entries;
  - fixed the rollback calling `.save()` on a boolean.
- **Tests:** two new tests in `tests/loader/test_migrate_noms.py`, covering duplicates on a first load and on an official reload.

**Admin (`admin-redesign`)**
- **New Pending Unofficial page:**
  - noms shown as icons;
  - details in a label/value grid;
  - possible-duplicate, nearby-pending, state, federal and previously-declined alerts;
  - Match buttons once official polling places are loaded;
  - refreshes itself every 5 seconds in production (30 in dev).
- **Pending Submissions:**
  - an "Unofficial submissions" card in each election with a Review button;
  - unofficial submissions count as pending, so they hide the "all caught up" owl and add the 🚨 to the tab title.
- **Load report:** shows the official premises and the stall name.

**Public site (`public-redesign`)**
- **Edit form:** only strips `location_info` when the election has official polling places. Before, editing a pre-load stall returned a 400.
- **Add-stall URLs:** the location's name, address and state are now URL-encoded, so addresses like "43/55 Market St" no longer break the route.

## Logged for later

These came up along the way, but none of them are part of this change.

1. **The regular `approve()` has no row lock.** In `StallsViewSet.approve()` (`stall_views.py`), two admins approving the same stall at the same moment can both pass the "is it still pending?" check.
   - Fix: inside the atomic block, re-load the stall with `Stalls.objects.select_for_update().get(pk=self.get_object().pk)`, as `decline` and `ApproveUnofficialStallView` now do.
2. **Stale admin type.** `eNomsHistoryChangeReason` (`admin-redesign/src/features/pollingPlaces/pollingPlacesInterfaces.ts`) lists values the backend never sends, such as `'Approved stall'`.
   - Fix: mirror the backend `PollingPlaceNomsChangeReason` values (added, edited or deleted directly; approved automatically, by hand or as unofficial; unknown), and type the field as `| null`.
   - It's type-only: nothing references its members.
3. **"Deleted directly" shows as unknown.** The polling place history timeline (`pollingplace_views.py`) has no branch for "Deleted directly", so soft deletes appear as "Noms UNKNOWN_HISTORY_EVENT".
   - Fix: add `PollingPlaceHistoryEventType.DELETED_DIRECTLY` (backend and the admin TypeScript enum), a timeline branch, and a `Delete` icon case in `getPollingPlaceHistoryEventIcon()`.
   - Optionally, rename the misspelled enum member `DELETD_DIRECTLY`. The stored value doesn't change.
4. **Decline errors show as raw JSON on the merge screen.** The decline handler in `PendingStallsPollingPlace.tsx` shows any error as raw JSON. Handle the 418 "already triaged" response the way approve does: show the message and go back to the list.
5. **RQ jobs stuck after a worker restart.** If the worker is restarted mid-job, the job is left in `StartedJobRegistry`.
   - Any enqueue that checks "is this job already running?" (`is_job_started` → `registry.get_job_ids()` → `cleanup()`) then runs RQ's failure callback inside a Django request thread. Its SIGALRM timeout fails there with a 500 ("signal only works in main thread").
   - Separately, `report_job_result` in `rq_utils.py` crashes on interrupted jobs because `job.ended_at` is `None` (`make_aware(None)`).
   - Workaround: run `StartedJobRegistry(name=..., connection=r).remove(job_id, delete_job=True)` from a `manage.py shell`. Avoid restarting the worker while a job is running.

## Accepted risks

- **An unmatched unofficial polling place stops the load.** If one has no official polling place within 100m, the load fails. Fix it in the database or with `overwrite_distance_thresholds`.
- **Malformed coordinates break the list.** If one stall's `location_info` has malformed coordinates (e.g. only one number), the geohash sort fails and the whole unofficial list errors.
- **Poor state detection.** State detection from Mapbox still falls back to the suburb. It's left for the planned upgrade to the newer Mapbox geocoding API.
- **Unofficial page mobile ideas not done:** full-width action buttons, bigger Match buttons, a spinner on just the card being actioned, edge-to-edge cards, map thumbnails, election filter chips, and a count in the page title.
