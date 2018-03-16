<?php
ini_set("display_errors", 0);
ini_set("display_startup_errors", 0);
ini_set("date.timezone", "Australia/Perth");
ini_set("error_log", "../php-error.log");

require_once "../secrets.php";

// Sentry.io error logging
require_once "../sentry-php/lib/Raven/Autoloader.php";
Raven_Autoloader::register();
$client = new Raven_Client(RAVEN_URL, array("environment" => ENVIRONMENT));
$client->install();

// https://github.com/getsentry/sentry-php/blob/master/docs/usage.rst
$client->setSendCallback(function($data) {
  $ignore_values = array("Module 'timezonedb' already loaded");

  if(isset($data["exception"]) && in_array($data["exception"]["values"][0]["value"], $ignore_values)) {
    return false;
  }
});
?>