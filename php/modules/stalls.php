<?php
require_once "modules/mailgun.php";

$pendingStallsPKeyFieldName = "id";
$pendingStallsAllowedFields = array("stall_name", "stall_description", "stall_website", "contact_email", "has_bbq", "has_caek", "has_vego", "has_halal", "polling_place_id", "polling_place_premises", "elections_id", "active");

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

function addPendingStall(array $params) {
  global $file_db, $pendingStallsAllowedFields;

  $insert = fieldsToInsertSQL("pending_stalls", $pendingStallsAllowedFields, array_keys($params));
  $stmt = $file_db->prepare($insert);
  
  return fieldsToStmnt($stmt, $pendingStallsAllowedFields, $params);
}

function markPendingStallAsRead($id) {
  global $file_db, $pendingStallsPKeyFieldName, $pendingStallsAllowedFields;

  $rowCount = updateTable($id, ["active" => 0], "pending_stalls", $pendingStallsPKeyFieldName, $pendingStallsAllowedFields);

  if($rowCount === 1) {
    $stall = fetchPendingStallById($id);
    $pollingPlace = fetchPollingPlaceByElectionId($stall["polling_place_id"], $stall["elections_id"]);

    $toEmail = $stall["contact_email"];
    $toName = "Foobar";
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
      $stalls[] = translateStallFromDB($row);
  }
  return $stalls;
}
?>