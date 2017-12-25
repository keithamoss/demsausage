<?php
// SELECT ST_X(the_geom) AS lon, ST_Y(the_geom) AS lat, * FROM federal_2016_polling_places_v1_1
require_once "db.php";

# Use Write Ahead Logging (WAL) mode to allow simultaneous read/write on tables
# http://stackoverflow.com/a/22708807
# https://sqlite.org/wal.html
$file_db->exec('PRAGMA journal_mode=wal');

function ingestPendingStalls() {
  global $file_db;

  $file_db->exec(<<<EOT
    CREATE TABLE `pending_stalls_tmp` (
      `id` INTEGER PRIMARY KEY AUTOINCREMENT,
      `stall_description`	TEXT,
      `stall_name`	TEXT,
      `stall_website`	TEXT,
      `contact_email`	TEXT,
      `has_bbq`	INTEGER,
      `has_caek`	INTEGER,
      `has_vego`	INTEGER,
      `has_halal`	INTEGER,
      `polling_place_id`	INTEGER,
      `polling_place_premises`	TEXT,
      `elections_id`	INTEGER,
      `active` INTEGER
    )
EOT
  );

  $file_db->exec(<<<EOT
    INSERT INTO pending_stalls_tmp(stall_description, stall_name, stall_website, contact_email, has_bbq, has_caek, has_vego, has_halal, polling_place_id, polling_place_premises, elections_id) 
      SELECT stall_description, stall_name, stall_website, contact_email, has_bbq, has_caek, has_vego, has_halal, polling_place_cartodb_id, polling_place_premises, elections_cartodb_id 
      FROM pending_stalls
EOT
  );

  $file_db->exec("DROP TABLE pending_stalls");
  $file_db->exec("ALTER TABLE pending_stalls_tmp RENAME TO pending_stalls");

  $file_db->exec("UPDATE pending_stalls SET has_bbq = 1 WHERE has_bbq = 'true'");
  $file_db->exec("UPDATE pending_stalls SET has_bbq = 0 WHERE has_bbq = 'false'");
  $file_db->exec("UPDATE pending_stalls SET has_caek = 1 WHERE has_caek = 'true'");
  $file_db->exec("UPDATE pending_stalls SET has_caek = 0 WHERE has_caek = 'false'");
  $file_db->exec("UPDATE pending_stalls SET has_vego = 1 WHERE has_vego = 'true'");
  $file_db->exec("UPDATE pending_stalls SET has_vego = 0 WHERE has_vego = 'false'");
  $file_db->exec("UPDATE pending_stalls SET has_halal = 1 WHERE has_halal = 'true'");
  $file_db->exec("UPDATE pending_stalls SET has_halal = 0 WHERE has_halal = 'false'");
}

function ingestPollingPlaces($electionName) {
  global $file_db;

  $file_db->exec(<<<EOT
    CREATE TABLE `{$electionName}_tmp` (
      `id` INTEGER PRIMARY KEY AUTOINCREMENT,
      `lon`	NUMERIC,
      `lat`	NUMERIC,
      `has_bbq`	INTEGER,
      `has_caek`	INTEGER,
      `has_nothing`	INTEGER,
      `has_run_out`	INTEGER,
      `has_other`	TEXT,
      `stall_name`	TEXT,
      `stall_description`	TEXT,
      `stall_website`	TEXT,
      `latest_report`	TIMESTAMP,
      `first_report`	TIMESTAMP,
      `polling_place_name`	TEXT,
      `polling_place_type`	TEXT,
      `extra_info`	TEXT,
      `booth_info`	TEXT,
      `wheelchairaccess`	TEXT,
      `opening_hours`	TEXT,
      `premises`	TEXT,
      `address`	TEXT,
      `division`	TEXT,
      `state`	TEXT,
      `source`	TEXT,
      `ess_stall_id`	INTEGER,
      `ess_stall_url`	TEXT
    )
EOT
  );

  $wheelchairaccess = '""';
  if(in_array($electionName, ["federal_2016_polling_places_v1_1"])) {
    $wheelchairaccess = "wheelchairaccess";
  }

  $file_db->exec(<<<EOT
    INSERT INTO {$electionName}_tmp(lon, lat, has_bbq, has_caek, has_nothing, has_run_out, has_other, stall_name, stall_description, stall_website, latest_report, first_report, polling_place_name, polling_place_type, extra_info, booth_info, wheelchairaccess, opening_hours, premises, address, division, state, source, ess_stall_id, ess_stall_url) 
      SELECT lon, lat, has_bbq, has_caek, has_nothing, has_run_out, has_other, stall_name, stall_description, stall_website, latest_report, first_report, polling_place_name, polling_place_type, extra_info, booth_info, $wheelchairaccess, opening_hours, premises, address, division, state, source, ess_stall_id, ess_stall_url 
      FROM $electionName
EOT
  );

  $file_db->exec("UPDATE {$electionName}_tmp SET has_bbq = 1 WHERE has_bbq = 'true'");
  $file_db->exec("UPDATE {$electionName}_tmp SET has_bbq = 0 WHERE has_bbq = 'false'");
  $file_db->exec("UPDATE {$electionName}_tmp SET has_caek = 1 WHERE has_caek = 'true'");
  $file_db->exec("UPDATE {$electionName}_tmp SET has_caek = 0 WHERE has_caek = 'false'");
  $file_db->exec("UPDATE {$electionName}_tmp SET has_nothing = 1 WHERE has_nothing = 'true'");
  $file_db->exec("UPDATE {$electionName}_tmp SET has_nothing = 0 WHERE has_nothing = 'false'");
  $file_db->exec("UPDATE {$electionName}_tmp SET has_run_out = 1 WHERE has_run_out = 'true'");
  $file_db->exec("UPDATE {$electionName}_tmp SET has_run_out = 0 WHERE has_run_out = 'false'");

  $file_db->exec("DROP TABLE $electionName");
  $file_db->exec("ALTER TABLE {$electionName}_tmp RENAME TO $electionName");
}

