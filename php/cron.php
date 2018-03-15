<?php
/*
0 6 * * * /usr/local/bin/ea-php71 /home/flyingbl/public_html/demsausage-v3/php/cron.php
*/

ini_set("display_errors", 1);

if(getenv("SHELL") === "/bin/bash") {
  define("BASE_PATH", "/home/flyingbl/public_html/demsausage-v3");
  require_once BASE_PATH . "/secrets.php";
  require_once BASE_PATH . "/php/modules/mailgun.php";

  // Create (connect to) SQLite database in file
  $file_db = new PDO("sqlite:" . BASE_PATH . "/db/demsausage.sqlite3");
  $file_db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  $stmt = $file_db->prepare("SELECT COUNT(*) FROM pending_stalls WHERE active = 1");
  $stmt->execute();
  $stallCount = $stmt->fetchColumn();

  if((int)$stallCount > 0) {
    $body = array(
      "to" => implode(", ", unserialize(ELECTION_ADMINS)),
      "subject" => "Reminder: There are $stallCount Democracy Sausage stalls waiting to be reviewed",
      "html" => file_get_contents(BASE_PATH . "/php/mail_templates/pending_stall_reminder.html"),
    );
    sendMailgunEmail($body);
  } else {
    // echo "Eh, did nothing.";
  }

  // Tidy up
  $file_db = null;
}
?>