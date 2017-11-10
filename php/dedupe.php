<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$data = dsQuery("SELECT COUNT(*) as ttl, address FROM federal_2016_polling_places_v1_1 GROUP BY address HAVING COUNT(*) > 1 ORDER BY COUNT(*) DESC");

// echo '<pre>';
// print_r($data);
// echo '</pre>';

// t0.has_bbq = true or t0.has_caek = true or t0.has_nothing = true or t0.has_other != ''

function hasdata($row) {
  return ($row->has_bbq === true || $row->has_caek == true || $row->has_nothing == true || $row->has_other != '');
}

foreach($data->rows as $row) {
  $address = str_replace("'", "%27", $row->address);
  $booths = dsQuery("SELECT * FROM federal_2016_polling_places_v1_1 WHERE address = '$address'");
  echo count($booths->rows).' vs ' . $row->ttl . ': ' . $row->address .'<br>';

  $cnt = 0;
  $boothwithdata = null;
  foreach($booths->rows as $booth) {
    echo $booth->cartodb_id.'<br>';
    if(hasdata($booth)) {
      $cnt += 1;
      $boothwithdata = $booth;
    }
  }
  echo 'Count: ' .$cnt.'<br>';

  if($cnt == 1) {
    $sql = "DELETE FROM federal_2016_polling_places_v1_1 WHERE address = '$address' AND cartodb_id != $boothwithdata->cartodb_id";
    echo $sql.'<br>';
    // $query = dsQuery($sql);
    // print_r($query);

  } elseif($cnt == 0) {
    $sql = "DELETE FROM federal_2016_polling_places_v1_1 WHERE address = '$address' AND cartodb_id != $booth->cartodb_id";
    echo $sql.'<br>';
    // $query = dsQuery($sql);
    // print_r($query);

  } elseif($cnt > 1) {

  }
  echo '<hr>';
}

function dsQuery($query) {
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
    $body = json_decode($response);
    if(isset($body->error)) {
      echo 'JSON Error<br>';
      print_r($body);
      exit;
    }
    return $body;
  }
}
?>