function ingestElections() {
  global $file_db;

  $file_db->exec(<<<EOT
    CREATE TABLE `elections_tmp` (
      `id` INTEGER PRIMARY KEY AUTOINCREMENT,
      `lon`	NUMERIC,
      `lat`	NUMERIC,
      `default_zoom_level`	NUMERIC,
      `name`	TEXT,
      `has_division_boundaries`	INTEGER,
      `db_table_name`	TEXT,
      `is_active`	INTEGER,
      `hidden`	INTEGER
    )
EOT
  );

  $file_db->exec(<<<EOT
    INSERT INTO elections_tmp(lon, lat, default_zoom_level, name, has_division_boundaries, db_table_name, is_active, hidden) 
      SELECT lon, lat, default_zoom_level, name, has_division_boundaries, db_table_name, is_active, hidden
      FROM elections
EOT
  );

  $file_db->exec("UPDATE elections_tmp SET has_division_boundaries = 1 WHERE has_division_boundaries = 'true'");
  $file_db->exec("UPDATE elections_tmp SET has_division_boundaries = 0 WHERE has_division_boundaries = 'false'");
  $file_db->exec("UPDATE elections_tmp SET is_active = 1 WHERE is_active = 'true'");
  $file_db->exec("UPDATE elections_tmp SET is_active = 0 WHERE is_active = 'false'");
  $file_db->exec("UPDATE elections_tmp SET hidden = 1 WHERE hidden = 'true'");
  $file_db->exec("UPDATE elections_tmp SET hidden = 0 WHERE hidden = 'false'");

  $file_db->exec("DROP TABLE elections");
  $file_db->exec("ALTER TABLE elections_tmp RENAME TO elections");
}

function addEntranceDesc() {
  global $file_db;

  $elections = [];

  foreach($elections as $electionName) {
    $file_db->exec(<<<EOT
      CREATE TABLE `{$electionName}_tmp` (
        `id` INTEGER PRIMARY KEY AUTOINCREMENT,
        `lon`	NUMERIC,
        `lat`	NUMERIC,
        `has_bbq`	INTEGER,
        `has_caek`	INTEGER,
        `has_nothing`	INTEGER,
        `has_run_out`	INTEGER,
        `has_other`	TEXT,
        `chance_of_sausage` NUMERIC,
        `stall_name`	TEXT,
        `stall_description`	TEXT,
        `stall_website`	TEXT,
        `latest_report`	TIMESTAMP,
        `first_report`	TIMESTAMP,
        `polling_place_name`	TEXT,
        `polling_place_type`	TEXT,
        `extra_info`	TEXT,
        `booth_info`	TEXT,
        `wheelchairaccess`	TEXT,
        `entrancesdesc`	TEXT,
        `opening_hours`	TEXT,
        `premises`	TEXT,
        `address`	TEXT,
        `division`	TEXT,
        `state`	TEXT,
        `source`	TEXT,
        `ess_stall_id`	INTEGER,
        `ess_stall_url`	TEXT
      )
EOT
    );

    $file_db->exec(<<<EOT
      INSERT INTO {$electionName}_tmp(lon, lat, has_bbq, has_caek, has_nothing, has_run_out, has_other, chance_of_sausage, stall_name, stall_description, stall_website, latest_report, first_report, polling_place_name, polling_place_type, extra_info, booth_info, wheelchairaccess, entrancesdesc, opening_hours, premises, address, division, state, source, ess_stall_id, ess_stall_url) 
        SELECT lon, lat, has_bbq, has_caek, has_nothing, has_run_out, has_other, chance_of_sausage, stall_name, stall_description, stall_website, latest_report, first_report, polling_place_name, polling_place_type, extra_info, booth_info, wheelchairaccess, entrancesdesc, opening_hours, premises, address, division, state, source, ess_stall_id, ess_stall_url 
        FROM $electionName
EOT
    );

    $file_db->exec("DROP TABLE $electionName");
    $file_db->exec("ALTER TABLE {$electionName}_tmp RENAME TO $electionName");
  }
}

// ingestPendingStalls()
// ingestPollingPlaces("qld_2017_polling_places");
// ingestElections();
// addEntranceDesc();

// Close file db connection
$file_db = null;
?>