-- Purpose: move five confirmed-but-unverified unofficial VIC 2026 stall
-- submissions into a holding pen so the initial official polling-place load
-- can proceed without losing submissions, organiser details, or audit history.
-- It backs up the affected rows, marks the submissions Declined and detached,
-- removes their temporary unofficial polling places/noms, and detaches old
-- historical links that would otherwise break the admin's latest-changes view.
-- A new decline history snapshot is attributed to admin user 1.
--
-- One-off, environment-specific operation: verify the IDs and admin user in the
-- target database. Test in DEV and rerun the loader dry run before production.
-- Keep the final ROLLBACK for testing; use COMMIT only when intentionally applying.
-- Run against the intended database with stop-on-error enabled.
-- Defaults to ROLLBACK; change only the final statement to COMMIT when ready.
-- Backup tables contain personal information: retain privately until resolved.
-- Decline history is inserted explicitly; no notifications are sent.
BEGIN;

SET
  LOCAL lock_timeout = '5s';

SET
  LOCAL statement_timeout = '30s';

-- Prevent concurrent approvals, loader writes, or changes to the backup source.
LOCK TABLE demsausage.app_stalls,
demsausage.app_pollingplaces,
demsausage.app_pollingplacenoms,
demsausage.app_historicalstalls IN SHARE ROW EXCLUSIVE MODE;

CREATE TEMP TABLE holding_pen_targets ON COMMIT DROP AS
SELECT
  *
FROM
  (
    VALUES
      (11991, 492114, 21501, 'St Thomas Avenue'),
      (12012, 492130, 21517, 'Balwyn Primary School'),
      (12023, 492142, 21529, '31 College Road'),
      (12042, 492163, 21550, 'Nungurner Primary School'),
      (
        12055,
        492175,
        21562,
        'Ringwood Heights Primary School'
      )
  ) AS targets(
    stall_id,
    polling_place_id,
    noms_id,
    polling_place_name
  );

DO $ $ BEGIN IF NOT EXISTS (
  SELECT
    1
  FROM
    demsausage.auth_user
  WHERE
    id = 1
    AND is_active = true
    AND is_staff = true
) THEN RAISE EXCEPTION 'Declining admin user 1 must exist and be active staff';

END IF;

IF (
  SELECT
    count(*)
  FROM
    holding_pen_targets t
    JOIN demsausage.app_stalls s ON s.id = t.stall_id
    AND s.polling_place_id = t.polling_place_id
    JOIN demsausage.app_pollingplaces p ON p.id = t.polling_place_id
    AND p.noms_id = t.noms_id
    JOIN demsausage.app_pollingplacenoms n ON n.id = t.noms_id
  WHERE
    s.election_id = 49
    AND p.election_id = 49
    AND s.status = 'Approved'
    AND p.status = 'Active'
    AND p.name = t.polling_place_name
    AND p.ec_id IS NULL
    AND p.meta_polling_place_id IS NULL
    AND n.deleted = false
    AND jsonb_typeof(s.location_info) = 'object'
    AND length(trim(s.location_info ->> 'address')) > 0
    AND jsonb_typeof(s.location_info -> 'geom') = 'object'
) <> 5 THEN RAISE EXCEPTION 'Targets differ from expected approved unofficial records; inspect before proceeding';

END IF;

IF EXISTS (
  SELECT
    1
  FROM
    demsausage.app_stalls s
    JOIN holding_pen_targets t ON s.polling_place_id = t.polling_place_id
  WHERE
    s.id <> t.stall_id
) THEN RAISE EXCEPTION 'Another submission is attached to a target polling place';

END IF;

IF EXISTS (
  SELECT
    1
  FROM
    demsausage.app_pollingplaces p
    JOIN holding_pen_targets t ON p.noms_id = t.noms_id
  WHERE
    p.id <> t.polling_place_id
) THEN RAISE EXCEPTION 'Another polling place references target noms';

END IF;

END;

$ $;

-- Existing backup tables deliberately cause failure rather than being overwritten.
CREATE TABLE demsausage.holding_pen_vic2026_20261105_stalls AS
SELECT
  s.*
