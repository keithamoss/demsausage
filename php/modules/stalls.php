<?php
require_once "modules/mailgun.php";
require_once "modules/polling_places.php";

$pendingStallsPKeyFieldName = "id";
$pendingStallsAllowedFields = array("stall_name", "stall_description", "stall_website", "stall_location_info", "contact_email", "has_bbq", "has_caek", "has_vego", "has_halal", "has_coffee", "has_baconandeggs", "polling_place_id", "elections_id", "active", "status", "mail_confirm_key", "mail_confirmed", "reported_timestamp");
class StallStatusEnum {
  const PENDING = 0;
  const APPROVED = 1;
  const DECLINED = 2;
};

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
    "elections_id" => (int)$row["elections_id"],
    "active" => (bool)$row["active"],
    "status" => (int)$row["status"], // StallStatusEnum
    "mail_confirm_key" => $row["mail_confirm_key"],
    "mail_confirmed" => (bool)$row["mail_confirmed"],
    "reported_timestamp" => $row["reported_timestamp"],
  ];
}

function translateStallToDB($row) {
  $new = [];
  foreach($row as $key => $val) {
    if(in_array($key, ["has_bbq", "has_caek", "has_vego", "has_halal", "has_coffee", "has_baconandeggs", "active", "mail_confirmed"])) {
      // Ugh
      $new[$key] = ($val === false || $val === 0 || $val === "0" || strtolower($val) === "false" || $val === "" || is_null($val)) ? false : true;
    } elseif(in_array($key, ["stall_location_info"])) {
      $new[$key] = (gettype($val) === "string") ? $val : json_encode($val);
    } elseif(in_array($key, ["elections_id", "status"])) {
      if(is_numeric($val)) {
        $new[$key] = (int)$val;
      } else {
        $new[$key] = NULL;
      }
    } elseif(in_array($key, ["id"])) {
      $new[$key] = (int)$val;
    } else {
      $new[$key] = $val;
    }
  }
  return $new;
}

function addPendingStall(array $stall, $electionId) {
  global $file_db, $pendingStallsPKeyFieldName, $pendingStallsAllowedFields;

  $election = fetchElection($electionId);

  $stall["reported_timestamp"] = "strftime('%Y-%m-%d %H:%M:%f','now') || '+00'";
  if($election["polling_places_loaded"] === false) {
    $stall["stall_location_info"] = (gettype($stall["stall_location_info"]) === "string") ? $stall["stall_location_info"] : json_encode($stall["stall_location_info"]);
  }

  $stall = translateStallToDB($stall);
  $insert = fieldsToInsertSQL("pending_stalls", $pendingStallsAllowedFields, array_keys($stall), $stall);
  $stmt = $file_db->prepare($insert);
  $stallId = fieldsToStmntLastInsertId($stmt, $pendingStallsAllowedFields, $stall);

  if($stallId !== false) {
    // Generate our mail confirm key
    updateTable($stallId, ["mail_confirmed" => 1, "mail_confirm_key" => makeConfirmationHash($stall["contact_email"], $stallId)], "pending_stalls", $pendingStallsPKeyFieldName, $pendingStallsAllowedFields);
    
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
      "STALL_WEBSITE" => (array_key_exists("stall_website", $stall) === true) ? $stall["stall_website"] : "",
      "DELICIOUSNESS" => getFoodDescriptionForStall($stall),
      "OVERVIEW_MAP" => getMapboxStaticMap(1, 1),
    );
    sendStallSubmittedEmail($stallId, $toEmail, $toName, $mailInfo);
  }
  
  return $stallId;
}

