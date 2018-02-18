<?php
require_once "modules/mailgun.php";
require_once "modules/polling_places.php";

$pendingStallsPKeyFieldName = "id";
$pendingStallsAllowedFields = array("stall_name", "stall_description", "stall_website", "stall_location_info", "contact_email", "has_bbq", "has_caek", "has_vego", "has_halal", "has_coffee", "has_baconandeggs", "polling_place_id", "polling_place_premises", "elections_id", "active", "mail_confirm_key", "mail_confirmed", "reported_timestamp");

function translateStallFromDB($row) {
  return [
    "id" => (int)$row["id"],
    "stall_description" => $row["stall_description"],
    "stall_name" => $row["stall_name"],
    "stall_website" => $row["stall_website"],
    "stall_location_info" => ($row["stall_location_info"] !== "") ? json_decode($row["stall_location_info"]) : new stdClass(),
    "contact_email" => $row["contact_email"],
    "has_bbq" => (bool)$row["has_bbq"],
    "has_caek" => (bool)$row["has_caek"],
    "has_vego" => (bool)$row["has_vego"],
    "has_halal" => (bool)$row["has_halal"],
    "has_coffee" => (bool)$row["has_coffee"],
    "has_baconandeggs" => (bool)$row["has_baconandeggs"],
    "polling_place_id" => (int)$row["polling_place_id"],
    "polling_place_premises" => $row["polling_place_premises"],
    "elections_id" => (int)$row["elections_id"],
    "active" => (bool)$row["active"],
    "mail_confirm_key" => $row["mail_confirm_key"],
    "mail_confirmed" => (bool)$row["mail_confirmed"],
    "reported_timestamp" => $row["reported_timestamp"],
  ];
}

function addPendingStall(array $stall, $electionId) {
  global $file_db, $pendingStallsAllowedFields;

  $election = fetchElection($electionId);

  $stall["reported_timestamp"] = "strftime('%Y-%m-%d %H:%M:%f','now') || '+00'";
  if($election["polling_places_loaded"] === false) {
    $stall["stall_location_info"] = (gettype($stall["stall_location_info"]) === "string") ? $stall["stall_location_info"] : json_encode($stall["stall_location_info"]);
  }

  $insert = fieldsToInsertSQL("pending_stalls", $pendingStallsAllowedFields, array_keys($stall), $stall);
  $stmt = $file_db->prepare($insert);
  $stallId = fieldsToStmntLastInsertId($stmt, $pendingStallsAllowedFields, $stall);

  if($stallId !== false) {
    // Send submitted notification to the user
    if($election["polling_places_loaded"] === false) {
      $pollingPlace = (array)json_decode($stall["stall_location_info"]);
    } else {
      $pollingPlace = fetchPollingPlaceByElectionId($stall["polling_place_id"], $electionId);
    }

    $toEmail = $stall["contact_email"];
    $toName = "";
    $mailInfo = array(
      "POLLING_PLACE_NAME" => $pollingPlace["polling_place_name"],
      "POLLING_PLACE_ADDRESS" => $pollingPlace["address"],
      "STALL_NAME" => $stall["stall_name"],
      "STALL_DESCRIPTION" => $stall["stall_description"],
      "STALL_WEBSITE" => $stall["stall_website"],
      "OVERVIEW_MAP" => getMapboxStaticMap(1, 1),
    );
    sendStallSubmittedEmail($stallId, $toEmail, $toName, $mailInfo);
  }
  
  return $stallId;
}

function markPendingStallAsRead($id) {
  global $file_db, $pendingStallsPKeyFieldName, $pendingStallsAllowedFields;

  $stallFieldUpdates = ["active" => 0];

  // If this is an 'unofficial' polling place, add it to the table.
  // This only applies to stalls approved before we have official
  // polling places from the electoral commission.
  $stall = fetchPendingStallById($id);
  $election = fetchElection($stall["elections_id"]);
  if($election["polling_places_loaded"] === false) {
    $pollingPlaceId = addPollingPlace($stall["stall_location_info"], $election["db_table_name"]);
    if($pollingPlaceId === false) {
      failForAPI("Error adding polling place information.");
    }
    $stallFieldUpdates["polling_place_id"] = $pollingPlaceId;
  }

  $rowCount = updateTable($id, $stallFieldUpdates, "pending_stalls", $pendingStallsPKeyFieldName, $pendingStallsAllowedFields);

  if($rowCount === 1) {
    $stall = fetchPendingStallById($id);
    $pollingPlace = fetchPollingPlaceByElectionId($stall["polling_place_id"], $stall["elections_id"]);

    // Send approval notification to the user
    $toEmail = $stall["contact_email"];
    $toName = "";
    $mailInfo = array(
      "POLLING_PLACE_NAME" => $pollingPlace["polling_place_name"],
      "POLLING_PLACE_ADDRESS" => $pollingPlace["address"],
      "STALL_NAME" => $stall["stall_name"],
      "STALL_DESCRIPTION" => $stall["stall_description"],
      "STALL_WEBSITE" => $stall["stall_website"],
      "OVERVIEW_MAP" => getMapboxStaticMap(1, 1),
    );
    sendStallApprovedEmail($toEmail, $toName, $mailInfo);
  }
  return $rowCount;
}

