<?php
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

header("Content-type: application/json");
header("Access-Control-Allow-Credentials: true");
if(strpos($_SERVER['HTTP_HOST'], "localhost:") === 0) {
  header("Access-Control-Allow-Origin: http://localhost:3000");
} else {
  header("Access-Control-Allow-Origin: http://" . $_SERVER["HTTP_HOST"]);
}

// if(isset($_SERVER["HTTP_REFERER"]) && stristr($_SERVER["HTTP_REFERER"], "dev.democracysausage.org") !== false) {
//   session_set_cookie_params(86400 * 365 * 5, "/", "dev.democracysausage.org");
// } else {


  // session_set_cookie_params(86400 * 365 * 5, "/", ".democracysausage.org");


// }
// session_set_cookie_params(86400 * 365 * 5, "/", 192.168.1.203);
// echo '<pre>';
// print_r($_SERVER);
// echo '</pre>';
// exit;

if(strpos($_SERVER['HTTP_HOST'], "localhost:") === 0) {
  session_set_cookie_params(86400 * 365 * 5, "/");
} else {
  session_set_cookie_params(86400 * 365 * 5, "/", ".democracysausage.org");
}

session_id($_COOKIE[session_name()]);
session_start();

/*register_shutdown_function( "fatal_handler" );

function fatal_handler() {
  $error = error_get_last();

  if($error["type"] >= E_CORE_ERROR) {
    error 'Error';
    print_r($error);
    header("Status: 500");
    echo $error["message"];
  }
}*/

function do_request($query) {
  $secrets = (array)json_decode(file_get_contents("sausage_secrets.inc"));

  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, "https://democracy-sausage.cartodb.com/api/v2/sql?" . http_build_query(array(
    "q" => $query,
    "api_key" => $secrets["cartodb-api-key"]
  )));
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

  $body = curl_exec($ch);

  header("Status: " . curl_getinfo($ch, CURLINFO_HTTP_CODE));
  curl_close($ch);
  echo $body;
}

if(isset($_GET['access_token'])) {
  echo '$_SESSION[\'access_token\']';
  echo '<pre>';
  print_r(json_decode($_SESSION['access_token']));
  echo '</pre>';
  exit;
}

// No auth check for allowing the public to add stalls
// CartoDB seem to take care of SQL injection issues for us
if(isset($_GET['add-stall'])) {
  // Quick hack to prevent casual SQL injection because CartoDB doesn't do that for us =/
  if(substr($_GET["q"], 0, 1) === "(" && substr($_GET["q"], -1, 1) === ")"/* && stristr($_GET["q"], "delete") === false && stristr($_GET["q"], "update") === false*/) {
    do_request("INSERT INTO pending_stalls " . $_GET["q"]);
  }
  exit;
}

// Temporary and a horrid hack
if(stristr($_SERVER['HTTP_REFERER'], 'http://localhost:3000')) {
  do_request($_GET["q"]);
  exit;
}

if(stristr($_SERVER['HTTP_REFERER'], 'http://dev.democracysausage.org:5000/') !== false) {
  do_request($_GET["q"]);
  exit;
}


// require_once 'google-api-php-client/src/Google/autoload.php';
require_once 'google-api-php-client-2.2.0/vendor/autoload.php';

$client = new Google_Client();
$client->setAuthConfigFile('client_secrets.inc');
$client->addScope(Google_Service_Plus::USERINFO_EMAIL);

if(isset($_SESSION['access_token']) && $_SESSION['access_token']) {
  // echo '$_SESSION[\'access_token\']';
  // echo '<pre>';
  // print_r(json_decode($_SESSION['access_token']));
  // echo '</pre>';

  $client->setAccessToken($_SESSION['access_token']);

  if($client->isAccessTokenExpired()) {
    // echo 'Expired! Refreshing...';
    $access_token = json_decode($_SESSION['access_token']);
    // echo '<pre>';
    // print_r($access_token);
    // echo '</pre>';

    header("Status: 403");
    echo json_encode(array("error" => "Unauthorised user."));
    $client->refreshToken($access_token->refresh_token);
    $_SESSION['access_token'] = $client->getAccessToken();
    // Don't think this is needed
    // $client->setAccessToken($_SESSION['access_token']);

    // echo '$_SESSION[\'access_token\']';
    // echo '<pre>';
    // print_r(json_decode($_SESSION['access_token']));
    // echo '</pre>';
  }

  $plus_service = new Google_Service_Plus($client);
  $me = $plus_service->people->get("me", array("fields" => "emails"));

  $secrets = (array)json_decode(file_get_contents("sausage_secrets.inc"));
  if(isset($me["emails"]) && in_array($me["emails"][0]["value"], $secrets["authorised_users"])) {
    // OK
    do_request($_GET["q"]);
  } else {
    // NOT OK
  }

} else {
  header("Status: 403");
  echo json_encode(array("error" => "Unauthorised user."));
}
?>
