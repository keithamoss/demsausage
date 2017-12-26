<?php
$electionPKeyFieldName = "id";
$electionAllowedFields = array("lon", "lat", "default_zoom_level", "name", "has_division_boundaries", "db_table_name", "is_active", "hidden", "election_day");

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
  ];
}

function translateElectionToDB($row) {
  $new = [];
  foreach($row as $key => $val) {
    if(in_array($key, ["has_division_boundaries", "is_active", "hidden"])) {
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

function fetchElections() {
  global $file_db;

  $stmt = $file_db->query("SELECT * FROM elections ORDER BY id DESC");
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

function createElection(array $params) {
  global $file_db, $electionAllowedFields;

  $insert = fieldsToInsertSQL("elections", $electionAllowedFields, array_keys($params));
  $stmt = $file_db->prepare($insert);
  $lastInsertId = fieldsToStmntLastInsertId($stmt, $electionAllowedFields, $params);

  return fetchElection($lastInsertId);
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