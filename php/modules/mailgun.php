<?php
$mailgunEventsPKeyFieldName = "id";
$mailgunEventsAllowedFields = array("timestamp", "type", "json");

function translateMailgunEventToDB($row) {
  $new = [];
  foreach($row as $key => $val) {
    if(in_array($key, ["json"])) {
      $new[$key] = (gettype($val) === "string") ? $val : json_encode($val);
    } elseif(in_array($key, ["id", "timestamp"])) {
      $new[$key] = (int)$val;
    } else {
      $new[$key] = $val;
    }
  }
  return $new;
}

function addMailgunEvent($timestamp, $event_type, $body) {
  global $file_db, $mailgunEventsAllowedFields;

  $params = [
    "timestamp" => $timestamp,
    "type" => $event_type,
    "json" => json_encode($body),
  ];
  $insert = fieldsToInsertSQL("mailgun_events", $mailgunEventsAllowedFields, array_keys($params), $params);
  $stmt = $file_db->prepare($insert);
  
  return fieldsToStmnt($stmt, $mailgunEventsAllowedFields, $params);
}

function mailgunPOST(string $url, array $body) {
  $ch = curl_init();

  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_POST, 1);
  curl_setopt($ch, CURLOPT_USERPWD, "api:" . MAILGUN_API_KEY);
  curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($body));
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

  $output = curl_exec($ch);
  $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  if($httpcode !== 200) {
    failForAPI($output);
  }
  return $output;
}

function mailgunGET(string $url, array $params) {
  $ch = curl_init();

  curl_setopt($ch, CURLOPT_URL, $url."?".http_build_query($params));
  curl_setopt($ch, CURLOPT_USERPWD, "api:" . MAILGUN_API_KEY);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

  $output = curl_exec($ch);
  $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  if($httpcode !== 200) {
    failForAPI($output);
  }
  return $output;
}

function rollYourOwnTemplating($template_name, $params) {
  $template = file_get_contents("mail_templates/$template_name.html");
  foreach($params as $fieldName => $fieldValue) {
    $template = str_replace("{%$fieldName%}", $fieldValue, $template);
  }
  return $template;
}

function getMapboxStaticMap($lat, $lon) {
  return "";
};

function getMailgunEvents() {
  $url = MAILGUN_API_BASE_URL . "/events";
  $params = array(
    "begin" => "Wed, 3 Jan 2018 00:00:00 -0000",
    "ascending" => "yes",
    "limit" => 25,
  );

  $events = mailgunGET($url, $params);
}

function sendMailgunEmail(array $body) {
  $url = MAILGUN_API_BASE_URL . "/messages";
  $body = array_merge(
    array(
      "from" => MAILGUN_FROM_ADDRESS,
      "h:Reply-To" => MAILGUN_REPLY_TO_ADDRESS,
    ),
    $body
  );

  return mailgunPOST($url, $body);
}

function sendStallSubmittedEmail($stallId, $toEmail, $toName, $mailInfo) {
  // @TODO move this to the calling function and handle making it dependent on
  // the email not having been confirmed elsewhere before.
  $confirmUrl = BASE_URL."/api.php?confirm-email=1&confirm_key=" . makeConfirmationHash($toEmail, $stallId);
  $mailInfo["CONFIRM_LINK"] = "Blah blah blah confirm email <a href='$confirmUrl'>here</a>.<br /><br/>";

  $body = array(
    // "to" => "$toName <$toEmail>",
    "to" => "$toEmail",
    "subject" => "Your Democracy Sausage stall has been received!",
    "html" => rollYourOwnTemplating("stall_submitted", $mailInfo),
  );
  return sendMailgunEmail($body);
}

function sendStallApprovedEmail($toEmail, $toName, $mailInfo) {
  $body = array(
    // "to" => "$toName <$toEmail>",
    "to" => "$toEmail",
    "subject" => "Your Democracy Sausage stall has been approved!",
    "html" => rollYourOwnTemplating("stall_approved", $mailInfo),
  );
  return sendMailgunEmail($body);
}

// https://documentation.mailgun.com/en/latest/user_manual.html#webhooks
function verifyWebhook($apiKey, $token, $timestamp, $signature) {
  // Check if the timestamp is fresh
  if (abs(time() - $timestamp) > 15) {
      return false;
  }

  // Returns true if signature is valid
  return hash_hmac("sha256", $timestamp.$token, $apiKey) === $signature;
}

function makeConfirmationHash($email, $stallId) {
  return hash_hmac("sha256", $email.$stallId.MAILGUN_CONFIRM_SECRET, MAILGUN_HMAC_KEY);
}

function checkConfirmationHash($email, $stallId, $confirmCode) {
  return hash_hmac("sha256", $email.$stallId.MAILGUN_CONFIRM_SECRET, MAILGUN_HMAC_KEY) === $confirmCode;
}
?>