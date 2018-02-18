<?php
require_once "modules/stalls.php";

$pollingPlacesPKeyFieldName = "id";
$pollingPlacesAllowedFields = array("stall_description", "lon", "has_run_out", "has_nothing", "has_caek", "has_bbq", "chance_of_sausage", "latest_report", "first_report", "stall_website", "lat", "stall_name", "extra_info", "source", "has_other", "wheelchairaccess", "entrancesdesc", "polling_place_type", "booth_info", "opening_hours", "premises", "address", "polling_place_name", "division", "state", "ess_stall_id", "ess_stall_url");
$pollingPlacesRequiredFields = array("lon", "lat", "polling_place_name", "address", "state");
$validStates = ["WA", "SA", "NT", "VIC", "NSW", "QLD", "TAS", "ACT", "Overseas"];
$validPollingPlaceTypes = ["Child Care Centre", "Church", "Community Hall", "Other", "Pre-School", "Private School", "Public School", "Senior Citizens Centre", "Courthouse", "Hospital"];

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
    "chance_of_sausage" => (float)$row["chance_of_sausage"],
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
    "entrancesdesc" => $row["entrancesdesc"],
    "opening_hours" => $row["opening_hours"],
    "premises" => $row["premises"],
    "address" => $row["address"],
    "division" => $row["division"],
    "state" => $row["state"],
    "source" => $row["source"],
    "ess_stall_id" => (is_numeric($row["ess_stall_id"])) ? (int)$row["ess_stall_id"] : $row["ess_stall_id"],
    "ess_stall_url" => $row["ess_stall_url"]
  ];
}

function translatePollingPlaceToDB($row) {
  $new = [];
  foreach($row as $key => $val) {
    if(in_array($key, ["has_bbq", "has_caek", "has_nothing", "has_run_out"])) {
      // Ugh
      $new[$key] = ($val === false || $val === 0 || $val === "0" || strtolower($val) === "false" || $val === "" || is_null($val)) ? false : true;
    } elseif(in_array($key, ["has_other"])) {
      $new[$key] = (gettype($val) === "string") ? $val : json_encode($val);
    } elseif(in_array($key, ["lon", "lat", "chance_of_sausage"])) {
      $new[$key] = (float)$val;
    } elseif(in_array($key, ["ess_stall_id"])) {
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

function addPollingPlace(array $params, string $pollingPlaceTableName) {
  global $file_db, $pollingPlacesAllowedFields;

  $pollingPlace = translatePollingPlaceToDB($params);

  $insert = fieldsToInsertSQL($pollingPlaceTableName, $pollingPlacesAllowedFields, array_keys($pollingPlace), $pollingPlace);
  $stmt = $file_db->prepare($insert);
  
  return fieldsToStmntLastInsertId($stmt, $pollingPlacesAllowedFields, $pollingPlace);
}

function updatePollingPlace($id, array $params, string $electionId, $regenerateGeoJSON) {
  global $file_db, $pollingPlacesPKeyFieldName, $pollingPlacesAllowedFields;
  
  $election = fetchElection($electionId);
  $pollingPlace = translatePollingPlaceToDB($params);
  
  $rowCount = updateTable($id, $pollingPlace, $election["db_table_name"], $pollingPlacesPKeyFieldName, $pollingPlacesAllowedFields);

  // Regenerate the polling place GeoJSON
  if($regenerateGeoJSON === true) {
    regeneratePollingPlaceGeoJSON($electionId);
  }

  return $rowCount;
}

function updatePollingPlaceByElectionTableName($id, array $params, string $electionTableName, $regenerateGeoJSON) {
  global $file_db, $pollingPlacesPKeyFieldName, $pollingPlacesAllowedFields;
  
  $pollingPlace = translatePollingPlaceToDB($params);
  
  $rowCount = updateTable($id, $pollingPlace, $electionTableName, $pollingPlacesPKeyFieldName, $pollingPlacesAllowedFields);

  // Regenerate the polling place GeoJSON
  if($regenerateGeoJSON === true) {
    $election = fetchElectionByName($electionTableName);
    regeneratePollingPlaceGeoJSON($election["id"]);
  }

  return $rowCount;
}

function searchPollingPlaces($searchTerm, string $electionId) {
  global $file_db;

  $election = fetchElection($electionId);

  $stmt = $file_db->prepare("SELECT * FROM " . $election["db_table_name"] . " WHERE premises LIKE LOWER(:searchTerm) OR polling_place_name LIKE LOWER(:searchTerm) OR address LIKE LOWER(:searchTerm)");
  $stmt->bindParam(":searchTerm", strtolower("%" . $searchTerm . "%"));
  $stmt->execute();

  $pollingPlaces = [];
  while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
      $pollingPlaces[] = translatePollingPlaceFromDB($row);
  }
  return $pollingPlaces;
}

function fetchPollingPlaces($ids, string $electionId) {
  global $file_db;
  
  $election = fetchElection($electionId);

  // 0_o
  // https://stackoverflow.com/a/920523
  $inQuery = implode(',', array_fill(0, count($ids), '?'));
  $stmt = $file_db->prepare("SELECT * FROM " . $election["db_table_name"] . " WHERE id IN ($inQuery)");
  $stmt->execute($ids);
  
  $pollingPlaces = [];
  while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
    $pollingPlaces[] = translatePollingPlaceFromDB($row);
  }
  return $pollingPlaces;
}

function fetchPollingPlaceByElectionId($id, string $electionId) {
  return fetchPollingPlaces(array($id), $electionId)[0];
}

function fetchPollingPlacesByElectionTableName($ids, string $electionTableName) {
  global $file_db;

  // 0_o
  // https://stackoverflow.com/a/920523
  $inQuery = implode(',', array_fill(0, count($ids), '?'));
  $stmt = $file_db->prepare("SELECT * FROM $electionTableName WHERE id IN ($inQuery)");
  $stmt->execute($ids);
  
  $pollingPlaces = [];
  while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
    $pollingPlaces[] = translatePollingPlaceFromDB($row);
  }
  return $pollingPlaces;
}

