<?php
require_once "../secrets.php";
require_once '../google-api-php-client-2.2.0/vendor/autoload.php';

define("SESSION_LIFETIME", 1800);

header("Content-type: application/json");
header("Access-Control-Allow-Credentials: true");

if(array_key_exists("HTTP_REFERER", $_SERVER)) {
  $parsed = parse_url($_SERVER["HTTP_REFERER"]);
  $cors = $parsed["scheme"] . "://" . $parsed["host"];
  if(array_key_exists("port", $parsed) === true) {
    $cors .= ":" . $parsed["port"];
  }
  header("Access-Control-Allow-Origin: " . $cors);
}

// Move out of the default location for a little more security
// and to avoid session GC from other PHPs hitting us
session_save_path(session_save_path() . DIRECTORY_SEPARATOR . "ds");

// Session garbage collection should happen well after our self-imposed session lifespan
// https://stackoverflow.com/questions/520237/how-do-i-expire-a-php-session-after-30-minutes
ini_set("session.gc_maxlifetime", SESSION_LIFETIME * 2);

if(strpos($_SERVER['HTTP_HOST'], "localhost:") === 0) {
  session_set_cookie_params(86400 * 365 * 5, "/");
} else {
  session_set_cookie_params(86400 * 365 * 5, "/", ".democracysausage.org");
}

session_id($_COOKIE[session_name()]);
session_start();

// Regenerate session ids for a little bit more security
if (!isset($_SESSION['CREATED'])) {
    $_SESSION['CREATED'] = time();
} else if (time() - $_SESSION['CREATED'] > SESSION_LIFETIME) {
    // session started more than 30 minutes ago
    session_regenerate_id(true);    // change session ID for the current session and invalidate old session ID
    $_SESSION['CREATED'] = time();  // update creation time
}

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