function updateStallPollingPlaceId($election_id, $polling_place_id, $new_polling_place_id) {
  global $file_db;

  $stmt = $file_db->prepare("UPDATE pending_stalls SET polling_place_id = :new_polling_place_id WHERE elections_id = :election_id AND polling_place_id = :polling_place_id");
  $stmt->bindParam(":new_polling_place_id", $new_polling_place_id);
  $stmt->bindParam(":election_id", $election_id);
  $stmt->bindParam(":polling_place_id", $polling_place_id);
  
  $stmt->execute();
  return $stmt->rowCount();
}

// function deletePendingStall($id) {
//   global $file_db, $pendingStallsPKeyFieldName;

//   $delete = fieldsToDeleteSQL("pending_stalls", $pendingStallsPKeyFieldName);
//   $stmt = $file_db->prepare($delete);
//   $stmt->bindParam(":" . $pendingStallsPKeyFieldName, $id);
//   $stmt->execute();

//   return $stmt->rowCount();
// }

function fetchPendingStallById($id) {
  global $file_db;

  $stmt = $file_db->query("SELECT * FROM pending_stalls WHERE id = :id");
  $stmt->bindParam(":id", $id);
  $stmt->execute();
  return $stmt->fetch(\PDO::FETCH_ASSOC);
}

function fetchPendingStallByElection($election_id) {
  global $file_db;

  $stmt = $file_db->query("SELECT * FROM pending_stalls WHERE elections_id = :election_id");
  $stmt->bindParam(":election_id", $election_id);
  $stmt->execute();
  return $stmt->fetch(\PDO::FETCH_ASSOC);
}

function fetchPendingStalls() {
  global $file_db;

  $stmt = $file_db->query("SELECT * FROM pending_stalls WHERE active = 1");
  $stalls = [];
  while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
      $tmp = translateStallFromDB($row);
      if($tmp["stall_location_info"] !== null) {
        $election = fetchElection($tmp["elections_id"]);
        $pollingPlaces = fetchMatchingPollingPlaceByLocation($election["db_table_name"], $tmp["stall_location_info"]->lat, $tmp["stall_location_info"]->lon, 250);
        if(count($pollingPlaces) > 0) {
          $tmp["polling_place_id"] = $pollingPlaces[0]["id"];
        }
      }
      $stalls[] = $tmp;
  }
  return $stalls;
}

function fetchPendingStallByMailConfirmCode($confirmKey) {
  global $file_db;

  $stmt = $file_db->query("SELECT * FROM pending_stalls WHERE mail_confirm_key = :mail_confirm_key");
  $stmt->bindParam(":mail_confirm_key", $confirmKey);
  $stmt->execute();
  return $stmt->fetch(\PDO::FETCH_ASSOC);
}

function confirmEmailOptin($confirmKey) {
  global $file_db;

  $stall = fetchPendingStallByMailConfirmCode($confirmKey);
  if(!(is_array($stall) && isset($stall["id"]))) {
    failNicelyForAuthReasons("Unable to find stall.");
  }

  if(checkConfirmationHash($stall["contact_email"], $stall["id"], $confirmKey) === false) {
    failNicelyForAuthReasons("Confirmation code has expired.");
  }

  if($stall["mail_confirmed"] == 1) {
    failNicelyForAuthReasons("Your email has already been confirmed :)");
  }

  $stmt = $file_db->prepare("UPDATE pending_stalls SET mail_confirmed = 1 WHERE id = :stall_id");
  $stmt->bindParam(":stall_id", $stall["id"]);
  
  $stmt->execute();
  return ($stmt->rowCount() === 1);
}
?>