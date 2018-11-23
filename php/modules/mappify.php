<?php
require_once "db.php";

define("MAPPIFY_GEOCODER_API_URL", "http://mappify.io/api/rpc/address/geocode/");

$geocoderPKeyFieldName = "id";
$geocoderAllowedFields = array("address", "premises", "state", "suburb", "postcode", "result", "result_timestamp", "election_id");

function translateGeocodeResultFromDB($row) {
  return [
    "id" => (int)$row["id"],
    "address" => $row["address"],
    "premises" => $row["premises"],
    "state" => $row["state"],
    "suburb" => $row["suburb"],
    "postcode" => $row["postcode"],
    "result" => ($row["result"] !== "" && $row["result"] !== null) ? json_decode($row["result"]) : new stdClass(),
    "result_timestamp" => $row["result_timestamp"],
    "election_id" => (int)$row["election_id"],
  ];
}

function translateGeocodeResultToDB($row) {
  $new = [];
  foreach($row as $key => $val) {
    if(in_array($key, ["result"])) {
      $new[$key] = (gettype($val) === "string") ? $val : json_encode($val);
    } elseif(in_array($key, ["id", "election_id"])) {
      $new[$key] = (int)$val;
    } else {
      $new[$key] = $val;
    }
  }
  return $new;
}

function mappifyGeocoder($geocoderParams) {
  $ch = curl_init();

  if(isset($geocoderParams["premises"]) === true && isset($geocoderParams["address"]) === true) {
    $geocoderParams["streetAddress"] = $geocoderParams["premises"] . ", " . $geocoderParams["address"];
    unset($geocoderParams["address"]);
    unset($geocoderParams["premises"]);
  } else {
    $geocoderParams["streetAddress"] = $geocoderParams["address"];
    unset($geocoderParams["address"]);
  }
  // ppo($geocoderParams);
  // exit();

  // $params = [
  //   "streetAddress" => $streetAddress,
  //   "state" => $state,
  // ];
  // if($suburb !== "") {
  //   $params["suburb"] = $suburb;
  // }
  // if($suburb !== "") {
  //   $params["postcode"] = $postcode;
  // }

  curl_setopt($ch, CURLOPT_URL, MAPPIFY_GEOCODER_API_URL);
  curl_setopt($ch, CURLOPT_POST, 1);
  // curl_setopt($ch, CURLOPT_USERPWD, "api:" . MAILGUN_API_KEY);
  curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(array_merge($geocoderParams, ["apiKey" => MAPPIFY_API_KEY])));
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-type: application/json"]);

  $output = curl_exec($ch);
  $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  if($httpcode !== 200) {
    failForAPI($output);
  }
  return json_decode($output);
}

function addGeocoderResult($params) {
  global $file_db, $geocoderAllowedFields;

  $insert = fieldsToInsertSQL("geocoder_results", $geocoderAllowedFields, array_keys($params), $params);
  $stmt = $file_db->prepare($insert);
  return fieldsToStmntLastInsertId($stmt, $geocoderAllowedFields, translateGeocodeResultToDB($params));
}

function getGeocoderResultFromDB($geocoderParams) {
  global $file_db;

  $sql = "SELECT * FROM geocoder_results WHERE address = :address AND state = :state";
  if(isset($geocoderParams["suburb"])) {
    $sql .= " AND suburb = :suburb";
  }
  if(isset($geocoderParams["postcode"])) {
    $sql .= " AND postcode = :postcode";
  }
  if(isset($geocoderParams["premises"]) === true && isset($geocoderParams["address"]) === true) {
    $sql .= " AND premises = :premises";
  }

  $stmt = $file_db->query($sql);
  // echo $sql."<br>";
  // print_r($geocoderParams);
  // echo '<br>';
  $stmt->bindParam(":state", $geocoderParams["state"]);
  $stmt->bindParam(":address", $geocoderParams["address"]);
  if(isset($geocoderParams["premises"])) {
    $stmt->bindParam(":premises", $geocoderParams["premises"]);
  }
  if(isset($geocoderParams["suburb"])) {
    $stmt->bindParam(":suburb", $geocoderParams["suburb"]);
  }
  if(isset($geocoderParams["postcode"])) {
    $stmt->bindParam(":postcode", $geocoderParams["postcode"]);
  }

  $stmt->execute();
  $row = $stmt->fetch(\PDO::FETCH_ASSOC);
  
  if($row === false) {
    return false;
  }

  return translateGeocodeResultFromDB($row);
}

function getPostcode(string $address) {
  $matchResult = preg_match_all('/[0-9]{4}/', $address, $matches);
  if(count($matches) === 1 && count($matches[0]) === 1) {
    return (int)$matches[0][0];
  } else {
    $lastMatch = (int)array_pop($matches[0]);
    // Quick test to ensure the last match looks like an Australian postcode
    if($lastMatch >= 800 && $lastMatch <= 7799) {
      return $lastMatch;
    }
  }
  return false;
}

function getGeocoderParams($pollingPlace) {
  $params = [];
  
  // Crude matching of Australian-based polling booths
  $postcode = getPostcode($pollingPlace["address"]);
  if($postcode !== false) {
    $params["postcode"] = $postcode;
    $params["state"] = $pollingPlace["state"];

    // It's usually best to send both the name of the place (e.g. Something Primary School)
    // alongside the street address.
    if(stristr($pollingPlace["address"], $pollingPlace["premises"]) === false) {
      $params["address"] = str_replace("  ", "", $pollingPlace["address"]);
      $params["premises"] = $pollingPlace["premises"];
    } else {
      $params["address"] = str_replace("  ", "", $pollingPlace["address"]);
    }

  } else {
  // Probably overseas. Ignore these for now.
    return false;
  }

  return $params;
}
?>