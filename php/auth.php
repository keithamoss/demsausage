<?php
require_once "../secrets.php";
require_once '../google-api-php-client-2.2.0/vendor/autoload.php';
require_once "sessions.php";

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

initSession();

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
