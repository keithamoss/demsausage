<?php
require_once "raven.php";
require_once "secrets.php";
require_once "auth.php";
require_once "db.php";

############################
# Public Endpoints
############################
// Fetch Elections
if(stristr($_SERVER["QUERY_STRING"], "fetch-elections") !== false) {
  $elections = fetchPublicElections();
  echo json_encode($elections);
  closeDb();
}

// Regenerate Polling Place GeoJSON
if(stristr($_SERVER["QUERY_STRING"], "regenerate-geojson") !== false) {
  createPollingPlaceGeoJSON($_GET["electionId"]);
  closeDb();
}

// Add Pending Stall
if(stristr($_SERVER["QUERY_STRING"], "add-stall") !== false) {
  $stallId = addPendingStall($_GET["stall"], $_GET["electionId"]);
  if($stallId === false) {
    failForAPI("Error adding stall.");
  } else {
    echo json_encode(["id" => $stallId]);
    closeDb();
  }
  closeDb();
}

// Confirm Email
if(stristr($_SERVER["QUERY_STRING"], "confirm-email") !== false) {
  if(confirmEmailOptin($_GET["confirm_key"]) === true) {
    echo "Email Confirmed :)";
  }
  closeDb();
}

// Fetch nearby polling places
if(stristr($_SERVER["QUERY_STRING"], "fetch-nearby-polling-places") !== false) {
  echo json_encode(fetchNearbyPollingPlaces($_GET["electionId"], $_GET["lat"], $_GET["lon"]));
  closeDb();
}

// Fetch polling place by ids
if(stristr($_SERVER["QUERY_STRING"], "fetch-polling-places") !== false) {
  $pollingPlaces = fetchPollingPlaces($_GET["pollingPlaceIds"], $_GET["electionId"]);
  echo json_encode($pollingPlaces);
  closeDb();
}


############################
# Super User Endpoints
############################
// Fetch All Elections
if(stristr($_SERVER["QUERY_STRING"], "fetch-all-elections") !== false) {
  $elections = fetchAllElections();
  echo json_encode($elections);
  closeDb();
}

// Fetch pending stalls
if(stristr($_SERVER["QUERY_STRING"], "fetch-pending-stalls") !== false) {
  if(isAuthorisedUser("su") === false) {
    failForAuthReasons();
  }

  $stalls = fetchPendingStalls();
  echo json_encode($stalls);
  closeDb();
}

// Mark pending stall as read (approved)
if(stristr($_SERVER["QUERY_STRING"], "mark-read-pending-stall") !== false) {
  if(isAuthorisedUser("su") === false) {
    failForAuthReasons();
  }
  
  $rowCount = markPendingStallAsRead($_GET["id"]);
  if($rowCount !== 1) {
    failForAPI("Failed to mark pending stall as read. (Error: $rowCount)");
  } else {
    echo json_encode(["rows" => $rowCount]);
    closeDb();
  }
  // closeDb();
}

// Mark pending stall as read (approved) and add an unofficial polling place
if(stristr($_SERVER["QUERY_STRING"], "mark-read-pending-stall-and-add-polling-place") !== false) {
  if(isAuthorisedUser("su") === false) {
    failForAuthReasons();
  }
  
  $rowCount = markPendingStallAsReadAndAddUnofficialPollingPlace($_GET["id"]);
  if($rowCount !== 1) {
    failForAPI("Failed to mark pending stall as read. (Error: $rowCount)");
  } else {
    echo json_encode(["rows" => $rowCount]);
    closeDb();
  }
  // closeDb();
}

// Mark pending stall as declined
if(stristr($_SERVER["QUERY_STRING"], "mark-declined-pending-stall") !== false) {
  if(isAuthorisedUser("su") === false) {
    failForAuthReasons();
  }
  
  $rowCount = markPendingStallAsDeclined($_GET["id"]);
  if($rowCount !== 1) {
    failForAPI("Failed to mark pending stall as declined. (Error: $rowCount)");
  } else {
    echo json_encode(["rows" => $rowCount]);
    closeDb();
  }
  // closeDb();
}

// Create election
if(stristr($_SERVER["QUERY_STRING"], "create-election") !== false) {
  if(isAuthorisedUser("su") === false) {
    failForAuthReasons();
  }
  
  $newElection = createElection($_GET["election"]);
  if($newElection === false) {
    failForAPI("Failed to create election. (Error: $rowCount)");
  } else {
    echo json_encode($newElection);
    closeDb();
  }
  closeDb();
}

// Update election
if(stristr($_SERVER["QUERY_STRING"], "update-election") !== false) {
  if(isAuthorisedUser("su") === false) {
    failForAuthReasons();
  }
  
  $rowCount = updateElection($_GET["electionId"], $_GET["election"]);
  if($rowCount !== 1) {
    failForAPI("Failed to update election. (Error: $rowCount)");
  } else {
    echo json_encode(["rows" => $rowCount]);
    closeDb();
  }
}

// Load polling places to election
if(stristr($_SERVER["QUERY_STRING"], "load-polling-places") !== false) {
  if(isAuthorisedUser("su") === false) {
    failForAuthReasons();
  }

  // Check for file
  if(array_key_exists("file", $_FILES) === false) {
    failForAPI("Could not find file");
  }

  $response = loadPollingPlaces($_GET["electionId"], ($_GET["dryrun"] === "true") ? true : false, $_FILES["file"]);
  echo json_encode($response);
  closeDb();
}

// Fetch polling place types
if(stristr($_SERVER["QUERY_STRING"], "fetch-polling-place-types") !== false) {
  if(isAuthorisedUser("su") === false) {
    failForAuthReasons();
  }
  
  $pollingPlaceTypes = fetchPollingPlaceTypes($_GET["electionId"]);
  echo json_encode($pollingPlaceTypes);
  closeDb();
}

// Fetch polling places
if(stristr($_SERVER["QUERY_STRING"], "fetch-all-polling-places") !== false) {
  if(isAuthorisedUser("su") === false) {
    failForAuthReasons();
  }
  
  $pollingPlaces = fetchAllPollingPlaces($_GET["electionId"]);
  echo json_encode($pollingPlaces);
  closeDb();
}

// Search polling places
if(stristr($_SERVER["QUERY_STRING"], "search-polling-places") !== false) {
  if(isAuthorisedUser("su") === false) {
    failForAuthReasons();
  }
  
  $pollingPlaces = searchPollingPlaces($_GET["searchTerm"], $_GET["electionId"]);
  echo json_encode($pollingPlaces);
  closeDb();
}

// Update polling place
if(stristr($_SERVER["QUERY_STRING"], "update-polling-place") !== false) {
  if(isAuthorisedUser("su") === false) {
    failForAuthReasons();
  }
  
  $rowCount = updatePollingPlace($_GET["pollingPlaceId"], $_GET["pollingPlace"], $_GET["electionId"], true);
  if($rowCount !== 1) {
    failForAPI("Failed to update polling place. (Error: $rowCount)");
  } else {
    echo json_encode(["rows" => $rowCount]);
    closeDb();
  }
}

closeDb();
?>