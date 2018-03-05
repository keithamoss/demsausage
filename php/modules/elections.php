<?php
require_once "db.php";
require_once "modules/polling_places.php";

$electionPKeyFieldName = "id";
$electionAllowedFields = array("lon", "lat", "default_zoom_level", "name", "short_name", "has_division_boundaries", "db_table_name", "is_active", "hidden", "election_day", "polling_places_loaded", "is_primary");

function translateElectionFromDB($row) {
  // Assume that polls close at 8PM
  $endOfElectionDay = new DateTime($row["election_day"]); // 00:00 on election day
  $endOfElectionDay->add(new DateInterval("PT20H"));

  return [
    "id" => (int)$row["id"],
    "lon" => (float)$row["lon"],
    "lat" => (float)$row["lat"],
    "default_zoom_level" => (int)$row["default_zoom_level"],
    "name" => $row["name"],
    "short_name" => $row["short_name"],
    "has_division_boundaries" => (bool)$row["has_division_boundaries"],
    "db_table_name" => $row["db_table_name"],
    "is_active" => ((bool)$row["is_active"] === true && new DateTime() <= $endOfElectionDay),
    "hidden" => (bool)$row["hidden"],
    "election_day" => $row["election_day"],
    "polling_places_loaded" => (bool)$row["polling_places_loaded"],
    "is_primary" => (bool)$row["is_primary"],
  ];
}

function translateElectionToDB($row) {
  $new = [];
  foreach($row as $key => $val) {
    if(in_array($key, ["has_division_boundaries", "is_active", "hidden", "polling_places_loaded", "is_primary"])) {
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

  $stmt = $file_db->query("SELECT * FROM elections WHERE hidden != 1 OR hidden IS NULL ORDER BY election_day DESC");
  $elections = [];
  while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
      $elections[] = translateElectionFromDB($row);
  }
  return $elections;
}

function fetchAllElections() {
  global $file_db;

  $stmt = $file_db->query("SELECT * FROM elections ORDER BY election_day DESC");
  $elections = [];
  while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
      $elections[] = translateElectionFromDB($row);
  }

  return $elections;
}

function fetchElection($id) {
  global $file_db;

  $stmt = $file_db->query("SELECT * FROM elections WHERE id = :id");
  $stmt->bindParam(":id", $id);
  $stmt->execute();
  $row = $stmt->fetch(\PDO::FETCH_ASSOC);
  
  if($row === false) {
    failForAPI("Election not found.");
  }

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

function setPrimaryElection($id) {
  global $file_db, $electionPKeyFieldName;

  $stmt = $file_db->prepare("UPDATE elections SET is_primary = 0");
  $stmt->execute();

  $stmt = $file_db->prepare("UPDATE elections SET is_primary = 1 WHERE $electionPKeyFieldName == :id");
  $stmt->bindParam(":id", $id);
  $stmt->execute();

  return $stmt->rowCount();
}

function isElectionDBTableValid($dbTableName) {
  global $file_db;

  $stmt = $file_db->prepare("SELECT COUNT(*) FROM elections WHERE db_table_name = :db_table_name");
  $stmt->bindParam(":db_table_name", $dbTableName);
  $stmt->execute();
  return $stmt->fetchColumn() === "1";
}

// https://stackoverflow.com/a/28331477
function array_splice_preserve_keys(&$input, $offset, $length=null, $replacement=array()) {
  if (empty($replacement)) {
      return array_splice($input, $offset, $length);
  }

  $part_before  = array_slice($input, 0, $offset, $preserve_keys=true);
  $part_removed = array_slice($input, $offset, $length, $preserve_keys=true);
  $part_after   = array_slice($input, $offset+$length, null, $preserve_keys=true);

  $input = $part_before + $replacement + $part_after;

  return $part_removed;
}

function downloadElection($id) {
  global $pollingPlaceHasOtherAllowedFields;

  $election = fetchElection($id);
  $pollingPlaces = fetchAllPollingPlaces($id);

  // Output array into CSV file
  $filename = getElectionTableBaseName($election) . "_" . date("YmdHIs").".csv";
  header('Content-Type: text/csv');
  header('Content-Disposition: attachment; filename="'.$filename.'"');
  $fp = fopen('php://output', 'w');

  if(count($pollingPlaces) > 0) {
    // Add header row
    $header = array_keys($pollingPlaces[0]);
    array_splice($header, array_search("has_other", $header), 0, $pollingPlaceHasOtherAllowedFields);
    array_splice($header, array_search("has_other", $header), 1);
    fputcsv($fp, $header);

    foreach($pollingPlaces as $ferow) {
        // Fan out the contents of has_other into separate columns
        $hasOtherFields = [];
        foreach($pollingPlaceHasOtherAllowedFields as $fieldName) {
          $hasOtherFields[$fieldName] = (isset($ferow["has_other"]->$fieldName)) ? $ferow["has_other"]->$fieldName : false;
        }
        // Insert our $hasOtherField array where has_other is
        array_splice_preserve_keys($ferow, array_search("has_other", array_keys($ferow)), 0, $hasOtherFields);
        // Nuke has_other
        array_splice($ferow, array_search("has_other", array_keys($ferow)), 1);

        fputcsv($fp, $ferow);
    }

  } else {
    fputcsv($fp, array("Sorry, no data."));
  }
  
  return true;
}
?>