function deletePollingPlaceByElectionTableName($id, string $electionTableName) {
  global $file_db, $pollingPlacesPKeyFieldName;

  $delete = fieldsToDeleteSQL($electionTableName, $pollingPlacesPKeyFieldName);
  $stmt = $file_db->prepare($delete);
  $stmt->bindParam(":" . $pollingPlacesPKeyFieldName, $id);
  $stmt->execute();

  return $stmt->rowCount();
}

function fetchPollingPlaceTypes(string $electionId) {
  global $validPollingPlaceTypes;

  return $validPollingPlaceTypes;
}

function fetchAllPollingPlaces(string $electionId) {
  global $file_db;
  
  $election = fetchElection($electionId);

  $stmt = $file_db->prepare("SELECT * FROM " . $election["db_table_name"]);
  $stmt->execute();
  
  $pollingPlaces = [];
  while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
      $pollingPlaces[] = translatePollingPlaceFromDB($row);
  }
  return $pollingPlaces;
}

function fetchAllPollingPlacesByElectionTableName(string $electionTableName) {
  global $file_db;

  $stmt = $file_db->prepare("SELECT * FROM $electionTableName");
  $stmt->execute();
  
  $pollingPlaces = [];
  while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
      $pollingPlaces[] = translatePollingPlaceFromDB($row);
  }
  return $pollingPlaces;
}

function fetchAllPollingPlacesWithData(string $electionTableName, bool $validateElection = true) {
  global $file_db;
  
  if($validateElection === true && isElectionDBTableValid($electionTableName) === false) {
    failForAPI("From fetchAllPollingPlacesWithData");
  }

  $stmt = $file_db->prepare("SELECT * FROM $electionTableName WHERE has_bbq = 1 OR has_caek = 1 OR has_nothing = 1 OR has_other != ''");
  $stmt->execute();
  
  $pollingPlaces = [];
  while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
      $pollingPlaces[] = translatePollingPlaceFromDB($row);
  }
  return $pollingPlaces;
}

function isPollingPlaceHeaderValid($header) {
  global $pollingPlacesAllowedFields, $pollingPlacesRequiredFields;

  $messages = [];

  $invalidFields = array_diff($header, $pollingPlacesAllowedFields);
  if(count($invalidFields) > 0) {
    $messages[] = "Found invalid fields: " . implode(", ", $invalidFields) . ".";
  }

  $missingRequiredFields = array_diff($pollingPlacesRequiredFields, $header);
  if(count($missingRequiredFields) > 0) {
    $messages[] = "Required fields were missing: " . implode(", ", $missingRequiredFields) . ".";
  }

  if(count($messages) > 0) {
    return implode("<br />", $messages);
  }
  return true;
}

