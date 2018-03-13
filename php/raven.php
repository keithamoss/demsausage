<?php
ini_set("display_errors", 0);
ini_set("display_startup_errors", 0);
ini_set("error_log", "../php-error.log");

require_once "../secrets.php";

// Sentry.io error logging
require_once "../sentry-php/lib/Raven/Autoloader.php";
Raven_Autoloader::register();
$client = new Raven_Client(RAVEN_URL, array("environment" => ENVIRONMENT));
$client->install();
?>