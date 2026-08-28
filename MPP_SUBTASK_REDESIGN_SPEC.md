# MPP Task — Sub-Task Redesign Spec & Implementation Plan

## Overview

This document captures the full specification and backend implementation plan for a reimagined Meta Polling Place (MPP) Task UI/UX, centred around a **sub-task model** — a checklist of discrete, independent pieces of work that a reviewer must work through for a given MPP task.

This replaces the current monolithic "one task → one complete button" model with a structured, resumable, per-activity approach.

---

## Goals

- A single, consistent UI for all task types — the difference between task types is *which sub-tasks are present and whether they are mandatory*.
- Sub-tasks are clearly titled, have a short description, and show their completion state (who did it, when).
- The full lifetime history of an MPP — task completions, sub-task completions, field changes — is visible in one unified place.
- The model is cleanly extensible: adding a new task type or sub-task type requires only a code change (and a deployment), not a DB schema change.
- All 12,000+ existing IN_PROGRESS `REVIEW_DRAFT` tasks must be migrated forward without data loss.

---

## Decisions Log

| Question | Decision |
|---|---|
| Sub-task definition storage | Code-only (Python enum + config dict) — no DB table for definitions |
| Sub-task definition location | Hanging off `MetaPollingPlaceSubTaskType` enum via a `.get_definition()` method backed by a config dict in a new `subtask_config.py` module |
| Sub-task completion trigger | Explicit "Mark done" button per sub-task |
| Sub-task persistence | Real-time PATCH per sub-task (crash-safe, no deferred save) |
| After all mandatory sub-tasks done | Auto-complete the parent task; show a summary card with explicit "Next task" button |
| History scope | Both task-scoped and MPP-scoped, in a single unified chronological feed |
| Re-review model | Append-only: insert a new `PENDING` sub-task row; current state = most recent row per `(task, type)` |
| Re-review routing | If an `IN_PROGRESS` task already exists for the MPP: append a new `PENDING` sub-task row to it. Otherwise: create a new parent `MetaPollingPlacesTasks` row with its own `job_name` (enters the re-review queue). |
| Re-review UI | Only flagged (PENDING) sub-tasks rendered open; already-completed ones rendered collapsed |
| Optional sub-tasks | User can leave them without dismissing — no skip/dismiss action required |
| Defer / Close | Retained at the parent task level; completed sub-task rows are left as-is (task is partially resumable) |
| Existing 12k tasks | Data migration: auto-generate sub-task rows for each existing IN_PROGRESS task |
| `category` field on `MetaPollingPlacesTasks` | Retained on the parent task (backlog item: could be derived from `type` and removed later) |

---

## Sub-Task Definitions (REVIEW_DRAFT)

| Key | Title | Mandatory | Notes |
|---|---|---|---|
| `REVIEW_DETAILS` | Review Details | Yes | Name, premises, facility type, wheelchair access |
| `REVIEW_LOCATION` | Review Location | Yes | Map pin / geom |
| `REVIEW_LINKED_PPS` | Review Linked Polling Places | Yes | Linked polling places + nearby MPPs |
| `ADD_LINKS` | Add Links | No | Website, official, and other URLs |
| `REVIEW_ADDRESS` | Review Address | No | Deferred — optional until address population work is complete |

## Sub-Task Definitions (CROWDSOURCE_FROM_FACEBOOK)

| Key | Title | Mandatory |
|---|---|---|
| `ADD_FACEBOOK_LINK` | Find & Add Facebook Page | Yes |

---

## Data Model

### New model: `MetaPollingPlaceSubTasks`

