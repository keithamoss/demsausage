<?php
require_once 'google-api-php-client/src/Google/autoload.php';

if(strpos($_SERVER['HTTP_HOST'], "localhost:") === 0) {
  session_set_cookie_params(86400 * 365 * 5, "/");
} else {
  session_set_cookie_params(86400 * 365 * 5, "/", ".democracysausage.org");
}
session_start();

$client = new Google_Client();
$client->setAccessType('offline');
// $client->setApprovalPrompt('force');
$client->setAuthConfigFile('client_secrets.inc');
$client->setRedirectUri('http://' . $_SERVER['HTTP_HOST'] . '/oauth2callback.php');
$client->addScope(Google_Service_Plus::USERINFO_EMAIL);

if (! isset($_GET['code'])) {
  $auth_url = $client->createAuthUrl();
  header('Location: ' . filter_var($auth_url, FILTER_SANITIZE_URL));
} else {
  $client->authenticate($_GET['code']);
  $_SESSION['access_token'] = $client->getAccessToken();

  // echo 'OK!<br>';
  // echo '<pre>';
  // print_r(json_decode($_SESSION['access_token']));
  // echo '</pre>';
  // exit;

  $redirect_uri = 'http://' . $_SERVER['HTTP_HOST'] . '/login.php';
  header('Location: ' . filter_var($redirect_uri, FILTER_SANITIZE_URL));
}
