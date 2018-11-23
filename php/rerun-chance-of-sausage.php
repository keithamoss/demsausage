<?php
ini_set("display_errors", 1);
require_once "../secrets.php";
require_once "db.php";
require_once "modules/polling_places.php";
require_once "modules/elections.php";
// require_once "modules/mappify.php";
require_once "modules/google.php";

function ppo($o) {
  echo "<pre>";
  print_r($o);
  echo "</pre>";
}

/* Are premises unique between the two Federal elections? */
/*
$fed13 = fetchElection(1);
$fed16 = fetchElection(9);

$pollingPlaces13 = fetchAllPollingPlacesByElectionTableName($fed13["db_table_name"]);
$pollingPlaces16 = fetchAllPollingPlacesByElectionTableName($fed16["db_table_name"]);
// $pollingPlaces13 = array_slice($pollingPlaces13, 0, 10);

foreach($pollingPlaces13 as $pollingPlace) {
  $filtered = array_filter($pollingPlaces16, function($pp) use ($pollingPlace) {
    return $pp["premises"] === $pollingPlace["premises"];
  });

  if(count($filtered) > 1) {
    echo "Foo #1: " . $pollingPlace["premises"] . " (" . count($filtered) . ")<br />";
  } elseif(count($filtered) < 1) {
    // echo "Foo #2: " . $pollingPlace["premises"] . " (" . count($filtered) . ")<br />";
  } else {
    // echo "Foo #3: " . $pollingPlace["premises"] . " (" . count($filtered) . ")<br />";
  }
}
exit();
*/


# Dupes from geocoding - probably all PPVC's
// Gayndah Court House, 20 Capper St GAYNDAH QLD 4625
// Maclean Civic Hall, 48 River St MACLEAN NSW 2463
// Blackwater State School, 43 Wey St BLACKWATER QLD 4717
// Merrijig Community Hall, Mt Buller Rd MERRIJIG VIC 3723
// Esperance Civic Centre, Council Pl ESPERANCE WA 6450
// Mareeba State School Assembly Hall, Constance St MAREEBA QLD 4880
// Merrilands Hall, Robert St ATHERTON QLD 4883
// Parkes Shire Council, Bogan St PARKES NSW 2870
// Ingham State School, 28 McIlwraith St INGHAM QLD 4850
// Nanango State High School, 54 Elk St NANANGO QLD 4615
// Tully Court House, 46 Bryant St TULLY QLD 4854
// Royal Adelaide Hospital, North Tce ADELAIDE SA 5000
// St Paul's Anglican Church Hall, 2 Corundum St STANTHORPE QLD 4380
// Coppabella State School, Mathieson St COPPABELLA QLD 4741
// Middlemount Community School, James Randall Dr MIDDLEMOUNT QLD 4746
// Cooinda, 32 Flinders Tce PORT AUGUSTA SA 5700
// Dalrymple Shire Chambers, 12-14 Mosman St CHARTERS TOWERS QLD 4820
// Northcote North Baptist Church Hall, 542 High St NORTHCOTE VIC 3070
// Nebo Memorial Hall, Reynolds St NEBO QLD 4742
// Narooma Sport and Leisure Centre, Bluewater Dr NAROOMA NSW 2546
// National Parks & Wildlife Offices, Kosciuszko Rd PERISHER VALLEY NSW 2630
// Forbes Town Hall, Harold St FORBES NSW 2871
// Harrietville Community Hall, 210 Great Alpine Rd HARRIETVILLE VIC 3741
// Portland Civic Centre, 30 Bentinck St PORTLAND VIC 3305
// Charleville & District Cultural Centre, 96 Alfred St CHARLEVILLE QLD 4470
// Manjimup Town Hall, Rose St MANJIMUP WA 6258
// Wonthaggi Senior Citizens Centre, 46-50 Murray St WONTHAGGI VIC 3995
// Bowen Anglican Church Hall, Gordon St BOWEN QLD 4805
// Mission Beach Progress Hall, Porters Prmnde MISSION BEACH QLD 4854
// Kalbarri District High School, 48 Hackney St KALBARRI WA 6536
// Newman Primary School, Hilditch Ave NEWMAN WA 6753
// Winton Court House, 59 Vindex St WINTON QLD 4735
// Pilgrim House, 69 Northbourne Ave CANBERRA CITY ACT 2601
// Cloncurry State School, Daintree St CLONCURRY QLD 4824
// Norseman Town Hall, Prinsep St NORSEMAN WA 6443
// Busselton Senior High School, Queen Elizabeth Ave BUSSELTON WA 6280


