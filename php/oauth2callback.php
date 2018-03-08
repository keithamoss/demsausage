<?php
require_once "raven.php";
require_once '../google-api-php-client-2.2.0/vendor/autoload.php';
require_once "sessions.php";

initSession();

$client = new Google_Client();
$client->setAccessType('offline');
$client->setApprovalPrompt('force');
$client->setAuthConfigFile('client_secrets.php');
if(strpos($_SERVER['HTTP_HOST'], "localhost:") === 0) {
  $client->setRedirectUri('http://' . $_SERVER['HTTP_HOST'] . '/oauth2callback.php');
} else {
  $client->setRedirectUri('https://' . $_SERVER['HTTP_HOST'] . '/oauth2callback.php');
}
$client->addScope(Google_Service_Plus::USERINFO_EMAIL);

if (! isset($_GET['code'])) {
  $auth_url = $client->createAuthUrl();
  header('Location: ' . filter_var($auth_url, FILTER_SANITIZE_URL));
} else {
  $resp = $client->authenticate($_GET['code']);
  $_SESSION['access_token'] = $client->getAccessToken();
  // store and use $refreshToken to get new access tokens
  $_SESSION['refresh_token'] = $resp['refresh_token'];

  if(strpos($_SERVER['HTTP_HOST'], "localhost:") === 0) {
    $redirect_uri = 'http://' . $_SERVER['HTTP_HOST'] . '/login.php';
  } else {
    $redirect_uri = 'https://' . $_SERVER['HTTP_HOST'] . '/login.php';
  }
  
  header('Location: ' . filter_var($redirect_uri, FILTER_SANITIZE_URL));
}