FROM
  demsausage.app_stalls s
  JOIN holding_pen_targets t ON s.id = t.stall_id;

CREATE TABLE demsausage.holding_pen_vic2026_20261105_pollingplaces AS
SELECT
  p.*
FROM
  demsausage.app_pollingplaces p
  JOIN holding_pen_targets t ON p.id = t.polling_place_id;

CREATE TABLE demsausage.holding_pen_vic2026_20261105_noms AS
SELECT
  n.*
FROM
  demsausage.app_pollingplacenoms n
  JOIN holding_pen_targets t ON n.id = t.noms_id;

CREATE TABLE demsausage.holding_pen_vic2026_20261105_history AS
SELECT
  h.*
FROM
  demsausage.app_historicalstalls h
  JOIN holding_pen_targets t ON h.polling_place_id = t.polling_place_id;

REVOKE ALL ON demsausage.holding_pen_vic2026_20261105_stalls,
demsausage.holding_pen_vic2026_20261105_pollingplaces,
demsausage.holding_pen_vic2026_20261105_noms,
demsausage.holding_pen_vic2026_20261105_history
FROM
  PUBLIC;

UPDATE
  demsausage.app_stalls s
SET
  status = 'Declined',
  previous_status = s.status,
  polling_place_id = NULL,
  triaged_on = CURRENT_TIMESTAMP,
  triaged_by_id = 1
FROM
  holding_pen_targets t
WHERE
  s.id = t.stall_id;

UPDATE
  demsausage.app_historicalstalls h
SET
  polling_place_id = NULL
FROM
  holding_pen_targets t
WHERE
  h.polling_place_id = t.polling_place_id;

CREATE TEMP TABLE holding_pen_declines ON COMMIT DROP AS WITH inserted AS (
  INSERT INTO
    demsausage.app_historicalstalls (
      id,
      ip_address,
      old_id,
      name,
      description,
      website,
      noms,
      location_info,
      email,
      reported_timestamp,
      status,
      mail_confirmed,
      history_date,
      history_change_reason,
      history_type,
      election_id,
      history_user_id,
      polling_place_id,
      triaged_on,
      opening_hours,
      submitter_type,
      tipoff_source,
      tipoff_source_other,
      previous_status,
      triaged_by_id,
      owner_edit_timestamp
    )
  SELECT
    s.id,
    NULL,
    s.old_id,
    s.name,
    s.description,
    s.website,
    s.noms,
    s.location_info,
    s.email,
    s.reported_timestamp,
    s.status,
    s.mail_confirmed,
    CURRENT_TIMESTAMP,
    'Moved to holding pen pending organiser confirmation',
    '~',
    s.election_id,
    1,
    s.polling_place_id,
    s.triaged_on,
    s.opening_hours,
    s.submitter_type,
    s.tipoff_source,
    s.tipoff_source_other,
    s.previous_status,
    s.triaged_by_id,
    s.owner_edit_timestamp
  FROM
    demsausage.app_stalls s
    JOIN holding_pen_targets t ON s.id = t.stall_id RETURNING history_id
)
SELECT
  history_id
FROM
  inserted;

DELETE FROM
  demsausage.app_pollingplaces p USING holding_pen_targets t
WHERE
  p.id = t.polling_place_id;

DELETE FROM
  demsausage.app_pollingplacenoms n USING holding_pen_targets t
WHERE
  n.id = t.noms_id;

-- Django's foreign keys may be deferred until transaction end.
SET
  CONSTRAINTS ALL IMMEDIATE;

DO $ $ BEGIN IF (
  SELECT
    count(*)
  FROM
    demsausage.app_stalls s
    JOIN holding_pen_targets t ON s.id = t.stall_id
  WHERE
    s.status = 'Declined'
    AND s.previous_status = 'Approved'
    AND s.polling_place_id IS NULL
    AND s.triaged_by_id = 1
    AND s.triaged_on = CURRENT_TIMESTAMP
) <> 5 THEN RAISE EXCEPTION 'Expected five detached, declined submissions';

END IF;

