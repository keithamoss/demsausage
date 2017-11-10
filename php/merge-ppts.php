<?php
$dsdata = getDSData();
foreach($dsdata->rows as $row) {
    $new = getDSDataRow($row->cartodb_id);
    $ppt = $new->rows[0]->polling_place_type;

    $query = "UPDATE wa_2017_polling_places_v1_1 SET polling_place_type = '$ppt' WHERE cartodb_id = " . $row->cartodb_id;

    echo $query.'<br>';
    updateDSData($query);
    // echo '<br>';
    // exit;
}



function getDSData() {
  $curl = curl_init();

  $sql = "SELECT cartodb_id, polling_place_name FROM wa_2017_polling_places_v1_1";
//   $sql = "SELECT cartodb_id, polling_place_name FROM wa_2017_polling_places_v1_1 WHERE polling_place_type != '";
  
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

function getDSDataRow($cartodb_id) {
  $curl = curl_init();

  $sql = "SELECT cartodb_id, polling_place_type FROM wa_2017_polling_places_v1_1_helen_update WHERE cartodb_id = " . $cartodb_id;
  
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

function updateDSData($query) {
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