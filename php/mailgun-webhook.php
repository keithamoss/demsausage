<?php
require_once "../secrets.php";
require_once "db.php";
require_once "modules/mailgun.php";

if(!array_key_exists("token", $_POST) && !array_key_exists("timestamp", $_POST) && !array_key_exists("signature", $_POST)) {
  header("Status: 406");
  exit();
}

if(verifyWebhook(MAILGUN_API_KEY, $_POST["token"], $_POST["timestamp"], $_POST["signature"]) === false) {
  header("Status: 406");
  exit();
}

header("Status: 200");
addMailgunEvent($_POST["timestamp"], $_POST["event"], $_POST);
?>