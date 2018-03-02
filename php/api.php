<?php
require_once "raven.php";
require_once "secrets.php";
require_once "auth.php";
require_once "db.php";

############################
# Public Endpoints
############################
// Fetch Elections
if(stristr($_SERVER["QUERY_STRING"], "fetch-elections=1") !== false) {
  $elections = fetchPublicElections();
  echo json_encode($elections);
  closeDb();
}

// Regenerate Polling Place GeoJSON
if(stristr($_SERVER["QUERY_STRING"], "regenerate-geojson=1") !== false) {
  createPollingPlaceGeoJSON($_GET["electionId"]);
  closeDb();
}

// Add Pending Stall
if(stristr($_SERVER["QUERY_STRING"], "add-stall=1") !== false) {
  $stallId = addPendingStall($_GET["stall"], $_GET["electionId"]);
  if($stallId === false) {
    failForAPI("Error adding stall.");
  } else {
    echo json_encode(["id" => $stallId]);
    closeDb();
  }
  closeDb();
}

// Confirm Email Optin
if(stristr($_SERVER["QUERY_STRING"], "confirm-email=1") !== false) {
  if(confirmEmailOptin($_GET["confirm_key"]) === true) {
    echo "Email Confirmed :)";
  }
  closeDb();
}

// Confirm Email Optout
if(stristr($_SERVER["QUERY_STRING"], "confirm-email-optout=1") !== false) {
  if(confirmEmailOptout($_GET["confirm_key"]) === true) {
    echo "We've removed you from our mailing list :)";
  }
  closeDb();
}

// Fetch nearby polling places
if(stristr($_SERVER["QUERY_STRING"], "fetch-nearby-polling-places=1") !== false) {
  echo json_encode(fetchNearbyPollingPlaces($_GET["electionId"], $_GET["lat"], $_GET["lon"]));
  closeDb();
}

// Fetch polling place by ids
if(stristr($_SERVER["QUERY_STRING"], "fetch-polling-places=1") !== false) {
  $pollingPlaces = fetchPollingPlaces($_GET["pollingPlaceIds"], $_GET["electionId"]);
  echo json_encode($pollingPlaces);
  closeDb();
}

// Search polling places
if(stristr($_SERVER["QUERY_STRING"], "search-polling-places=1") !== false) {
  $pollingPlaces = searchPollingPlaces($_GET["searchTerm"], $_GET["electionId"]);
  echo json_encode($pollingPlaces);
  closeDb();
}


############################
# Super User Endpoints
############################
// Fetch All Elections
if(stristr($_SERVER["QUERY_STRING"], "fetch-all-elections=1") !== false) {
  $elections = fetchAllElections();
  echo json_encode($elections);
  closeDb();
}

// Fetch pending stalls
if(stristr($_SERVER["QUERY_STRING"], "fetch-pending-stalls=1") !== false) {
  if(isAuthorisedUser("su") === false) {
    failForAuthReasons();
  }

  $stalls = fetchPendingStalls();
  echo json_encode($stalls);
  closeDb();
}

// Mark pending stall as read (approved)
if(stristr($_SERVER["QUERY_STRING"], "mark-read-pending-stall=1") !== false) {
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
if(stristr($_SERVER["QUERY_STRING"], "mark-read-pending-stall-and-add-polling-place=1") !== false) {
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
if(stristr($_SERVER["QUERY_STRING"], "mark-declined-pending-stall=1") !== false) {
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
if(stristr($_SERVER["QUERY_STRING"], "create-election=1") !== false) {
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
if(stristr($_SERVER["QUERY_STRING"], "update-election=1") !== false) {
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
if(stristr($_SERVER["QUERY_STRING"], "load-polling-places=1") !== false) {
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

// Download election
if(stristr($_SERVER["QUERY_STRING"], "download-election=1") !== false) {
  if(isAuthorisedUser("su") === false) {
    failForAuthReasons();
  }
  
  $response = downloadElection($_GET["electionId"]);
  if($response !== true) {
    failForAPI("Failed to download election. Oops.");
  } else {
    closeDb();
  }
}

// Fetch polling place types
if(stristr($_SERVER["QUERY_STRING"], "fetch-polling-place-types=1") !== false) {
  if(isAuthorisedUser("su") === false) {
    failForAuthReasons();
  }
  
  $pollingPlaceTypes = fetchPollingPlaceTypes($_GET["electionId"]);
  echo json_encode($pollingPlaceTypes);
  closeDb();
}

// Fetch polling places
if(stristr($_SERVER["QUERY_STRING"], "fetch-all-polling-places=1") !== false) {
  if(isAuthorisedUser("su") === false) {
    failForAuthReasons();
  }
  
  $pollingPlaces = fetchAllPollingPlaces($_GET["electionId"]);
  echo json_encode($pollingPlaces);
  closeDb();
}

// Update polling place
if(stristr($_SERVER["QUERY_STRING"], "update-polling-place=1") !== false) {
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