```python
class MetaPollingPlaceSubTasks(models.Model):
    """A single unit of work within a MetaPollingPlacesTasks parent task."""

    # Relationships
    task = models.ForeignKey(
        MetaPollingPlacesTasks,
        on_delete=models.CASCADE,
        related_name="sub_tasks",
    )
    meta_polling_place = models.ForeignKey(
        MetaPollingPlaces,
        on_delete=models.PROTECT,
    )

    # What kind of sub-task this is
    type = models.TextField(
        choices=[(tag, tag.value) for tag in MetaPollingPlaceSubTaskType],
        blank=False,
    )

    # State
    status = models.TextField(
        choices=[(tag, tag.value) for tag in MetaPollingPlaceSubTaskStatus],
        default=MetaPollingPlaceSubTaskStatus.PENDING,
        blank=False,
    )

    # Timestamps and attribution
    created_on = models.DateTimeField(auto_now_add=True)
    completed_on = models.DateTimeField(blank=True, null=True)
    completed_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )

    history = HistoricalRecords()
    tracker = FieldTracker()
```

**Notes:**
- `meta_polling_place` is intentionally denormalised (duplicated from the parent task). This allows efficient direct queries like "all sub-task history for this MPP" without joining through `MetaPollingPlacesTasks`.
- There is **no unique constraint** on `(task, type)` — multiple rows with the same `(task, type)` is the correct append-only re-review model. Current state = the most recent row for a given `(task, type)` pair ordered by `created_on`.
- `django-simple-history` is applied to this model for field-level change tracking within a row (consistent with all other MPP models).

### Modified model: `MetaPollingPlacesRemarks`

Add a nullable FK to the sub-task:

```python
sub_task = models.ForeignKey(
    MetaPollingPlaceSubTasks,
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
)
```

Existing rows are unaffected (the new FK is nullable).

### Unchanged models

`MetaPollingPlacesTasks`, `MetaPollingPlaces`, `MetaPollingPlacesLinks`, `MetaPollingPlacesContacts` — no schema changes.

---

## New Enums

In `enums.py`:

```python
class MetaPollingPlaceSubTaskType(str, EnumBase):
    REVIEW_DETAILS = "Review Details"
    REVIEW_LOCATION = "Review Location"
    REVIEW_LINKED_PPS = "Review Linked Polling Places"
    ADD_LINKS = "Add Links"
    REVIEW_ADDRESS = "Review Address"
    ADD_FACEBOOK_LINK = "Add Facebook Link"

    def get_definition(self) -> "SubTaskDefinition":
        """Return the standalone SubTaskDefinition for this sub-task type."""
        from demsausage.app.subtask_config import SUBTASK_DEFINITIONS
        return SUBTASK_DEFINITIONS.get(self)


class MetaPollingPlaceSubTaskStatus(str, EnumBase):
    PENDING = "Pending"
    COMPLETED = "Completed"
```

---

## Sub-Task Config Module

New file: `django/demsausage/app/subtask_config.py`