/* Validate geocoder results for Fed 2013 */

// How handle lack of comma before postcode in the address for matching future elections?
  // Can we make state, postcode, and premises with enough certainity?

// How handle pre-poll dupes? Better dupe checking than whatever the current check is?
  // But in the case of Parkes Shire Council the locations are off - so we couldn't use that. We only have the premises as a flag. And the addresses are slightly different (albeit whitespace only)
  // Forbes Town Hall dupes?

// Don't make postcodes ints in the database? e.g. 0820 52 Parap Road is stored as 820

// For chance of sausage/polling place type it seems to make sense to step the geocoder out - e.g. find everything in 50, 100, 150, et cetera (to max 400?) and stop when you get a result, possibly also checking the premises is the same? There have been a few cases where wonky geocodes have meant the closest polling place is actually the wrong one - but if we're making sure the geocodes are accurate then that disappears as an issue (hopefully)

// For geocoding we might want to only send the premises if the address doesn't start with numbers
// Including the premises name seems to confuse it (e.g. Shoreham Community Hall)
// Only include premises for schools (which should be well known) where there isn't an address starting with a number (reasonably common)
// Of the 871 ZERO_RESULTS it looks like about half start with a number like a regular address. The others are various 'Public Halls' and may still have issues. It's possible we'll just have to suck it up and accept that the EC's have mapped these - usually very regional places - with as much accuracy as we'll get without doing them all by-hand.

// Think about the geocoding process for elections >= 1. SAY we get a good basis of accurate locations through a mix of automatic and manual geocoding, what will the process be for loading new data? If the EC location is close enough (within 400m and matches premises name) we can probably safely overwrite the supplied coordinates with ours, but if we're way off (or the premises doesn't match) we'll have to have a way of geocoding by hand as part of the load process.

// Urgh...can we skip all of this and just do it based on premises? And handle the manual fixing of premises names to deal with typos, and some diffing at load time to see new/removed to catch EC's fixing typos? Accurate locations are currently used for two things:
// 1. For users - finding polling places near them. This doesn't have to be super accurate, just accurate enough to within a few hundred metres. BUT if it is way off (like that case of a pp in the wrong suburb, then it breaks for them).
// 2. For admins - Chance of Sausage and setting Polling Place Type. This has to be more accurate since we match based on historical polling place data - and MUST get all matches to make CoS work.

// IF we did that matching based on premises name + postcode + state we as admins might be OK - minus some manual fixing of premises names.
// How would we know if a name needed to be fixed? No matches based on historical + there's polling places in range based on coordinates (but..if we can't trust those...urgh)

// We might need a special rule for schools and hospitals that lets the range go out to a few hundred metres (not 75m) before automatically choosing to overwrite the location. Or that uses the northeast / southwest points to checks too - and if those are within 75m it's all sweet.


// Hi there Future Keith,
// Here's a bit of an essay on the troubles with geocoding so far. There's a few suggestions for rules to apply in here that could be pretty quickly implemented to test how far we can take automating this process. I think we want to aim for >= 90% automated geocoding for polling places for Election #1. On the basis that future elections would only increase that % as we accrue better and better location data.
// The alternative is to abandon accurate locations altogether and rely on what the EC's give us - that puts us in a world of having to rely on premises names (+ postcode + state) and deal with fixing those by-hand. Also not a very attractive option given the whole goal of this loading process was to make it EASY and QUICK and involve LITTLE human intervention.
// At this point I think we should implement the rules suggested above and see how far we can get with the Fed 13 data - this would require copying its table and updating lat/lons. If we can get that to >= 90% run the SA 18 data through the same process and against the copied Fed 13 data and see if we can also get that >= 90% and how much manual fucking about is required.
// This will require about a day's worth of concentration to tackle properly and get a conclusion :)
// Good luck!
// P.S. You'll also find suggestions here for other bits of the loading process - like better checking for Pre-Poll/PPVCs by checking for duplicate premises names in data.


