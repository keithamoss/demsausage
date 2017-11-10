<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'google-api-php-client/src/Google/autoload.php';

if(strpos($_SERVER['HTTP_HOST'], "localhost:") === 0) {
  session_set_cookie_params(86400 * 365 * 5, "/");
} else {
  session_set_cookie_params(86400 * 365 * 5, "/", ".democracysausage.org");
}
session_start();

$client = new Google_Client();
$client->setAuthConfigFile('client_secrets.inc');
$client->addScope(Google_Service_Plus::USERINFO_EMAIL);

header("Content-type: application/json");
if (isset($_SESSION['access_token']) && $_SESSION['access_token']) {
  $client->setAccessToken($_SESSION['access_token']);
  $plus_service = new Google_Service_Plus($client);
  $me = $plus_service->people->get("me", array("fields" => "emails"));

  $secrets = (array)json_decode(file_get_contents("sausage_secrets.inc"));
  if(isset($me["emails"]) && in_array($me["emails"][0]["value"], $secrets["authorised_users"])) {
    // OK
    header("Content-type: application/json");
    echo json_encode($me["emails"]);
  } else {
    // NOT OK
    header("HTTP/1.1 401 Unauthorized");
  }
} else {
  header("HTTP/1.1 401 Unauthorized");
}
