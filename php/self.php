<?php
require_once "raven.php";
require_once "../secrets.php";
require_once '../google-api-php-client-2.2.0/vendor/autoload.php';
require_once "sessions.php";

initSession();

header("Content-type: application/json");
header("Access-Control-Allow-Credentials: true");

$parsed = parse_url($_SERVER["HTTP_REFERER"]);
$cors = $parsed["scheme"] . "://" . $parsed["host"];
if(array_key_exists("port", $parsed) === true) {
  $cors .= ":" . $parsed["port"];
}
header("Access-Control-Allow-Origin: " . $cors);

$client = new Google_Client();
$client->setAuthConfigFile('client_secrets.php');
$client->addScope(Google_Service_Plus::USERINFO_EMAIL);

header("Content-type: application/json");
if (isset($_SESSION['access_token']) && $_SESSION['access_token']) {
  $client->setAccessToken($_SESSION['access_token']);

  // if($client->isAccessTokenExpired()) {
  //   // $authUrl = $client->createAuthUrl();
  //   // header('Location: ' . filter_var($authUrl, FILTER_SANITIZE_URL));

  //   echo "Expired!<br>!";
  //   echo $_SESSION["refresh_token"].'<br>';
  //   echo $_SESSION['access_token'].'<br>';
  //   $client->refreshToken($_SESSION["refresh_token"]);

  //   // $client->authenticate($_SESSION['access_token']);
  //   // $NewAccessToken = json_decode($client->getAccessToken());
  //   // $client->refreshToken($NewAccessToken->refresh_token);
  //   echo 1;
  //   exit;
  // }
  // echo 1;
  // exit;

  $plus_service = new Google_Service_Plus($client);
  $me = $plus_service->people->get("me", array("fields" => "emails"));

  if(isset($me["emails"]) && in_array($me["emails"][0]["value"], unserialize(AUTHORISED_USERS))) {
    // OK
    echo json_encode(array("success" => true, "user" => array("email" => $me["emails"][0]["value"])));
    // echo json_encode($me["emails"]);
  } else {
    // NOT OK
    // header("HTTP/1.1 401 Unauthorized");
    echo json_encode(array("success" => false));
  }
} else {
  // header("HTTP/1.1 401 Unauthorized");
  echo json_encode(array("success" => false));
}