$electionId = 1;
$elections = [$electionId];
$earthRadiusAt24S = 6374624; // @TODO Make this dynamic?
// $earthRadiusAt34S = 6371819;
foreach($elections as $electionId) {
  $election = fetchElection($electionId);

  $pollingPlaces = fetchAllPollingPlacesByElectionTableName($election["db_table_name"]);
  $pollingPlaces = array_slice($pollingPlaces, 0, 100);
  foreach($pollingPlaces as $pollingPlace) {
    $geocoderParams = getGeocoderParams($pollingPlace);
    $location = null;

    if($geocoderParams !== false) {
      $result = getGeocoderResultFromDB($geocoderParams);

      // No cached result from the geocoder
      if($result === false) {
        // echo '<strong>'.$pollingPlace["premises"].', '.$pollingPlace["address"].'</strong> (No Cached Result)<br>';
      } else {
      // Cached result
        // echo '<strong>'.$pollingPlace["premises"].', '.$pollingPlace["address"].'</strong><br>';
        if($result["result"]->status === "OK") {
          // $location = $result["result"]->result->location; // Mappify
          $location = $result["result"]->results[0]->geometry->location; // Google
          $location->lon = $location->lng;

          $distanceBetweenGeocoderAndPollingPlace = round(haversineGreatCircleDistance($pollingPlace["lat"], $pollingPlace["lon"], $location->lat, $location->lon, $earthRadiusAt24S));

          if($distanceBetweenGeocoderAndPollingPlace > 75) {
            // ppo($result);
            $viewport = $result["result"]->results[0]->geometry->viewport;

            // if($pollingPlace["premises"] === "Lindsay Park Public School") {
            //   ppo($viewport);
            //   echo (int)($pollingPlace["lat"] <= $viewport->northeast->lat).'<br>';
            //   echo (int)($pollingPlace["lat"] >= $viewport->southwest->lat).'<br>';
            //   echo (int)($pollingPlace["lon"] <= $viewport->northeast->lng).'<br>';
            //   echo (int)($pollingPlace["lon"] >= $viewport->southwest->lng).'<br>';
            //   echo '<br >';
            // }

            if($pollingPlace["lat"] <= $viewport->northeast->lat && $pollingPlace["lat"] >= $viewport->southwest->lat && $pollingPlace["lon"] <= $viewport->northeast->lng && $pollingPlace["lon"] >= $viewport->southwest->lng) {
              echo '<strong>'.$pollingPlace["premises"].', '.$pollingPlace["address"].'</strong> (Far, but within bounds - ' . $distanceBetweenGeocoderAndPollingPlace . ')<br>';
              echo $pollingPlace["lat"] . "," . $pollingPlace["lon"] . " vs " . $location->lat . "," . $location->lon . "<br />";
            } else {
              echo '<strong>'.$pollingPlace["premises"].', '.$pollingPlace["address"].'</strong> (Far, not in bounds - ' . $distanceBetweenGeocoderAndPollingPlace . ')<br>';
              echo $pollingPlace["lat"] . "," . $pollingPlace["lon"] . " vs " . $location->lat . "," . $location->lon . "<br />";
            }

            echo "<br>";
          } else {
            echo '<strong>'.$pollingPlace["premises"].', '.$pollingPlace["address"].'</strong> (Close - ' . $distanceBetweenGeocoderAndPollingPlace . ')<br>';
          }

        } else {
          echo '<strong>'.$pollingPlace["premises"].', '.$pollingPlace["address"].'</strong> (Status: ' . $result["result"]->status . ')<br>';
          echo $pollingPlace["lat"] . "," . $pollingPlace["lon"] . "<br />";
          echo "<br>";
        }
      }

    } else {
      // Probably overseas. Ignore these for now.
        // echo '<strong>'.$pollingPlace["premises"].', '.$pollingPlace["address"].'</strong> (Overseas)<br>';
    }
  }
}
exit();