```python
from dataclasses import dataclass
from demsausage.app.enums import MetaPollingPlaceSubTaskType, MetaPollingPlaceTaskType, MetaPollingPlaceTaskCategory


@dataclass(frozen=True)
class SubTaskDefinition:
    """Standalone definition of a sub-task type — reusable across task types."""
    type: MetaPollingPlaceSubTaskType
    title: str
    description: str


@dataclass(frozen=True)
class TaskSubTaskConfig:
    """Composition of a sub-task into a specific task type, with its mandatory flag."""
    type: MetaPollingPlaceSubTaskType
    mandatory: bool

    @property
    def definition(self) -> SubTaskDefinition:
        return SUBTASK_DEFINITIONS[self.type]


# Global registry: one definition per sub-task type.
# Title and description are defined once here and reused across any task type that includes this sub-task.
SUBTASK_DEFINITIONS: dict[MetaPollingPlaceSubTaskType, SubTaskDefinition] = {
    MetaPollingPlaceSubTaskType.REVIEW_DETAILS: SubTaskDefinition(
        type=MetaPollingPlaceSubTaskType.REVIEW_DETAILS,
        title="Review Details",
        description="Check and correct the name, premises, facility type, and wheelchair access information.",
    ),
    MetaPollingPlaceSubTaskType.REVIEW_LOCATION: SubTaskDefinition(
        type=MetaPollingPlaceSubTaskType.REVIEW_LOCATION,
        title="Review Location",
        description="Verify the map pin is correctly placed for this polling place.",
    ),
    MetaPollingPlaceSubTaskType.REVIEW_LINKED_PPS: SubTaskDefinition(
        type=MetaPollingPlaceSubTaskType.REVIEW_LINKED_PPS,
        title="Review Linked Polling Places",
        description="Check that the polling places linked to this MPP are correct, and review any other nearby MPPs for potential matches or conflicts.",
    ),
    MetaPollingPlaceSubTaskType.ADD_LINKS: SubTaskDefinition(
        type=MetaPollingPlaceSubTaskType.ADD_LINKS,
        title="Add Links",
        description="Add any known website, official, or other relevant URLs for this location.",
    ),
    MetaPollingPlaceSubTaskType.REVIEW_ADDRESS: SubTaskDefinition(
        type=MetaPollingPlaceSubTaskType.REVIEW_ADDRESS,
        title="Review Address",
        description="Check and correct the street address details.",
    ),
    MetaPollingPlaceSubTaskType.ADD_FACEBOOK_LINK: SubTaskDefinition(
        type=MetaPollingPlaceSubTaskType.ADD_FACEBOOK_LINK,
        title="Find & Add Facebook Page",
        description="Search for and add the Facebook page URL for this polling place location.",
    ),
}


# Maps (category, task_type) → ordered list of TaskSubTaskConfigs.
# Each entry references a standalone SubTaskDefinition and adds the task-specific mandatory flag.
# Key uses both category and type: today they map 1:1, but the combined key
# future-proofs against task types being reused across categories.
TASK_TYPE_SUBTASKS: dict[tuple[str, str], list[TaskSubTaskConfig]] = {
    (MetaPollingPlaceTaskCategory.REVIEW, MetaPollingPlaceTaskType.REVIEW_DRAFT): [
        TaskSubTaskConfig(type=MetaPollingPlaceSubTaskType.REVIEW_DETAILS, mandatory=True),
        TaskSubTaskConfig(type=MetaPollingPlaceSubTaskType.REVIEW_LOCATION, mandatory=True),
        TaskSubTaskConfig(type=MetaPollingPlaceSubTaskType.REVIEW_LINKED_PPS, mandatory=True),
        TaskSubTaskConfig(type=MetaPollingPlaceSubTaskType.ADD_LINKS, mandatory=False),
        TaskSubTaskConfig(type=MetaPollingPlaceSubTaskType.REVIEW_ADDRESS, mandatory=False),
    ],
    (MetaPollingPlaceTaskCategory.CROWDSOURCING, MetaPollingPlaceTaskType.CROWDSOURCE_FROM_FACEBOOK): [
        TaskSubTaskConfig(type=MetaPollingPlaceSubTaskType.ADD_FACEBOOK_LINK, mandatory=True),
    ],
}


def get_subtask_configs(category: str, task_type: str) -> list[TaskSubTaskConfig]:
    """Return the ordered list of TaskSubTaskConfigs for a given task category + type."""
    return TASK_TYPE_SUBTASKS.get((category, task_type), [])


def create_sub_tasks_for_task(task) -> None:
    """
    Create the appropriate MetaPollingPlaceSubTasks rows for a given parent task.

    Safe to call at task creation time (loader, create_job, rearrange_from_mpp_review).
    Does NOT deduplicate — callers should ensure this is only called once per task.
    """
    from demsausage.app.models import MetaPollingPlaceSubTasks

    configs = get_subtask_configs(task.category, task.type)

    for config in configs:
        sub_task = MetaPollingPlaceSubTasks(
            task=task,
            meta_polling_place=task.meta_polling_place,
            type=config.type,
        )
        sub_task.full_clean()
        sub_task.save(force_insert=True)
```

