<?php
ini_set("display_errors", 1);
require_once "../secrets.php";
require_once "db.php";
require_once "modules/polling_places.php";
require_once "modules/elections.php";

function ppo($o) {
  echo "<pre>";
  print_r($o);
  echo "</pre>";
}

// UPDATE FOR PROD!!!!
$election = fetchElection(16);
// print_r($election);
// exit();
$data = json_decode(file_get_contents("./2018 SA Election Sausage Sizzle Map.json"));

foreach($data->features as $pp) {
  // print_r($pp);
  // echo "Foobar";

  $stmt = $file_db->query("SELECT * FROM " . $election["db_table_name"] . " WHERE premises LIKE LOWER(:premises)");
  $stmt->bindParam(":premises", strtolower("%" . trim($pp->properties->Name) . "%"));
  $stmt->execute();
  $row = $stmt->fetch(\PDO::FETCH_ASSOC);
  // print_r($row);

  if($row !== false) {
    if($row->has_bbq === false && $row->has_caek === false) {
      echo $pp->properties->Name . ": Found, and have no data<br />";
      // ppo($pp->properties);
      // ppo($row);
      // exit();
    } else {
      // echo "We already had it and have data!<br />";
    }
  } else {
    echo "<strong>" . $pp->properties->Name."</strong><br />";
    echo $pp->properties->description."<br /><br />";
    // echo "<u>Details</u><br />";
    // echo "Sizzle_details: " . $pp->properties->Sizzle_details."<br />";
    // echo "Cost_of_a_snag_in_bread: " . $pp->properties->Cost_of_a_snag_in_bread."<br />";
    // echo "Anything_else_: " . $pp->properties->Anything_else_."<br />";
    // echo "Bake_sale_or_market_: " . $pp->properties->Bake_sale_or_market_."<br />";
    echo "<br />";

    // ppo($pp->properties);
    // exit();
  }

}
?>