/* Geocoder Fed 2013 using Google */

$electionId = 1;
$elections = [$electionId];
foreach($elections as $electionId) {
  $election = fetchElection($electionId);

  $pollingPlaces = fetchAllPollingPlacesByElectionTableName($election["db_table_name"]);
  // $pollingPlaces = array_slice($pollingPlaces, 0, 100);
  foreach($pollingPlaces as $pollingPlace) {
    // @TOOD Use state to detect overseas, not postcode - more robust
    $geocoderParams = getGeocoderParams($pollingPlace);

    if($geocoderParams !== false) {
      $result = getGeocoderResultFromDB($geocoderParams);

      // No cached result from the geocoder
      if($result === false) {
        // @TODO Do something to cache over free limit errors
        $json = googleGeocoder($geocoderParams);

        $params = array_merge($geocoderParams, [
          "result" => json_encode($json),
          "result_timestamp" => "strftime('%Y-%m-%d %H:%M:%f','now') || '+00'",
          "election_id" => $electionId,
        ]);
        echo addGeocoderResult($params).'<br>';
        sleep(0.75);

      } else {
        echo '<strong>'.$pollingPlace["premises"].', '.$pollingPlace["address"].'</strong><br>';
        echo "Got from cache<br />";
        // $location = $result["result"]->result->location;
        // echo $location->lat . ', ' . $location->lon.'<br>';

        // $fromDB = fetchMatchingPollingPlaceByLocation($election["db_table_name"], $location->lat, $location->lon, 400);

        // if(count($fromDB) === 0) {
        //   echo '<strong>'.$pollingPlace["premises"].', '.$pollingPlace["address"].'</strong><br>';
        //   echo "Got from cache<br />";
        //   $location = $result["result"]->result->location;
        //   echo $location->lat . ', ' . $location->lon.'<br>';
        //   echo count($fromDB).'<br>';
        //   echo '<br>';
        // }
      }
    } else {
    // Probably overseas. Ignore these for now.
      // echo "Overseas: " . $pollingPlace["address"]."<br />";
    }
  }
}
exit();



/* Geocoder Fed 2013 using Mappify */

$electionId = 1;
$elections = [$electionId];
foreach($elections as $electionId) {
  $election = fetchElection($electionId);

  $pollingPlaces = fetchAllPollingPlacesByElectionTableName($election["db_table_name"]);
  $pollingPlaces = array_slice($pollingPlaces, 6750, 10000);
  foreach($pollingPlaces as $pollingPlace) {
    // @TOOD Use state to detect overseas, not postcode - more robust
    $geocoderParams = getGeocoderParams($pollingPlace);

    if($geocoderParams !== false) {
      $result = getGeocoderResultFromDB($geocoderParams);

      // No cached result from the geocoder
      if($result === false) {
        // @TODO Do something to cache over free limit errors
        $json = mappifyGeocoder($geocoderParams);

        $params = array_merge($geocoderParams, [
          "result" => json_encode($json),
          "result_timestamp" => "strftime('%Y-%m-%d %H:%M:%f','now') || '+00'",
          "election_id" => $electionId,
        ]);
        echo addGeocoderResult($params).'<br>';
        sleep(0.5);

      } else {
        echo '<strong>'.$pollingPlace["premises"].', '.$pollingPlace["address"].'</strong><br>';
        echo "Got from cache<br />";
        // $location = $result["result"]->result->location;
        // echo $location->lat . ', ' . $location->lon.'<br>';

        // $fromDB = fetchMatchingPollingPlaceByLocation($election["db_table_name"], $location->lat, $location->lon, 400);

        // if(count($fromDB) === 0) {
        //   echo '<strong>'.$pollingPlace["premises"].', '.$pollingPlace["address"].'</strong><br>';
        //   echo "Got from cache<br />";
        //   $location = $result["result"]->result->location;
        //   echo $location->lat . ', ' . $location->lon.'<br>';
        //   echo count($fromDB).'<br>';
        //   echo '<br>';
        // }
      }
    } else {
    // Probably overseas. Ignore these for now.
      // echo "Overseas: " . $pollingPlace["address"]."<br />";
    }
  }
}
exit();