function markPendingStallAsReadAndAddUnofficialPollingPlace($id) {
  global $file_db, $pendingStallsPKeyFieldName, $pendingStallsAllowedFields;

  // If this is an 'unofficial' polling place, add it to the table.
  // This only applies to stalls approved before we have official
  // polling places from the electoral commission.
  $stall = fetchPendingStallById($id);
  if($stall["active"] === false) {
    failForAPI("Stall is already approved.");
  }

  $election = fetchElection($stall["elections_id"]);
  if($stall["elections_id"] !== $election["id"]) {
    failForAPI("Stall is not part of this election.");
  }

  if($election["polling_places_loaded"] === false) {
    $stallFieldUpdates = [];

    $pollingPlace = (array)$stall["stall_location_info"];

    // Copy across deliciousness
    $pollingPlace["has_bbq"] = $stall["has_bbq"];
    $pollingPlace["has_caek"] = $stall["has_caek"];
    $hasOther = new stdClass();
    if($stall["has_coffee"] === true) {
      $hasOther->has_coffee = true;
    }
    if($stall["has_vego"] === true) {
      $hasOther->has_vego = true;
    }
    if($stall["has_halal"] === true) {
      $hasOther->has_halal = true;
    }
    if($stall["has_baconandeggs"] === true) {
      $hasOther->has_baconandeggs = true;
    }
    $pollingPlace["has_other"] = json_encode($hasOther);

    // Copy across stall-related fields
    $pollingPlace["stall_name"] = $stall["stall_name"];
    $pollingPlace["stall_description"] = $stall["stall_description"];
    $pollingPlace["stall_website"] = $stall["stall_website"];

    $pollingPlaceId = addPollingPlace($pollingPlace, $election["db_table_name"]);
    if($pollingPlaceId === false) {
      failForAPI("Error adding polling place information.");
    }
    $stallFieldUpdates["polling_place_id"] = $pollingPlaceId;

    // Turn the stall into a stall attached to a regular polling place (now that it exists)
    $stallFieldUpdates["stall_location_info"] = null;

    // Update the stall to reflect it now has a polling place attached to it
    updateTable($id, $stallFieldUpdates, "pending_stalls", $pendingStallsPKeyFieldName, $pendingStallsAllowedFields);

    // Regenerate GeoJSON for this election so it includes our new stall
    regeneratePollingPlaceGeoJSON($election["id"]);
  }
  
  return markPendingStallAsRead($id);
}

function markPendingStallAsRead($id) {
  global $file_db, $pendingStallsPKeyFieldName, $pendingStallsAllowedFields;

  $stallFieldUpdates = ["active" => 0, "status" => StallStatusEnum::APPROVED];

  // If this is an 'unofficial' polling place, add it to the table.
  // This only applies to stalls approved before we have official
  // polling places from the electoral commission.
  $stall = fetchPendingStallById($id);
  if($stall["active"] === false) {
    failForAPI("Stall is already approved.");
  }

  $election = fetchElection($stall["elections_id"]);
  if($stall["elections_id"] !== $election["id"]) {
    failForAPI("Stall is not part of this election.");
  }

  if($election["polling_places_loaded"] === false) {
    // Turn the stall into a stall attached to a regular polling place (now that it exists)
    $pollingPlaces = fetchMatchingPollingPlaceByLocation($election["db_table_name"], $stall["stall_location_info"]->lat, $stall["stall_location_info"]->lon, 250);
    if(count($pollingPlaces) > 0) {
      $stallFieldUpdates["polling_place_id"] = $pollingPlaces[0]["id"];
    } elseif(count($pollingPlaces) > 1) {
      failForAPI("Found more than 1 matching polling place for an unofficial stall. This is a problem :(");
    }

    $stallFieldUpdates["stall_location_info"] = null;
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
      "DELICIOUSNESS" => getFoodDescriptionForStall($stall),
      "OVERVIEW_MAP" => getMapboxStaticMap(1, 1),
    );
    sendStallApprovedEmail($id, $toEmail, $toName, $mailInfo);
  }
  return $rowCount;
}

