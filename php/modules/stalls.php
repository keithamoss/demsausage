<?php
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
?>