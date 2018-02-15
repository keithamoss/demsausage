<?php
require_once "db.php";
require_once "modules/polling_places.php";

$electionPKeyFieldName = "id";
$electionAllowedFields = array("lon", "lat", "default_zoom_level", "name", "has_division_boundaries", "db_table_name", "is_active", "hidden", "election_day", "polling_places_loaded");

function translateElectionFromDB($row) {
  return [
    "id" => (int)$row["id"],
    "lon" => (float)$row["lon"],
    "lat" => (float)$row["lat"],
    "default_zoom_level" => (int)$row["default_zoom_level"],
    "name" => $row["name"],
    "has_division_boundaries" => (bool)$row["has_division_boundaries"],
    "db_table_name" => $row["db_table_name"],
    "is_active" => (bool)$row["is_active"],
    "hidden" => (bool)$row["hidden"],
    "election_day" => $row["election_day"],
    "polling_places_loaded" => (bool)$row["polling_places_loaded"],
  ];
}

function translateElectionToDB($row) {
  $new = [];
  foreach($row as $key => $val) {
    if(in_array($key, ["has_division_boundaries", "is_active", "hidden", "polling_places_loaded"])) {
      $new[$key] = ($val === "false") ? false : true;
    } elseif(in_array($key, ["lon", "lat"])) {
      $new[$key] = (float)$val;
    } elseif(in_array($key, ["id", "default_zoom_level"])) {
      $new[$key] = (int)$val;
    } else {
      $new[$key] = $val;
    }
  }
  return $new;
}

function fetchPublicElections() {
  global $file_db;

  $stmt = $file_db->query("SELECT * FROM elections WHERE hidden != 1 ORDER BY election_day DESC");
  $stalls = [];
  while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
      $stalls[] = translateElectionFromDB($row);
  }
  return $stalls;
}

function fetchAllElections() {
  global $file_db;

  $stmt = $file_db->query("SELECT * FROM elections ORDER BY election_day DESC");
  $stalls = [];
  while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
      $stalls[] = translateElectionFromDB($row);
  }
  return $stalls;
}

function fetchElection($id) {
  global $file_db;

  $stmt = $file_db->query("SELECT * FROM elections WHERE id = :id");
  $stmt->bindParam(":id", $id);
  $stmt->execute();
  $row = $stmt->fetch(\PDO::FETCH_ASSOC);
  return translateElectionFromDB($row);
}

function fetchElectionByName($electionTableName) {
  global $file_db;

  $stmt = $file_db->query("SELECT * FROM elections WHERE db_table_name = :db_table_name");
  $stmt->bindParam(":db_table_name", $electionTableName);
  $stmt->execute();
  $row = $stmt->fetch(\PDO::FETCH_ASSOC);
  return translateElectionFromDB($row);
}

function createElection(array $params) {
  global $file_db, $electionAllowedFields;

  $insert = fieldsToInsertSQL("elections", $electionAllowedFields, array_keys($params), $params);
  $stmt = $file_db->prepare($insert);
  $lastInsertId = fieldsToStmntLastInsertId($stmt, $electionAllowedFields, translateElectionToDB($params));
  $election = fetchElection($lastInsertId);

  if($newElection !== false) {
    $electionTableName = createElectionTableName($election);
    if(($msg = createPollingPlaceTable($electionTableName)) !== true) {
      failForAPI("Failed to create empty polling place table because: $msg");
    }

    // Update the new election with the pointer to its new table
    updateElection($election["id"], ["db_table_name" => $electionTableName]);

    // Generate the polling place GeoJSON
    regeneratePollingPlaceGeoJSON($election["id"]);
  }

  return $election;
}

function updateElection($id, array $params) {
  global $file_db, $electionPKeyFieldName, $electionAllowedFields;

  $election = translateElectionToDB($params);
  
  return updateTable($id, $election, "elections", $electionPKeyFieldName, $electionAllowedFields);
}

function isElectionDBTableValid($dbTableName) {
  global $file_db;

  $stmt = $file_db->prepare("SELECT COUNT(*) FROM elections WHERE db_table_name = :db_table_name");
  $stmt->bindParam(":db_table_name", $dbTableName);
  $stmt->execute();
  return $stmt->fetchColumn() === "1";
}
?>