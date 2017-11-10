<?php
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

function hasdata($row) {
  return ($row->has_bbq === true || $row->has_caek == true || $row->has_nothing == true || $row->has_other != '');
}

function do_we_match($ds, $ess) {
  if($ds->has_bbq != $ess->has_bbq || $ds->has_caek != $ess->has_caek) {
    // echo '1<br>';
    return false;
  }

  // Check has_other
  $ds_other = (array)json_decode($ds->has_other);
  $ess_other = (array)$ess->has_other;

  // echo in_array("has_halal", $ds_other).'<br>';
  // echo gettype(in_array("has_halal", $ds_other)).'<br>';
  // echo (int)in_array("has_halal", $ds_other).'<br>';
  // echo in_array("has_halal", $ess_other).'<br>';
  // echo gettype(in_array("has_halal", $ess_other)).'<br>';
  // echo (int)in_array("has_halal", $ess_other).'<br>';
  // if(in_array("has_halal", $ds_other) !== in_array("has_halal", $ess_other)) {
  //   echo '1.5<br>';
  //   return false;
  // }
  // print_r($ds_other);
  // echo '<br>';
  // print_r($ess_other);
  // echo '<br>';

  foreach($ess_other as $key => $val) {
    if(in_array($key, $ds_other) && $val !== $ds_other[$key]) {
      // echo '3';
      return false;
    }
  }

  /*
  if($ds_other["has_halal"] !== $ess_other["has_halal"]) {
    // echo '2<br>';
    return false;
  }


  if(in_array("has_coffee", $ds_other) != in_array("has_coffee", $ess_other)) {
    // echo '2.5<br>';
    return false;
  }
  if($ds_other["has_coffee"] !== $ess_other["has_coffee"]) {
    // echo '3<br>';
    return false;
  }


  if(in_array("has_bacon_and_eggs", $ds_other) != in_array("has_bacon_and_eggs", $ess_other)) {
    // echo '3.5<br>';
    return false;
  }
  if($ds_other["has_bacon_and_eggs"] !== $ess_other["has_bacon_and_eggs"]) {
    // echo '4<br>';
    return false;
  }
  */

  return true;
}

$essdata = getESSData();
$dsdata = getDSData();
$dsttl = 0;
$essttl = 0;

$diff = array();
foreach($dsdata->rows as $row) {
  // if($row->ppid == 1825) {
    // echo "<pre>";
    // print_r($row);
    // echo "</pre>";
    // exit;
  // }

  // if($row->ppid != 645) {
  //   continue;
  // }

  if(isset($essdata[$row->ppid])) {
    // echo 'In ESS<br>';
    $essstall = $essdata[$row->ppid];

    $other = array();
    if($essstall->StallHalal === "Y") {
      $other["has_halal"] = true;
    }
    if($essstall->StallCoffee === "Y") {
      $other["has_coffee"] = true;
    }
    if($essstall->StallBaconEgg === "Y") {
      $other["has_bacon_and_eggs"] = true;
    }

    $normalise_ess = (object)array(
      "premises" => $essstall->PremisesName,
      "has_bbq" => ($essstall->SausageSizzle === "Y") ? true : false,
      "has_caek" => ($essstall->CakeStall === "Y") ? true : false,
      "has_other" => $other,
      "ess_stall_url" => $essstall->MoreInformationUrl,
      "ess_stall_id" => $essstall->StallId,
      "stall_name" => $essstall->StallName,
      "stall_description" => ($essstall->StallDescription == null) ? "" : $essstall->StallDescription
    );

    if($row->premises != $normalise_ess->premises) {
      // echo 'Premises no match<br>';
      // echo "<pre>";
      // print_r($normalise_ess);
      // echo "</pre>";
      // For now just throw out the ones we don't match on - there's not many
      continue;
    }

    /*
    // Sync over stall name, description (if we don't have them), ess id, and ess_url
    // UPDATE federal_2016_polling_places_v1_1 SET has_bbq = true, has_caek = false, has_nothing = false, has_run_out = false, has_other = '{"has_halal":true}', stall_name = 'Riverwood Public School P&C Sausage Sizzle', stall_description = 'We will be selling halal sausages on a long roll with sauce. Onion optional  $2.00 each  Can of soft drink or water  $1.00 each Bag of mixed lollies $1.00 each', ess_stall_id = 2448, ess_stall_url = http://www.electionsausagesizzle.com.au/federal-election-2016/sausage-sizzl…2448/Riverwood-Public-School-Riverwood-Public-School-P&C-Sausage-Sizzle/no, latest_report = now() WHERE cartodb_id = 38

    $ess_stall_id = $normalise_ess->ess_stall_id;
    $ess_stall_url = $normalise_ess->ess_stall_url;
    $cartodb_id = $row->cartodb_id;

    if(!empty($row->stall_name)) {
      // continue;
      // echo 'DS<br>';
      // $stall_name = $row->stall_name;
      // $stall_description = $row->stall_description;
      // $source = $row->source;
      $dsttl += 1;

      $sql = "UPDATE federal_2016_polling_places_v1_1 SET ess_stall_id = $ess_stall_id, ess_stall_url = '$ess_stall_url' WHERE cartodb_id = $cartodb_id";

    } else {
      $stall_name = $normalise_ess->stall_name;
      $stall_description = str_replace("'", "%27", $normalise_ess->stall_description);
      $source = "Election Sausage Sizzle";
      $essttl += 1;

      $sql = "UPDATE federal_2016_polling_places_v1_1 SET stall_name = '$stall_name', stall_description = '$stall_description', source = '$source', ess_stall_id = $ess_stall_id, ess_stall_url = '$ess_stall_url' WHERE cartodb_id = $cartodb_id";
    }

    // echo '<pre>';
    // print_r($normalise_ess);
    // echo '</pre>';
    // echo '<pre>';
    // print_r($row);
    // echo '</pre>';

    echo $sql.'<br>';
    insertDSData($sql);
    // exit;
    // echo $sql;
    // exit;
    */

    if(do_we_match($row, $normalise_ess) === false && !hasdata($row)) {
      // echo 'Nope<br>';
      $temp = $row;
      $temp->ess = $normalise_ess;
      $diff[] = $temp;
    }

    // echo "<pre>";
    // print_r($row);
    // echo "</pre>";
    // echo "<pre>";
    // print_r($essstall);
    // echo "</pre>";
    // echo "<pre>";
    // print_r($normalise_ess);
    // echo "</pre>";
    // echo "<hr>";

    // exit;
    // $diffrow = array(

    // );
  }
}

