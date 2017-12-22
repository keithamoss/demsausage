<?php
// Create (connect to) SQLite database in file
$file_db = new PDO('sqlite:demsausage.sqlite3');
$file_db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Tables
$electionPKeyFieldName = "id";
$electionAllowedFields = array("lon", "lat", "default_zoom_level", "name", "has_division_boundaries", "db_table_name", "is_active", "hidden");

$pendingStallsPKeyFieldName = "id";
$pendingStallsAllowedFields = array("stall_name", "stall_description", "stall_website", "contact_email", "has_bbq", "has_caek", "has_vego", "has_halal", "polling_place_id", "polling_place_premises", "elections_id", "active");

$pollingPlacesPKeyFieldName = "id";
$pollingPlacesAllowedFields = array("the_geom", "stall_description", "lon", "has_run_out", "has_nothing", "has_caek", "has_bbq", "noofdecissuingoff", "noordissuingoff", "decvoteest", "ordvoteest", "ccd", "ppid", "latest_report", "first_report", "stall_website", "lat", "stall_name", "extra_info", "source", "has_other", "wheelchairaccess", "entrancesdesc", "polling_place_type", "booth_info", "opening_hours", "premises", "address", "polling_place_name", "division", "state", "ess_stall_id", "ess_stall_url");


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
    "hidden" => (bool)$row["hidden"]
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

function translateStallFromDB($row) {
  return [
    "id" => (int)$row["id"],
    "stall_description" => $row["stall_description"],
    "stall_name" => $row["stall_name"],
    "stall_website" => $row["stall_website"],
    "contact_email" => $row["contact_email"],
    "has_bbq" => (bool)$row["has_bbq"],
    "has_caek" => (bool)$row["has_caek"],
    "has_vego" => (bool)$row["has_vego"],
    "has_halal" => (bool)$row["has_halal"],
    "polling_place_id" => (int)$row["polling_place_id"],
    "polling_place_premises" => $row["polling_place_premises"],
    "elections_id" => (int)$row["elections_id"],
    "active" => (bool)$row["active"]
  ];
}

function translatePollingPlaceFromDB($row) {
  return [
    "id" => (int)$row["id"],
    "lon" => (float)$row["lon"],
    "lat" => (float)$row["lat"],
    "has_bbq" => (bool)$row["has_bbq"],
    "has_caek" => (bool)$row["has_caek"],
    "has_nothing" => (bool)$row["has_nothing"],
    "has_run_out" => (bool)$row["has_run_out"],
    "has_other" => ($row["has_other"] !== "") ? json_decode($row["has_other"]) : new stdClass(),
    "stall_name" => $row["stall_name"],
    "stall_description" => $row["stall_description"],
    "stall_website" => $row["stall_website"],
    "latest_report" => $row["latest_report"],
    "first_report" => $row["first_report"],
    "polling_place_name" => $row["polling_place_name"],
    "polling_place_type" => $row["polling_place_type"],
    "extra_info" => $row["extra_info"],
    "booth_info" => $row["booth_info"],
    "wheelchairaccess" => $row["wheelchairaccess"],
    "opening_hours" => $row["opening_hours"],
    "premises" => $row["premises"],
    "address" => $row["address"],
    "division" => $row["division"],
    "state" => $row["state"],
    "source" => $row["source"],
    "ess_stall_id" => (int)$row["ess_stall_id"],
    "ess_stall_url" => $row["ess_stall_url"]
  ];
}

function translatePollingPlaceToDB($row) {
  $new = [];
  foreach($row as $key => $val) {
    if(in_array($key, ["has_bbq", "has_caek", "has_nothing", "has_run_out"])) {
      $new[$key] = ($val === "false") ? false : true;
    } elseif(in_array($key, ["has_other"])) {
      $new[$key] = (gettype($val) === "string") ? $val : json_encode($val);
    } elseif(in_array($key, ["lon", "lat"])) {
      $new[$key] = (float)$val;
    } elseif(in_array($key, ["id", "ess_stall_id"])) {
      $new[$key] = (int)$val;
    } else {
      $new[$key] = $val;
    }
  }
  return $new;
}


function failForAPI($msg = "") {
  http_response_code(500);
  if($msg !== "") {
    echo json_encode(["error" => $msg]);
  }
  closeDb();
}

function failForAuthReasons($msg = "You do not have access to this resource.") {
  http_response_code(403);
  echo json_encode(["error" => $msg]);
  closeDb();
}

function closeDb() {
  global $file_db;

  $file_db = null;
  exit();
}

function fieldsToInsertSQL(string $tableName, array $allowedFields, array $fields) {
  $fields = array_intersect($fields, $allowedFields);
  $fieldNames = implode(", ", $fields);
  $fieldValues = implode(", ", array_map(function ($a) { return ":" . $a; }, $fields));
  return "INSERT INTO $tableName ($fieldNames) VALUES ($fieldValues)";
}

function fieldsToUpdateSQL(string $tableName, array $allowedFields, array $params, string $pkeyFieldName) {
  $fields = array_intersect(array_keys($params), $allowedFields);
  $fieldNames = implode(", ", $fields);
  $fieldNamesAndValues = implode(", ", array_map(function ($fieldName) use($params) {
    if(in_array($fieldName, ["first_report", "latest_report"])) {
      return $fieldName . " = " . $params[$fieldName];
    } else {
      return $fieldName . " = :" . $fieldName;
    }
  }, $fields));
  return "UPDATE $tableName SET $fieldNamesAndValues WHERE $pkeyFieldName = :$pkeyFieldName";
}

