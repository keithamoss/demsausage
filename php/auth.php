<?php
require_once "secrets.php";

header("Content-type: application/json");
header("Access-Control-Allow-Credentials: true");

$parsed = parse_url($_SERVER["HTTP_REFERER"]);
$cors = $parsed["scheme"] . "://" . $parsed["host"];
if(array_key_exists("port", $parsed) === true) {
  $cors .= ":" . $parsed["port"];
}
header("Access-Control-Allow-Origin: " . $cors);

if(strpos($_SERVER['HTTP_HOST'], "localhost:") === 0) {
  session_set_cookie_params(86400 * 365 * 5, "/");
} else {
  session_set_cookie_params(86400 * 365 * 5, "/", ".democracysausage.org");
}

session_id($_COOKIE[session_name()]);
session_start();

// No auth check for allowing the public to add stalls
// CartoDB seem to take care of SQL injection issues for us
// if(isset($_GET['add-stall'])) {
//   // Quick hack to prevent casual SQL injection because CartoDB doesn't do that for us =/
//   if(substr($_GET["q"], 0, 1) === "(" && substr($_GET["q"], -1, 1) === ")"/* && stristr($_GET["q"], "delete") === false && stristr($_GET["q"], "update") === false*/) {
//     do_request("INSERT INTO pending_stalls " . $_GET["q"]);
//   }
//   exit;
// }

// // Temporary and a horrid hack
// if(stristr($_SERVER['HTTP_REFERER'], 'http://localhost:3000')) {
//   do_request($_GET["q"]);
//   exit;
// }

// if(stristr($_SERVER['HTTP_REFERER'], 'http://dev.democracysausage.org:5000/') !== false) {
//   do_request($_GET["q"]);
//   exit;
// }

require_once '../google-api-php-client-2.2.0/vendor/autoload.php';

function isAuthorisedUser($level = "su") {
  $client = new Google_Client();
  $client->setAuthConfigFile('client_secrets.php');
  $client->addScope(Google_Service_Plus::USERINFO_EMAIL);

  if(isset($_SESSION['access_token']) && $_SESSION['access_token']) {
    $client->setAccessToken($_SESSION['access_token']);

    if($client->isAccessTokenExpired()) {
      $access_token = $_SESSION['access_token'];

      // header("Status: 403");
      // echo json_encode(array("error" => "Unauthorised user."));
      $client->refreshToken($access_token->refresh_token);
      $_SESSION['access_token'] = $client->getAccessToken();
    }

    $plus_service = new Google_Service_Plus($client);
    $me = $plus_service->people->get("me", array("fields" => "emails"));

    // Super Users can do anything
    if(isset($me["emails"])) {
      if(in_array($me["emails"][0]["value"], unserialize(AUTHORISED_USERS))) {
        return true;
      }
    }

    // @TODO Election-specific users
    return false;

  } else {
    return false;
    // header("Status: 403");
    // echo json_encode(array("error" => "Unauthorised user."));
  }
}
?>