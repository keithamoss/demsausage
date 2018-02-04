<?php
header("Content-type: application/json");
header("Access-Control-Allow-Origin: *");
ob_start("ob_gzhandler");

$electionId = $_GET["id"];
if(is_numeric($electionId)) {
  $geojson = "./election-$electionId.geojson";
  if(file_exists($geojson) === true) {
    echo file_get_contents($geojson);
  }
}
?>