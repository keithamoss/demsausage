<?php
require_once "raven.php";
require_once '../google-api-php-client-2.2.0/vendor/autoload.php';

if(strpos($_SERVER['HTTP_HOST'], "localhost:") === 0) {
  session_set_cookie_params(86400 * 365 * 5, "/");
} else {
  session_set_cookie_params(86400 * 365 * 5, "/", ".democracysausage.org");
}
session_start();

$client = new Google_Client();
$client->setAuthConfigFile('client_secrets.php');
$client->addScope(Google_Service_Plus::USERINFO_EMAIL);

if(isset($_GET["nuke_session"])) {
  session_destroy();
  $_SESSION['access_token'] = null;
}

if (isset($_SESSION['access_token']) && $_SESSION['access_token']) {
  $client->setAccessToken($_SESSION['access_token']);

  if(strpos($_SERVER['HTTP_HOST'], "localhost:") === 0) {
    header('Location: http://localhost:3000');
  } else {
    header('Location: https://admin.democracysausage.org');
  }
} else {
  $redirect_uri = 'https://' . $_SERVER['HTTP_HOST'] . '/oauth2callback.php';
  header('Location: ' . filter_var($redirect_uri, FILTER_SANITIZE_URL));
}