function isPollingPlaceValid($pollingPlace) {
  global $validStates, $validPollingPlaceTypes;

  $messages = [];

  $nonEmptyStringFields = ["division", "polling_place_name", "address", "state"];
  foreach($nonEmptyStringFields as $fieldName) {
    if(array_key_exists($fieldName, $pollingPlace) === true && $pollingPlace[$fieldName] === "") {
      $messages[] = "Required field " . $fieldName . " is empty.";
    }
  }

  if(in_array($pollingPlace["state"], $validStates) === false) {
    $messages[] = "State '" . $pollingPlace["state"] . "' is not a recognised state.";
  }


  // Fix for Queensland 2017
  if($pollingPlace["polling_place_type"] === "State School") {
    $pollingPlace["polling_place_type"] = "Public School";
  }
  // Fix for Federal 2016
  if($pollingPlace["polling_place_type"] === "Government School") {
    $pollingPlace["polling_place_type"] = "Public School";
  }
  if($pollingPlace["polling_place_type"] === "Hall") {
    $pollingPlace["polling_place_type"] = "Community Hall";
  }
  if($pollingPlace["polling_place_type"] === "Kindergarten") {
    $pollingPlace["polling_place_type"] = "Pre-School";
  }

  if(in_array("polling_place_type", array_keys($pollingPlace)) === true && $pollingPlace["polling_place_type"] !== "" && in_array($pollingPlace["polling_place_type"], $validPollingPlaceTypes) === false) {
    $messages[] = "Polling place type '" . $pollingPlace["polling_place_type"] . "' is not a recognised type.";
  }

  $lon = (float)$pollingPlace["lon"];
  if(is_numeric($pollingPlace["lon"]) === false || $lon < -180 || $lon > 180) {
    $messages[] = "Longitude is out of bounds: " . $lon . ".";
  }

  $lat = (float)$pollingPlace["lat"];
  if(is_numeric($pollingPlace["lat"]) === false || $lat < -90 || $lat > 90) {
    $messages[] = "Latitude is out of bounds: " . $lat . ".";
  }

  if(count($messages) > 0) {
    return "Polling Place '" . $pollingPlace["polling_place_name"] . "': " . implode("<br />", $messages);
  }
  return true;
}

/**
 * Calculates the great-circle distance between two points, with
 * the Haversine formula.
 * https://stackoverflow.com/a/10054282
 * 
 * @param float $latitudeFrom Latitude of start point in [deg decimal]
 * @param float $longitudeFrom Longitude of start point in [deg decimal]
 * @param float $latitudeTo Latitude of target point in [deg decimal]
 * @param float $longitudeTo Longitude of target point in [deg decimal]
 * @param float $earthRadius Mean earth radius in [m]
 * @return float Distance between points in [m] (same as earthRadius)
 */
function haversineGreatCircleDistance(
  $latitudeFrom, $longitudeFrom, $latitudeTo, $longitudeTo, $earthRadius = 6371000)
{
  // convert from degrees to radians
  $latFrom = deg2rad($latitudeFrom);
  $lonFrom = deg2rad($longitudeFrom);
  $latTo = deg2rad($latitudeTo);
  $lonTo = deg2rad($longitudeTo);

  $latDelta = $latTo - $latFrom;
  $lonDelta = $lonTo - $lonFrom;

  $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
    cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));
  return $angle * $earthRadius;
}

function fetchMatchingPollingPlaceByLocation($electionTableName, $lat, $lon, $distanceMetres) {
  global $file_db;

  // This save us having Spatialite as a dependency
  // A polling place matches if it's within $distanceMetres
  $metresInDegrees = 1 / (106255 / $distanceMetres); // At -24 latitude
  $earthRadiusAt24S = 6374624;

  $stmt = $file_db->prepare("SELECT * FROM $electionTableName WHERE lon BETWEEN :minlon AND :maxlon AND lat BETWEEN :minlat AND :maxlat");
  $minlon = $lon - $metresInDegrees;
  $stmt->bindParam(":minlon", $minlon);
  $maxlon = $lon + $metresInDegrees;
  $stmt->bindParam(":maxlon", $maxlon);
  $minlat = $lat - $metresInDegrees;
  $stmt->bindParam(":minlat", $minlat);
  $maxlat = $lat + $metresInDegrees;
  $stmt->bindParam(":maxlat", $maxlat);
  $stmt->execute();

  $pollingPlaces = [];
  while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
    $tmp = translatePollingPlaceFromDB($row);
    $tmp["distance_metres"] = round(haversineGreatCircleDistance($lat, $lon, $tmp["lat"], $tmp["lon"], $earthRadiusAt24S));
    $pollingPlaces[] = $tmp;
  }
  return $pollingPlaces;
}