IF EXISTS (
  SELECT
    1
  FROM
    demsausage.app_stalls s
    JOIN demsausage.holding_pen_vic2026_20261105_stalls b ON s.id = b.id
  WHERE
    (
      to_jsonb(s) - ARRAY ['status', 'previous_status', 'polling_place_id', 'triaged_on', 'triaged_by_id']
    ) IS DISTINCT
  FROM
    (
      to_jsonb(b) - ARRAY ['status', 'previous_status', 'polling_place_id', 'triaged_on', 'triaged_by_id']
    )
) THEN RAISE EXCEPTION 'Submission details changed unexpectedly';

END IF;

IF EXISTS (
  SELECT
    1
  FROM
    demsausage.app_historicalstalls h
    JOIN holding_pen_targets t ON h.polling_place_id = t.polling_place_id
) THEN RAISE EXCEPTION 'Historical submissions still reference target polling places';

END IF;

IF EXISTS (
  SELECT
    1
  FROM
    demsausage.holding_pen_vic2026_20261105_history b
    LEFT JOIN demsausage.app_historicalstalls h ON h.history_id = b.history_id
  WHERE
    h.history_id IS NULL
    OR h.polling_place_id IS NOT NULL
    OR (to_jsonb(h) - 'polling_place_id') IS DISTINCT
  FROM
    (to_jsonb(b) - 'polling_place_id')
) THEN RAISE EXCEPTION 'Historical details changed beyond detaching polling places';

END IF;

IF (
  SELECT
    count(DISTINCT h.id)
  FROM
    holding_pen_declines d
    JOIN demsausage.app_historicalstalls h ON h.history_id = d.history_id
    JOIN holding_pen_targets t ON h.id = t.stall_id
    JOIN demsausage.app_stalls s ON s.id = h.id
  WHERE
    h.history_type = '~'
    AND h.history_user_id = 1
    AND h.history_date = CURRENT_TIMESTAMP
    AND h.history_change_reason = 'Moved to holding pen pending organiser confirmation'
    AND h.ip_address IS NULL
    AND (
      to_jsonb(h) - ARRAY ['history_id', 'history_date', 'history_change_reason', 'history_type', 'history_user_id', 'ip_address']
    ) = to_jsonb(s)
) <> 5
OR (
  SELECT
    count(*)
  FROM
    holding_pen_declines
) <> 5 THEN RAISE EXCEPTION 'Expected five decline history snapshots matching the live submissions';

END IF;

IF EXISTS (
  SELECT
    1
  FROM
    demsausage.app_pollingplaces p
    JOIN holding_pen_targets t ON p.id = t.polling_place_id
)
OR EXISTS (
  SELECT
    1
  FROM
    demsausage.app_pollingplacenoms n
    JOIN holding_pen_targets t ON n.id = t.noms_id
) THEN RAISE EXCEPTION 'Target polling places or noms remain';

END IF;

END;

$ $;

SELECT
  s.id,
  s.name,
  s.status,
  s.previous_status,
  s.polling_place_id,
  s.triaged_on,
  s.triaged_by_id,
  s.location_info ->> 'name' AS location_name,
  s.location_info ->> 'address' AS location_address
FROM
  demsausage.app_stalls s
  JOIN holding_pen_targets t ON s.id = t.stall_id
ORDER BY
  s.id;

SELECT
  'stalls' AS backup,
  count(*)
FROM
  demsausage.holding_pen_vic2026_20261105_stalls
UNION
ALL
SELECT
  'polling places',
  count(*)
FROM
  demsausage.holding_pen_vic2026_20261105_pollingplaces
UNION
ALL
SELECT
  'noms',
  count(*)
FROM
  demsausage.holding_pen_vic2026_20261105_noms
UNION
ALL
SELECT
  'history',
  count(*)
FROM
  demsausage.holding_pen_vic2026_20261105_history;

SELECT
  h.id AS stall_id,
  h.history_id,
  h.history_type,
  h.history_date,
  h.history_user_id,
  h.history_change_reason
FROM
  demsausage.app_historicalstalls h
  JOIN holding_pen_declines d ON h.history_id = d.history_id
ORDER BY
  h.id;

-- The test rolls back backups too; COMMIT persists both backups and changes.
ROLLBACK;