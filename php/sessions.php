<?php
define("SESSION_LIFETIME", 86400);

function initSession() {
  // Move out of the default location for a little more security
  // and to avoid session GC from other PHPs hitting us

  // Eh - work out making creation of the dedicated sessions directory
  // once we know what our longer-term backend looks like
  // $sessionSavePath = session_save_path() . DIRECTORY_SEPARATOR . "ds";
  // if(strpos($_SERVER['HTTP_HOST'], "localhost:") === false) {
  //   if(is_dir($sessionSavePath) === false) {
  //     mkdir($dir);
  //   }
  //   session_save_path($sessionSavePath);
  // }

  // Session garbage collection should happen well after our self-imposed session lifespan
  // https://stackoverflow.com/questions/520237/how-do-i-expire-a-php-session-after-30-minutes
  ini_set("session.gc_maxlifetime", SESSION_LIFETIME * 2);

  // Avoid the session GC being too aggressive in its pruning by ensuring that
  // each request by a user modifies their session
  $_SESSION['LAST_ACTIVITY'] = time();

  if(strpos($_SERVER['HTTP_HOST'], "localhost:") === 0) {
    session_set_cookie_params(86400 * 365 * 5, "/");
  } else {
    session_set_cookie_params(86400 * 365 * 5, "/", ".democracysausage.org");
  }

  session_id($_COOKIE[session_name()]);
  session_start();

  // Regenerate session ids for a little bit more security
  if (!isset($_SESSION['CREATED'])) {
      $_SESSION['CREATED'] = time();
  } else if (time() - $_SESSION['CREATED'] > SESSION_LIFETIME) {
      // session started more than 30 minutes ago
      session_regenerate_id(true);    // change session ID for the current session and invalidate old session ID
      $_SESSION['CREATED'] = time();  // update creation time
  }
}
?>