// @TODO Make PPL only calc chance and ppt on the first load of official data (ooh..wait, no! We can get new polling places in subsequent loads that need to have that applied to them! Well, we can at least only recalculate if we haven't yet and we're just copying stuff across.)
// @TODO Make PPL copy chance and ppt if we have already loaded official data (or always?)
// @TODO Make PPL flag an error for two historical pp's with different data? (What different?)
// @TOOD Make PPL check out to 500m and raise an error during loading if two are found for one election. How many places using historical data in the code should flag that error?

// @TODO On ingest of an official load geocode the address of each place to confirm the location is right. Store the geocoded location for use in historical lookups later. As part of a pre-load process. Any issues will fail the load.
// @TODO On matching historical locations find all within 400m. If duplicates, take the closest duplicate (by our math), geocode it, and compare the result to the stored geocode. If it matches, ignore the other results. If it doesn't, flag an error and fail loading.

// Once we've stored the geocoder results for all polling places we can look that up instead of geocoding in future. i.e. If we fail a load or do a dry-run we shouldn't have to look it up again and consume more credits.
  // Store all geocoding results in a separate table based on the search string used (avoid unneccessary lookups)

// Fixing geocoding issues at ingest (address and coordinates don't match) can be an Excel task for now.
// A summary report we can send to ECs would be nice.

// Need to handle overseas booths

// Gonne have to handle the Mappify Geocoder giving us the wrong location. This might be the human review stage - if it differs too much from the official location.

// {"error":true,"messages":[{"level":"ERROR","message":"{\"message\":\"API limit reached. Add payment info to proceed.\"}"}]}

// For Fed 13 - of first 2,500 results 435 have no match, 190 have more than 1 match (based on latlon within 400m)



/* Initial investigation - bump up the distance threshold and see how many polling places would now have CoS calculated for them*/

$elections = [16];
foreach($elections as $electionId) {
  $election = fetchElection($electionId);
  // ppo($election);

  $pollingPlaces = fetchAllPollingPlacesByElectionTableName($election["db_table_name"]);
  foreach($pollingPlaces as $pollingPlace) {
    // if($pollingPlace["id"] !== 483) {
    //   continue;
    // }

    // if(in_array($pollingPlace["id"], [13, 14, 82, 83, 131, 132]) === false) {
    //   continue;
    // }

    if($pollingPlace["id"] > 100) {
      continue;
    }

    // @TODO Check out what's up with PPs: 455, 462 (2 -> 3)

    $historicalOld = fetchHistoricalData($pollingPlace, $election, 200);
    $historicalNew = fetchHistoricalData($pollingPlace, $election, 400);


    $hasMoreThan1PPPerElection = array_filter(array_map(function($arr) {
      return count($arr["pollingPlaces"]);
    }, $historicalNew), function($val) {
      return $val > 1;
    });

    if(count($historicalOld) !== count($historicalNew) || count($hasMoreThan1PPPerElection) > 0) {
      echo "<br />";
      echo "<strong>" . $pollingPlace["premises"] . ", " . $pollingPlace["address"]." (#" . $pollingPlace["id"] . ")</strong><br />";
    }

    if(count($historicalOld) !== count($historicalNew)) {
      echo "Old Chance of Sausage: " . $pollingPlace["chance_of_sausage"] . "<br />";
      echo "Old vs New Historicals: " . count($historicalOld)." vs " . count($historicalNew)."<br />";

        // if($pollingPlace["id"] == 4) {
        //   ppo($pollingPlace);
        // }

      $mapped = array_map(function($arr) {
        return "- " . $arr["pollingPlaces"][0]["premises"] . ", " . $arr["pollingPlaces"][0]["address"]." (" . $arr["pollingPlaces"][0]["distance_metres"] . "m)<br />";
      }, $historicalNew);
      echo implode("", $mapped);
    }

    if(count($hasMoreThan1PPPerElection) > 0) {
      echo "<span style='color: red; font-weight: bold;'>ERROR: Found more than two matching polling places for a single election!</span><br />";
      // ppo($foo);
      // ppo($pollingPlace);
      // ppo($historicalNew);
    }
  }
}
exit();
?>