function fetchMatchingPollingPlaceByPollingPlace($electionTableName, $pollingPlace, $distanceMetres = 200) {
  return fetchMatchingPollingPlaceByLocation($electionTableName, $pollingPlace["lat"], $pollingPlace["lon"], $distanceMetres);
}

function fetchHistoricalData($pollingPlace, $currentElection) {
  global $file_db;

  $results = [];

  foreach(fetchAllElections() as $election) {
    if($election["id"] === $currentElection["id"]) {
      continue;
    }

    $pollingPlaces = fetchMatchingPollingPlaceByPollingPlace($election["db_table_name"], $pollingPlace);

    if(count($pollingPlaces) > 0) {
      $results[] = [
        "election" => $election["db_table_name"],
        "pollingPlaces" => $pollingPlaces,
      ];
    }
  }

  return $results;
}

function findDuplicatePollingPlaces($electionTableName) {
  global $file_db;

  $stmt = $file_db->prepare("SELECT COUNT(*) as count, address, GROUP_CONCAT(id) AS ids FROM $electionTableName GROUP BY address HAVING COUNT(*) > 1 ORDER BY COUNT(*) DESC");
  $stmt->execute();

  $dupePollingPlaces = [];
  while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
    $dupePollingPlaces[] = $row;
  }
  return $dupePollingPlaces;
}

