<?php
date_default_timezone_set("Australia/Perth");

require_once "modules/elections.php";
require_once "modules/polling_places.php";
require_once "modules/stalls.php";

// Create (connect to) SQLite database in file
$file_db = new PDO('sqlite:../db/demsausage.sqlite3');
$file_db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

function failForAPI($msg = "Failed for an unknown reason. Oh dear, Master Luke!") {
  http_response_code(500);
  if($msg !== "") {
    echo json_encode([
      "error" => true,
      "messages" => [[
        "level" => "ERROR",
        "message" => $msg,
      ]]
    ]);
  }
  closeDb();
}

function failForAuthReasons($msg = "You do not have access to this resource.") {
  http_response_code(403);
  echo json_encode(["error" => $msg]);
  closeDb();
}

function failNicelyForAuthReasons($msg = "You do not have access to this resource.") {
  echo $msg;
  closeDb();
}

function closeDb() {
  global $file_db;

  $file_db = null;
  exit();
}

function fieldsToInsertSQL(string $tableName, array $allowedFields, array $fields, array $params) {
  $fields = array_intersect($fields, $allowedFields);
  $fieldNames = implode(", ", $fields);
  $fieldValues = implode(", ", array_map(function ($fieldName) use($params) {
    if(in_array($fieldName, getTimestampFields())) {
      if(is_null($params[$fieldName])) {
        return "NULL";
      } elseif(stristr($params[$fieldName], "strftime") !== false) {
        return $params[$fieldName];
      } else {
        return "'" . $params[$fieldName]. "'";
      }
    } else {
      return ":" . $fieldName;
    }
  }, $fields));
  return "INSERT INTO $tableName ($fieldNames) VALUES ($fieldValues)";
}

function fieldsToUpdateSQL(string $tableName, array $allowedFields, array $params, string $pkeyFieldName) {
  $fields = array_intersect(array_keys($params), $allowedFields);
  $fieldNames = implode(", ", $fields);
  $fieldNamesAndValues = implode(", ", array_map(function ($fieldName) use($params) {
    if(in_array($fieldName, getTimestampFields())) {
      if(is_null($params[$fieldName])) {
        return $fieldName . " = NULL";
      } elseif(stristr($params[$fieldName], "strftime") !== false) {
        return $fieldName . " = " . $params[$fieldName];
      } else {
        return $fieldName . " = '" . $params[$fieldName]. "'";
      }
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
    if(in_array($field, getTimestampFields()) === false) { 
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

function getTimestampFields() {
  return ["first_report", "latest_report", "election_day", "reported_timestamp", "result_timestamp"];
}
?>