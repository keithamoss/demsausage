<?php
require_once "secrets.php";

function mailgunPOST(string $url, array $body) {
  $ch = curl_init();

  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_POST, 1);
  curl_setopt($ch, CURLOPT_USERPWD, MAILGUN_API_KEY);
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
  curl_setopt($ch, CURLOPT_USERPWD, MAILGUN_API_KEY);
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

function sendStallSubmittedEmail($toEmail, $toName, $mailInfo) {
  $body = array(
    "to" => "$toName <$toEmail>",
    "subject" => "Your Democracy Sausage stall has been received!",
    "html" => rollYourOwnTemplating("stall_submitted", $mailInfo),
  );
  return sendMailgunEmail($body);
}

function sendStallApprovedEmail($toEmail, $toName, $mailInfo) {
  $body = array(
    "to" => "$toName <$toEmail>",
    "subject" => "Your Democracy Sausage stall has been approved!",
    "html" => rollYourOwnTemplating("stall_approved", $mailInfo),
  );
  return sendMailgunEmail($body);
}
?>