function markPendingStallAsDeclined($id) {
  global $file_db, $pendingStallsPKeyFieldName, $pendingStallsAllowedFields;

  return updateTable($id, ["active" => 0, "status" => StallStatusEnum::DECLINED], "pending_stalls", $pendingStallsPKeyFieldName, $pendingStallsAllowedFields);
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

function fetchPendingStallById($id) {
  global $file_db;

  $stmt = $file_db->query("SELECT * FROM pending_stalls WHERE id = :id");
  $stmt->bindParam(":id", $id);
  $stmt->execute();
  $row = $stmt->fetch(\PDO::FETCH_ASSOC);
  return translateStallFromDB($row);
}

function fetchPendingStallByElection($election_id) {
  global $file_db;

  $stmt = $file_db->query("SELECT * FROM pending_stalls WHERE elections_id = :election_id");
  $stmt->bindParam(":election_id", $election_id);
  $stmt->execute();

  $stalls = [];
  while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
    $stalls[] = translateStallFromDB($row);
  }
  return $stalls;
}

function fetchPendingStalls() {
  global $file_db;

  $stmt = $file_db->query("SELECT * FROM pending_stalls WHERE active = 1");
  $stalls = [];
  while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
      $stall = translateStallFromDB($row);

      // For unofficial polling places, override polling_place_id with its matching polling place
      if($stall["stall_location_info"] !== null) {
        $election = fetchElection($stall["elections_id"]);
        $pollingPlaces = fetchMatchingPollingPlaceByLocation($election["db_table_name"], $stall["stall_location_info"]->lat, $stall["stall_location_info"]->lon, 250);
        if(count($pollingPlaces) > 0) {
          $stall["polling_place_id"] = $pollingPlaces[0]["id"];
        } elseif(count($pollingPlaces) > 1) {
          failForAPI("Found more than 1 matching polling place for an unofficial stall. This is a problem :(");
        }
      }

      // Link polling place info
      if($stall["polling_place_id"] > 0) {
        $pollingPlace = fetchPollingPlaceByElectionId($stall["polling_place_id"], $row["elections_id"]);
        $stall["polling_place_info"] = ["name" => $pollingPlace["polling_place_name"], "premises" => $pollingPlace["premises"], "address" => $pollingPlace["address"], "state" => $pollingPlace["state"]];
      }

      $stalls[] = $stall;
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

function confirmEmailOptout($confirmKey) {
  global $file_db;

  $stall = fetchPendingStallByMailConfirmCode($confirmKey);
  if(!(is_array($stall) && isset($stall["id"]))) {
    failNicelyForAuthReasons("Unable to find stall.");
  }

  if(checkConfirmationHash($stall["contact_email"], $stall["id"], $confirmKey) === false) {
    failNicelyForAuthReasons("Confirmation code has expired.");
  }

  $stmt = $file_db->prepare("UPDATE pending_stalls SET mail_confirmed = 0 WHERE contact_email = :contact_email");
  $stmt->bindParam(":contact_email", $stall["contact_email"]);
  
  $stmt->execute();
  return true;
}

function getFoodDescriptionForStall($stall) {
  $noms = [];

  if ($stall["has_bbq"] === "true" || $stall["has_bbq"] === true) {
      $noms[] = "sausage sizzle";
  }
  if ($stall["has_caek"] === "true" || $stall["has_caek"] === true) {
      $noms[] = "cake stall";
  }
  if ($stall["has_baconandeggs"] === "true" || $stall["has_baconandeggs"] === true) {
      $noms[] = "bacon and egg burgers";
  }
  if ($stall["has_vego"] === "true" || $stall["has_vego"] === true) {
      $noms[] = "vegetarian options";
  }
  if ($stall["has_halal"] === "true" || $stall["has_halal"] === true) {
      $noms[] = "halal options";
  }
  if ($stall["has_coffee"] === "true" || $stall["has_coffee"] === true) {
      $noms[] = "coffee";
  }
  return implode(", ", $noms);
}
?>