function createPollingPlaceTable($tableName) {
  global $file_db;

  $file_db->exec(<<<EOT
    CREATE TABLE `{$tableName}` (
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

  return true;
}

function createElectionTableName($election) {
  date_default_timezone_set("Australia/Perth");
  return str_replace([" ", "-"], "_", strtolower($election["name"])) . "_v" . date("YmdHis");
}

function loadPollingPlaces($electionId, $dryrun, $file) {
  global $file_db, $pollingPlacesAllowedFields, $validPollingPlaceTypes;

  $election = fetchElection($electionId);
  $response = [
    "error" => false,
    "messages" => [],
    "table_name" => null,
    "dryrun" => $dryrun,
  ];

  // Check file type
  if($file["type"] !== "text/csv") {
    $response["error"] = true;
    $response["messages"][] = [
      "level" => "ERROR",
      "message" => "Invalid file type of '" . $file["type"] . "'. Must be 'text/csv'.",
    ];
  }

  // Check file was loaded OK
  if($file["error"] !== 0) {
    $response["error"] = true;
    $response["messages"][] = [
      "level" => "ERROR",
      "message" => "Failed uploading file with error code '" . $file["error"] . "'.",
    ];
  }

  // Check exists
  if(file_exists($file["tmp_name"]) === false) {
    $response["error"] = true;
    $response["messages"][] = [
      "level" => "ERROR",
      "message" => "File does not exist.",
    ];
  }

  // Check there are no pending stalls
  if(count(fetchPendingStalls()) > 0) {
    $response["error"] = true;
    $response["messages"][] = [
      "level" => "ERROR",
      "message" => "There are pending stalls still left to process. Please review and approve or decline stalls before loading polling places.",
    ];
  }

  if($response["error"] === true) {
    return $response;
  }

  // Parse our CSV file
  // http://php.net/manual/en/function.str-getcsv.php
  $rows = array_map('str_getcsv', file($_FILES["file"]["tmp_name"]));
  foreach($rows as $row) {
    if(count($row) != count($rows[0])) {
      print_r($row);
    }
  }
  array_walk($rows, function(&$a) use ($rows) {
    $a = array_combine($rows[0], $a);
  });
  $header = array_shift($rows);

  if(($msg = isPollingPlaceHeaderValid($header)) !== true) {
    $response["error"] = true;
    $response["messages"][] = [
      "level" => "ERROR",
      "message" => "CSV file columns do not match required schema. $msg",
    ];
    return $response;
  }

  foreach($rows as $pollingPlace) {
    if(($msg = isPollingPlaceValid($pollingPlace)) !== true) {
      $response["error"] = true;
      $response["messages"][] = [
        "level" => "ERROR",
        "message" => $msg
      ];
    }
  }

  if($response["error"] === true) {
    return $response;
  }

  // Go ahead and populate the db
  $response["table_name"] = createElectionTableName($election);

  if(($msg = createPollingPlaceTable($response["table_name"])) !== true) {
    $response["error"] = true;
    $response["messages"][] = [
      "level" => "ERROR",
      "message" => $msg
    ];
    return $response;
  }

  $basePollingPlace = [
    "has_bbq" => "false",
    "has_caek" => "false",
    "has_nothing" => "false",
    "has_run_out" => "false",
  ];

  foreach($rows as $index => $pollingPlace) {
    $tmpPollingPlace = array_merge($basePollingPlace, $pollingPlace);
    $pollingPlaceId = addPollingPlace($tmpPollingPlace, $response["table_name"]);

    if($pollingPlaceId === false) {
      $response["error"] = true;
      $response["messages"][] = [
        "level" => "ERROR",
        "message" => "Error adding polling place #$index.",
      ];

      // Discard our temporary table
      $file_db->exec("DROP TABLE " . $response["table_name"]);
      $response["table_name"] = null;

      return $response;
    }
  }
  
  $response["messages"][] = [
    "level" => "INFO",
    "message" => "Found " . count($rows) . " polling places.",
  ];

  // Dedupe polling places
  // This often happens where electoral commissions include a polling place as multiple rows - one for each electoral division that the polling place can represent
  $dupePollingPlaces = findDuplicatePollingPlaces($response["table_name"]);
  foreach($dupePollingPlaces as $dupe) {
    $pollingPlaces = fetchPollingPlacesByElectionTableName(explode(",", $dupe["ids"]), $response["table_name"]);

    $withData = array_filter($pollingPlaces, function($pollingPlace) {
      return $pollingPlace["has_bbq"] === true || $pollingPlace["has_caek"] === true || $pollingPlace["has_nothing"] === true || json_encode($pollingPlace["has_other"]) != "{}";
    });

    // Work out which polling place to keep
    // This is only really required for the initial import from CartoDB
    // After that, we can rely on the later merge process to merge for us because we remove duplicates here.
    if(count($withData) > 0) {
      $pollingPlaceToKeep = $withData[0];
    } elseif(count($withData) > 1) {
      $response["error"] = true;
      $response["messages"][] = [
        "level" => "ERROR",
        "message" => "Found " . $dupe["count"] . " duplicate polling places for '" . $dupe["address"] . "' (Divisions: " . $divisions . "). Of these, " . count((array)$withData) . " had data. This is a problem that shouldn't actually happen - we can't handle automatically marging these."
      ];
    } else {
      $pollingPlaceToKeep = $pollingPlaces[0];
    }

    // Update the polling place we're keeping with all of the electoral divisions it represents
    $divisions = implode(", ", array_map(function($pollingPlace) {
      return $pollingPlace["division"];
    }, $pollingPlaces));
    updatePollingPlaceByElectionTableName($pollingPlaceToKeep["id"], ["division" => $divisions], $response["table_name"], false);

    // Remove the duplicate polling places
    foreach($pollingPlaces as $pollingPlace) {
      if($pollingPlace["id"] !== $pollingPlaceToKeep["id"]) {
        deletePollingPlaceByElectionTableName($pollingPlace["id"], $response["table_name"]);
      }
    }

    $response["messages"][] = [
      "level" => "WARNING",
      "message" => "Found " . $dupe["count"] . " duplicate polling places for '" . $dupe["address"] . "' (Divisions: " . $divisions . "). Of these, " . count((array)$withData) . " had data. Removed and merged " . (count($pollingPlaces) - 1) . " polling places."
    ];
  }

  if($response["error"] === true) {
    return $response;
  }

  // Guess polling place types and calculate chance of sausage based on historical data
  $pollingPlaces = fetchAllPollingPlacesByElectionTableName($response["table_name"]);
  $noHistoricalDataCount = 0;
  foreach($pollingPlaces as $pollingPlace) {
    $historical = fetchHistoricalData($pollingPlace, $election);

    if(count($historical) === 0) {
      $noHistoricalDataCount++;
      // $response["messages"][] = [
      //   "level" => "WARNING",
      //   "message" => "Polling Place '" . $pollingPlace["polling_place_name"] . "': No historical data found to use to guess polling place type and assign a sausage chance.",
      // ];
      continue;
    }

    // Guess polling_place_type based on history
    $pollingPlaceTypes = array_map(function($value) {
      $type = $value["pollingPlaces"][0]["polling_place_type"];
      // Fix for Queensland 2017
      if($type === "State School") {
        $type = "Public School";
      }
      // Fix for Federal 2016
      if($type === "Government School") {
        $type = "Public School";
      }
      if($type === "Hall") {
        $type = "Community Hall";
      }
      if($type === "Kindergarten") {
        $type = "Pre-School";
      }
      return $type;
    }, $historical);
    $pollingPlaceTypes = array_filter($pollingPlaceTypes, function($value) {
      // echo "$value: " . gettype($value)."\n";
      return empty($value) === false;
    });
    // print_r($pollingPlaceTypes);
    $pollingPlaceTypesGrouped = array_count_values($pollingPlaceTypes);

    if(count($pollingPlaceTypesGrouped) > 0) {
      $detectedPollingPlaceType = array_shift(array_keys($pollingPlaceTypesGrouped));
      // if($pollingPlace["polling_place_name"] === "Kinross Primary School") {
      //   print_r($historical);
      //   print_r($pollingPlaceTypes);
      //   print_r($pollingPlaceTypesGrouped);
      // }
      if(in_array($detectedPollingPlaceType, $validPollingPlaceTypes) === false) {
        $response["messages"][] = [
          "level" => "WARNING",
          "message" => "Polling Place '" . $pollingPlace["polling_place_name"] . "': Detected polling place type of '" . $detectedPollingPlaceType . "' is not valid.",
        ];
      } else {
        updatePollingPlaceByElectionTableName($pollingPlace["id"], ["polling_place_type" => $detectedPollingPlaceType], $response["table_name"], false);
      }
    }

    // Calculate chance of sausage
    $pollingPlaceScores = array_map(function($value) {
      return $value["pollingPlaces"][0]["has_bbq"] === true || $value["pollingPlaces"][0]["has_caek"] === true;
    }, $historical);
    $score = array_sum($pollingPlaceScores);
    $chance = $score / count($historical);

    updatePollingPlaceByElectionTableName($pollingPlace["id"], ["chance_of_sausage" => $chance], $response["table_name"], false);
  }

  if($noHistoricalDataCount > 0) {
    $response["messages"][] = [
      "level" => "WARNING",
      "message" => "Found $noHistoricalDataCount polling places with no historical data.",
    ];
  }

  // Merge stall info from the current active table
  $stallsUpdatedCount = 0;

  $currentPollingPlaces = fetchAllPollingPlacesWithData($election["db_table_name"]);
  foreach($currentPollingPlaces as $pollingPlace) {
    $newPollingPlaces = fetchMatchingPollingPlaceByPollingPlace($response["table_name"], $pollingPlace);
    if(count($newPollingPlaces) !== 1) {
      $response["error"] = true;
      $response["messages"][] = [
        "level" => "ERROR",
        "message" => "Polling Place '" . $pollingPlace["polling_place_name"]. "' (" . $pollingPlace["address"]. ") has a stall, but we found '" . count($newPollingPlaces) . "' matching polling places in the new table.",
      ];
    } else {
      // Merge our existing info about the polling place onto its equivalent in the new table
      $stallRelatedFields = [
        "has_bbq" => $pollingPlace["has_bbq"],
        "has_caek" => $pollingPlace["has_caek"],
        "has_nothing" => $pollingPlace["has_nothing"],
        "has_run_out" => $pollingPlace["has_run_out"],
        "has_other" => $pollingPlace["has_other"],
        "stall_name" => $pollingPlace["stall_name"],
        "stall_description" => $pollingPlace["stall_description"],
        "stall_website" => $pollingPlace["stall_website"],
        "latest_report" => $pollingPlace["latest_report"],
        "first_report" => $pollingPlace["first_report"],
        "extra_info" => $pollingPlace["extra_info"],
        "source" => $pollingPlace["source"],
        "ess_stall_id" => $pollingPlace["ess_stall_id"],
        "ess_stall_url" => $pollingPlace["ess_stall_url"],
      ];
      updatePollingPlaceByElectionTableName($newPollingPlaces[0]["id"], $stallRelatedFields, $response["table_name"], false);

      // If this is our first load of polling place info, log some CHECK-level
      // messages to compare the user-entered location info with the official
      // location info. This is a poke for us to pick up any discrepancies.
      if($election["polling_places_loaded"] === false) {
        $response["messages"][] = [
          "level" => "CHECK",
          "message" => "User-entered polling place '" . $pollingPlace["polling_place_name"]. "' (" . $pollingPlace["address"]. ") has been merged into the official polling place '" . $newPollingPlaces[0]["polling_place_name"]. "' (" . $newPollingPlaces[0]["address"]. "). Is this the same location?",
        ];
      }

      // Update the pending_stalls table to point to the new id
      if($dryrun === false) {
        $stallsUpdated = updateStallPollingPlaceId($election["id"], $pollingPlace["id"], $newPollingPlaces[0]["id"]);
        $response["messages"][] = [
          "level" => "INFO",
          "message" => "Polling Place '" . $pollingPlace["polling_place_name"]. "' (" . $pollingPlace["address"]. "). Updated " . $stallsUpdated . " stalls with their new ids.",
        ];
        $stallsUpdatedCount += $stallsUpdated;
      }
    }
  }

  if($dryrun === false) {
    // Log how many stalls had their polling places updated.
    // In most cases, we'd usually only expect a few stalls to change their ids.
    // (I think...Though, ids are based on their position in the CSV file, so a
    // change in the order of rows in the file would change a lot of ids.)
    $stallsForElection = count(fetchPendingStallByElection($election["id"]));
    if($stallsForElection !== $stallsUpdatedCount) {
      $response["messages"][] = [
        "level" => "WARNING",
        "message" => "We updated " . $stallsUpdatedCount . " stalls with new polling place ids. " . ($stallsForElection - $stallsUpdatedCount) . " were not updated. (This may or may not be a problem.)",
      ];
    }

    // Set this as the active table for this election
    if($response["error"] === false) {
      updateElection($election["id"], ["db_table_name" => $response["table_name"], "polling_places_loaded" => true]);

      // Regenerate the polling place GeoJSON
      regeneratePollingPlaceGeoJSON($election["id"]);
    } else {
      array_unshift($response["messages"], [
        "level" => "ERROR",
        "message" => "Failed to load new polling places - could not migrate all existing polling place data across. Please review logs for more information.",
      ]);

      // Discard our temporary table
      $file_db->exec("DROP TABLE " . $response["table_name"]);
      $response["table_name"] = null;
    }
  } elseif($dryrun === true) {
    // Discard our temporary table
    $file_db->exec("DROP TABLE " . $response["table_name"]);
    $response["table_name"] = null;
  }

  return $response;
}

function createPollingPlaceGeoJSON($electionId) {
  $geoJSONFeatures = [];
  $pollingPlaces = fetchAllPollingPlaces($electionId);

  if(count($pollingPlaces) > 0) {
    foreach($pollingPlaces as $row) {
      $feature = new stdClass();
      $feature->type = "Feature";
      $feature->geometry = new stdClass();
      $feature->geometry->type = "Point";
      $feature->geometry->coordinates = [$row["lon"], $row["lat"]];
      $feature->properties = new stdClass();
      $feature->properties->id = $row["id"];
      $feature->properties->has_bbq = $row["has_bbq"];
      $feature->properties->has_caek = $row["has_caek"];
      $feature->properties->has_nothing = $row["has_nothing"];
      $feature->properties->has_run_out = $row["has_run_out"];

      $geoJSONFeatures[] = $feature;
    }
  }

  $geojsonFeatureCollection = new stdClass();
  $geojsonFeatureCollection->type = "FeatureCollection";
  $geojsonFeatureCollection->features = $geoJSONFeatures;

  $existing = "./elections/election-$electionId.geojson";
  $tmp = "./elections/election-$electionId.geojson.tmp";
  file_put_contents($tmp, json_encode($geojsonFeatureCollection));
  rename($tmp, $existing);
}

function regeneratePollingPlaceGeoJSON($electionId) {
  // Send a HTTP request to $url that doesn't wait for a response?
  // $url = BASE_URL."/api.php?regenerate-geojson=1&electionId=10";
  
  createPollingPlaceGeoJSON($electionId);
}

function fetchNearbyPollingPlaces($electionId, $lat, $lon) {
  $election = fetchElection($electionId);
  $pollingPlaces = fetchMatchingPollingPlaceByLocation($election["db_table_name"], $lat, $lon, 10000);

  usort($pollingPlaces, function ($item1, $item2) {
      return $item1['distance_metres'] <=> $item2['distance_metres'];
  });

  return array_slice($pollingPlaces, 0, 15);
}
?>