function fieldsToDeleteSQL(string $tableName, $pkeyFieldName) {
  return "DELETE FROM $tableName WHERE $pkeyFieldName = :$pkeyFieldName";
}

function fieldsToStmnt($stmt, array $allowedFields, array $params) {
  $fields = array_intersect(array_keys($params), $allowedFields);
  foreach($fields as $field) {
    if(in_array($field, ["first_report", "latest_report"]) === false) {
      $stmt->bindParam(":" . $field, $params[$field]);
    }
  }

  if(count($fields) > 0) {
    $stmt->execute();
    return $stmt->rowCount();
  }
  return false;
}

function fieldsToStmntLastInsertId($stmt, array $allowedFields, array $params) {
  global $file_db;

  $rowCount = fieldsToStmnt($stmt, $allowedFields, $params);
  if($rowCount === 1) {
    $stmt2 = $file_db->prepare("SELECT LAST_INSERT_ROWID()");
    $stmt2->execute();
    return $stmt2->fetchColumn();
  }
  return false;
}

function updateTable($id, array $params, string $table_name, string $pkeyFieldName, array $allowedFields) {
  global $file_db;

  $update = fieldsToUpdateSQL($table_name, $allowedFields, $params, $pkeyFieldName);
  $stmt = $file_db->prepare($update);
  $stmt->bindParam(":" . $pkeyFieldName, $id);
  
  return fieldsToStmnt($stmt, $allowedFields, $params);
}

function addPendingStall(array $params) {
  global $file_db, $pendingStallsAllowedFields;

  $insert = fieldsToInsertSQL("pending_stalls", $pendingStallsAllowedFields, array_keys($params));
  $stmt = $file_db->prepare($insert);
  
  return fieldsToStmnt($stmt, $pendingStallsAllowedFields, $params);
}

function markPendingStallAsRead($id) {
  global $file_db, $pendingStallsPKeyFieldName, $pendingStallsAllowedFields;
  
  return updateTable($id, ["active" => 0], "pending_stalls", $pendingStallsPKeyFieldName, $pendingStallsAllowedFields);
}

// function deletePendingStall($id) {
//   global $file_db, $pendingStallsPKeyFieldName;

//   $delete = fieldsToDeleteSQL("pending_stalls", $pendingStallsPKeyFieldName);
//   $stmt = $file_db->prepare($delete);
//   $stmt->bindParam(":" . $pendingStallsPKeyFieldName, $id);
//   $stmt->execute();

//   return $stmt->rowCount();
// }

function fetchPendingStalls() {
  global $file_db;

  $stmt = $file_db->query("SELECT * FROM pending_stalls WHERE active = 1");
  $stalls = [];
  while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
      $stalls[] = translateStallFromDB($row);
  }
  return $stalls;
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

function createElection(array $params) {
  global $file_db, $electionAllowedFields;

  $insert = fieldsToInsertSQL("elections", $electionAllowedFields, array_keys($params));
  $stmt = $file_db->prepare($insert);
  $lastInsertId = fieldsToStmntLastInsertId($stmt, $electionAllowedFields, $params);
  
  $stmt = $file_db->query("SELECT * FROM elections WHERE id = :id");
  $stmt->bindParam(":id", $lastInsertId);
  $stmt->execute();
  $row = $stmt->fetch(\PDO::FETCH_ASSOC);
  return translateElectionFromDB($row);
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

function updatePollingPlace($id, array $params, string $electionTableName) {
  global $file_db, $pollingPlacesPKeyFieldName, $pollingPlacesAllowedFields;
  
  if(isElectionDBTableValid($electionTableName) === false) {
    failForAPI();
  }

  $pollingPlace = translatePollingPlaceToDB($params);
  
  return updateTable($id, $pollingPlace, $electionTableName, $pollingPlacesPKeyFieldName, $pollingPlacesAllowedFields);
}

function searchPollingPlaces($searchTerm, string $electionTableName) {
  global $file_db;

  if(isElectionDBTableValid($electionTableName) === false) {
    failForAPI();
  }

  $stmt = $file_db->prepare("SELECT * FROM $electionTableName WHERE premises LIKE LOWER(:searchTerm) OR polling_place_name LIKE LOWER(:searchTerm) OR address LIKE LOWER(:searchTerm)");
  $stmt->bindParam(":searchTerm", strtolower("%" . $searchTerm . "%"));
  $stmt->execute();

  $pollingPlaces = [];
  while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
      $pollingPlaces[] = translatePollingPlaceFromDB($row);
  }
  return $pollingPlaces;
}

function fetchPollingPlaces($ids, string $electionTableName) {
  global $file_db;
  
  if(isElectionDBTableValid($electionTableName) === false) {
    failForAPI();
  }

  $stmt = $file_db->prepare("SELECT * FROM $electionTableName WHERE id IN (:ids)");
  $stmt->bindParam(":ids", implode(", ", $ids));
  $stmt->execute();
  
  $pollingPlaces = [];
  while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
      $pollingPlaces[] = translatePollingPlaceFromDB($row);
  }
  return $pollingPlaces;
}
?>