<?php
// SELECT ST_X(the_geom) AS lon, ST_Y(the_geom) AS lat, * FROM federal_2016_polling_places_v1_1
require_once "auth.php";
require_once "db.php";

############################
# Public Endpoints
############################
// Fetch Elections
if(stristr($_SERVER["QUERY_STRING"], "fetch-elections") !== false) {
  $elections = fetchElections();
  echo json_encode($elections);
  closeDb();
}

// Add Pending Stall
if(stristr($_SERVER["QUERY_STRING"], "add-stall") !== false) {
  // $params = array("stall_name" => "Foo", "stall_description" => "Bar");
  // addPendingStall($params);
  closeDb();
}

############################
# Super User Endpoints
############################
if(isAuthorisedUser("su")) {
  // Fetch pending stalls
  if(stristr($_SERVER["QUERY_STRING"], "fetch-pending-stalls") !== false) {
    $stalls = fetchPendingStalls();
    echo json_encode($stalls);
    closeDb();
  }

  // Mark pending stall as read
  if(stristr($_SERVER["QUERY_STRING"], "mark-read-pending-stall") !== false) {
    $rowCount = markPendingStallAsRead($_GET["id"]);
    if($rowCount !== 1) {
      failForAPI("Failed to mark pending stall as read. (Error: $rowCount)");
    } else {
      echo json_encode(["rows" => $rowCount]);
      closeDb();
    }
    // closeDb();
  }

  // Create election
  if(stristr($_SERVER["QUERY_STRING"], "create-election") !== false) {
    $rowCount = createElection($_GET["election"]);
    if($rowCount !== 1) {
      failForAPI("Failed to create election. (Error: $rowCount)");
    } else {
      echo json_encode(["rows" => $rowCount]);
      closeDb();
    }
    closeDb();
  }

  // Update election
  if(stristr($_SERVER["QUERY_STRING"], "update-election") !== false) {
    $rowCount = updateElection($_GET["electionId"], $_GET["election"]);
    if($rowCount !== 1) {
      failForAPI("Failed to update election. (Error: $rowCount)");
    } else {
      echo json_encode(["rows" => $rowCount]);
      closeDb();
    }
  }

  // Search polling places
  if(stristr($_SERVER["QUERY_STRING"], "search-polling-places") !== false) {
    $pollingPlaces = searchPollingPlaces($_GET["searchTerm"], $_GET["electionName"]);
    echo json_encode($pollingPlaces);
    closeDb();
  }
  
  // Fetch polling place by ids
  if(stristr($_SERVER["QUERY_STRING"], "fetch-polling-places") !== false) {
    $pollingPlaces = fetchPollingPlaces($_GET["pollingPlaceIds"], $_GET["electionName"]);
    echo json_encode($pollingPlaces);
    closeDb();
  }

  // Update polling place
  if(stristr($_SERVER["QUERY_STRING"], "update-polling-place") !== false) {
    $rowCount = updatePollingPlace($_GET["pollingPlaceId"], $_GET["pollingPlace"], $_GET["electionName"]);
    if($rowCount !== 1) {
      failForAPI("Failed to update polling place. (Error: $rowCount)");
    } else {
      echo json_encode(["rows" => $rowCount]);
      closeDb();
    }
  }
}

closeDb();
?>