// echo count($diff) . "<br>";
// echo "<pre>";
// print_r($diff);
// echo "</pre>";

// echo '$essttl: ' . $essttl.'<br>';
// echo '$dsttl: ' . $dsttl.'<br>';

header("Access-Control-Allow-Origin: *");
header("Content-type: application/json");
echo json_encode(array("pollingplaces" => $diff));


function getESSData() {
  $curl = curl_init();
  
  curl_setopt_array($curl, array(
    CURLOPT_URL => "http://www.electionsausagesizzle.com.au/api/stalls",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => array(
      "cache-control: no-cache",
      "key: jY1eGkfM9xANynsXsmhxDN4k2taM0pBFYxtt6UDe4IOMuIAhdV2EgGPVY25gsVaKGhxVjF"
    ),
  ));
  
  $response = curl_exec($curl);
  $err = curl_error($curl);
  
  curl_close($curl);
  
  if ($err) {
    echo "cURL Error #:" . $err;
    exit;
  } else {
    $byppid = array();
    $stalls = json_decode($response);
    foreach($stalls->Stalls as $stall) {
      $byppid[$stall->PPId] = $stall;
    }
    return $byppid;
  }
}

function getDSData() {
  $curl = curl_init();

  $sql = "SELECT *, ST_X(the_geom) as lng, ST_Y(the_geom) as lat FROM federal_2016_polling_places_v1_1";
  
  curl_setopt_array($curl, array(
    CURLOPT_URL => "https://democracy-sausage.cartodb.com/api/v2/sql?q=".urlencode($sql),
    CURLOPT_RETURNTRANSFER => true
  ));
  
  $response = curl_exec($curl);
  $err = curl_error($curl);
  
  curl_close($curl);
  
  if ($err) {
    echo "cURL Error #:" . $err;
    exit;
  } else {
    return json_decode($response);
  }
}

function insertDSData($query) {
  $curl = curl_init();

  // $sql = "SELECT *, ST_X(the_geom) as lng, ST_Y(the_geom) as lat FROM federal_2016_polling_places_v1_1";
  
  curl_setopt($curl, CURLOPT_URL, "https://democracy-sausage.cartodb.com/api/v2/sql?" . http_build_query(array(
    "q" => $query,
    "api_key" => "5643cf53bc8c62f1df6de3ec9b3d1aedf82d02c9"
  )));
  curl_setopt_array($curl, array(
    CURLOPT_RETURNTRANSFER => true
  ));
  
  $response = curl_exec($curl);
  $err = curl_error($curl);
  
  curl_close($curl);
  
  if ($err) {
    echo "cURL Error #:" . $err;
    exit;
  } else {
    return json_decode($response);
  }
}
?>