---

## Auto-Complete Hook

When all **mandatory** sub-tasks for a parent task are `COMPLETED`, the parent task is automatically completed and (for `REVIEW_DRAFT`) the MPP is promoted from `DRAFT → ACTIVE`.

This logic lives in a `post_save` signal on `MetaPollingPlaceSubTasks` (wrapped in `@transaction.atomic` to match the existing `complete` endpoint's atomicity guarantee):

```python
@receiver(post_save, sender=MetaPollingPlaceSubTasks)
def check_task_auto_complete(sender, instance, **kwargs):
    if instance.status != MetaPollingPlaceSubTaskStatus.COMPLETED:
        return

    task = instance.task
    if task.status != MetaPollingPlaceTaskStatus.IN_PROGRESS:
        return

    configs = get_subtask_configs(task.category, task.type)
    mandatory_types = {c.type for c in configs if c.mandatory}

    if not mandatory_types:
        return

    # For each mandatory type, check if its most recent sub-task row is COMPLETED
    completed_mandatory = set()
    for sub_type in mandatory_types:
        latest = (
            MetaPollingPlaceSubTasks.objects.filter(task=task, type=sub_type)
            .order_by("-created_on")
            .first()
        )
        if latest and latest.status == MetaPollingPlaceSubTaskStatus.COMPLETED:
            completed_mandatory.add(sub_type)

    if completed_mandatory >= mandatory_types:
        _complete_task(task)


def _complete_task(task):
    with transaction.atomic():
        task.status = MetaPollingPlaceTaskStatus.COMPLETED
        task.outcome = MetaPollingPlaceTaskOutcome.COMPLETED
        task.actioned_on = datetime.now(pytz.utc)
        task.save()

        if task.type == MetaPollingPlaceTaskType.REVIEW_DRAFT:
            mpp = task.meta_polling_place
            if mpp.status == MetaPollingPlaceStatus.DRAFT:
                mpp.status = MetaPollingPlaceStatus.ACTIVE
                mpp.save()
```

The existing `POST .../complete/` endpoint on `MetaPollingPlacesTasksViewSet` is retained as a compatibility path (useful when a task type has no mandatory sub-tasks, or for direct API access).

---

## Unified History Feed

The `MetaPollingPlacesTasksSerializer` gains a `history` field that returns a single chronological feed merging three sources:

| Source | Event types |
|---|---|
| `MetaPollingPlaceSubTasks.history` | Sub-task completed, sub-task re-review created |
| `MetaPollingPlaces.history` | MPP field changes (name edited, location moved, etc.) |
| `MetaPollingPlacesTasks.history` | Task created, task completed, task deferred, task closed |

Each event in the feed has a common shape:

```json
{
  "event_type": "subtask_completed",
  "timestamp": "...",
  "user": "Alice",
  "detail": "Review Details marked done"
}
```

**Complete `event_type` enumeration:**

| `event_type` | Source model | Trigger |
|---|---|---|
| `task_created` | `MetaPollingPlacesTasks.history` | Task row first created |
| `task_started` | `MetaPollingPlacesTasks.history` | `status` transitions to `IN_PROGRESS` |
| `task_completed` | `MetaPollingPlacesTasks.history` | `status` transitions to `COMPLETED` |
| `task_deferred` | `MetaPollingPlacesTasks.history` | `outcome` set to `DEFERRED` |
| `task_closed` | `MetaPollingPlacesTasks.history` | `outcome` set to `CLOSED` |
| `subtask_created` | `MetaPollingPlaceSubTasks.history` | Sub-task row first created |
| `subtask_completed` | `MetaPollingPlaceSubTasks.history` | `status` transitions to `COMPLETED` |
| `subtask_rereview_flagged` | `MetaPollingPlaceSubTasks.history` | New `PENDING` sub-task row appended for a type that was previously `COMPLETED` |
| `mpp_field_changed` | `MetaPollingPlaces.history` | Any tracked field on the MPP changes (name, geom, status, facility type, wheelchair access, etc.) |

`detail` is a human-readable string generated per event type (e.g. `"Review Details marked done"`, `"Name changed: Old Name → New Name"`). `user` is `null` for system-generated events (e.g. auto-complete).

Events are sorted descending by `timestamp`. The serialiser merges and sorts in Python (not at the DB level) since the three sources use `django-simple-history`'s `HistoricalRecords` and are not easily unioned in a single query.

---

## API Changes

### New endpoint: `MetaPollingPlaceSubTasksViewSet`

Registered at `meta_polling_places/sub_tasks/`.

| Action | Method | URL | Description |
|---|---|---|---|
| `complete` | POST | `/{id}/complete/` | Mark a sub-task as completed. Sets `status=COMPLETED`, `completed_on`, `completed_by`. Triggers auto-complete signal. |
| `re_review` | POST | `/{id}/re_review/` | If the parent task is `IN_PROGRESS`: append a new `PENDING` sub-task row for each type in `sub_task_types` on the existing task. If no `IN_PROGRESS` task exists for the MPP: create a new parent `MetaPollingPlacesTasks` row with `status=PENDING` and the caller-supplied `job_name`, then append the sub-task rows to it. Does not modify any existing rows. |

**Request body:** `{ "job_name": "...", "sub_task_types": ["Review Details", ...] }`. `job_name` is required when a new parent task must be created (ignored if an `IN_PROGRESS` task already exists). `sub_task_types` is always required and must be a non-empty list of valid `MetaPollingPlaceSubTaskType` values.

No `list` or `destroy` actions are exposed — sub-tasks are always fetched as a nested list on the parent task serialiser.

### Modified: `MetaPollingPlacesTasksSerializer`

Add:
- `sub_tasks` — nested list of sub-task rows, grouped by type, most-recent-row-per-type only, ordered per the config definition order.
- `sub_task_definitions` — the code config for the task's type: title, description, mandatory flag for each type. Allows the frontend to render the full checklist including not-yet-started sub-tasks.
- `history` — unified chronological feed (see above). Replaces the existing task-history-only `history` field.

### Unchanged endpoints

- `POST .../complete/` — retained (compatibility + no-mandatory-subtasks path)
- `POST .../defer/` — unchanged
- `POST .../close/` — unchanged
- `GET .../next/` — unchanged
- `GET .../list/` — unchanged
- `POST .../create_job/` — unchanged except `create_sub_tasks_for_task()` is called after task creation
- `POST rearrange_from_mpp_review/` — unchanged except `create_sub_tasks_for_task()` is called after split task creation

---

## Data Migration

A single Django **data migration** (not a schema migration) iterates all `IN_PROGRESS` `MetaPollingPlacesTasks` rows and creates the appropriate sub-task rows.

```python
def migrate_existing_tasks(apps, schema_editor):
    MetaPollingPlacesTasks = apps.get_model("app", "MetaPollingPlacesTasks")
    MetaPollingPlaceSubTasks = apps.get_model("app", "MetaPollingPlaceSubTasks")

    for task in MetaPollingPlacesTasks.objects.filter(status="In Progress"):
        configs = get_subtask_configs(task.category, task.type)

        for config in configs:
            MetaPollingPlaceSubTasks.objects.create(
                task=task,
                meta_polling_place=task.meta_polling_place,
                type=config.type.value,
                status="Pending",
            )
```

**Properties of this migration:**
- Idempotent if re-run on an already-migrated DB (no sub-tasks exist yet for these tasks, since before this migration there is no sub-task table).
- Reversible: the reverse migration is simply `MetaPollingPlaceSubTasks.objects.all().delete()`.
- Low risk: it only creates new rows in a new table, touching no existing data.
- Fast: 12,000 tasks × ~3–5 sub-tasks each ≈ 40,000–60,000 inserts. Can be done with `bulk_create()`.

---

## Implementation Sequence

Tasks are ordered to minimise time where the codebase is in a partially-broken state. Schema first, then business logic, then migration, then API, then tests.

### Phase 1 — Schema & Enums

1. Add `MetaPollingPlaceSubTaskType` and `MetaPollingPlaceSubTaskStatus` to `enums.py`
2. Add `MetaPollingPlaceSubTasks` model to `models.py`
3. Add nullable `sub_task` FK to `MetaPollingPlacesRemarks`
4. Generate and apply schema migration

### Phase 2 — Config module

5. Create `subtask_config.py` with `SubTaskDefinition`, `TASK_TYPE_SUBTASKS`, `get_subtask_definitions()`, and `create_sub_tasks_for_task()`
6. Add `.get_definition()` method to `MetaPollingPlaceSubTaskType` enum

### Phase 3 — Business logic

7. Add auto-complete signal in `signals.py`
8. Update `loader.py` to call `create_sub_tasks_for_task()` after task creation
9. Update `rearrange_from_mpp_review` to call `create_sub_tasks_for_task()` after split task creation
10. Update `create_job` action to call `create_sub_tasks_for_task()` after task creation

### Phase 4 — Data migration

11. Write and apply data migration for existing 12k tasks

### Phase 5 — Serialisers & API

12. Add `MetaPollingPlaceSubTasksSerializer`
13. Add `MetaPollingPlaceSubTasksViewSet` with `complete` and `re_review` actions
14. Update `MetaPollingPlacesTasksSerializer` with `sub_tasks`, `sub_task_definitions`, and unified `history` fields
15. Register new viewset in `urls.py`

### Phase 6 — Tests

16. `tests/mpp/test_subtask_complete.py` — completing sub-tasks, auto-promotion of parent, DRAFT→ACTIVE
17. `tests/mpp/test_subtask_rereview.py` — append-only re-review, current-state query, separate queue
18. `tests/mpp/test_subtask_data_migration.py` — data migration creates correct rows for each task type
19. Update `tests/mpp/test_mpp_complete.py` — existing tests must still pass; add sub-task-driven completion cases
20. Update `tests/mpp/conftest.py` — new fixtures for sub-task rows

---

## What Does Not Change

- `MetaPollingPlacesTasks` schema — no column changes, no data loss
- `job_name`-based queue model — unchanged
- `next` and `list` endpoints — unchanged
- `defer` and `close` endpoints — unchanged
- `create_job` logic (Facebook research) — unchanged except sub-task creation hook added
- `rearrange_from_mpp_review` logic — unchanged except sub-task creation hook added
- All MPP field models (`MetaPollingPlacesLinks`, `MetaPollingPlacesContacts`, etc.) — unchanged
- `HistoricalRecords` on all existing models — unchanged (sub-tasks get their own)

---

## Open Questions / Backlog

| Item | Notes |
|---|---|
| Drop `category` from `MetaPollingPlacesTasks` | Currently maps 1:1 from `type`. Could be derived in code and the DB field removed. Low priority — no immediate value, and it's currently used in `create_job` filtering. |
| Address sub-task (REVIEW_ADDRESS) | Defined as optional for now. Once the address population work is complete, it can be promoted to mandatory by changing a single line in `subtask_config.py` and running a data migration to set existing REVIEW_DRAFT sub-tasks to PENDING. |
| `QA_PP_MISMATCH` task type sub-tasks | Not defined yet. Will need its own entry in `TASK_TYPE_SUBTASKS` when that task type is brought into the new model. |
| Per-sub-task remark attachment | `MetaPollingPlacesRemarks` now has a nullable FK to sub-tasks. The UI will need to decide whether remarks are attached at sub-task granularity or still at the task level (or both). |
| Sub-task ordering | The order in `TASK_TYPE_SUBTASKS` defines the render order in the UI. Currently arbitrary — may want to defer this decision to the frontend config once UI is built. |
