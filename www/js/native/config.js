/**
 * Physio SUAI - native (Capacitor) settings.
 * Edit this file only; nothing else needs changing.
 */
(function () {
  // Folder that contains index.html, e.g. https://localhost/
  var src = (document.currentScript && document.currentScript.src) || '';
  var root = src ? src.replace(/js\/native\/config\.js(\?.*)?$/, '') : '/';

  window.PHYSIO_CONFIG = {
    ROOT_URL: root,

    // ---- Notifications --------------------------------------------------
    // 'local' : notifications are created on the phone while the app is running
    //           (foreground or recently backgrounded). Works with NO extra setup.
    // 'fcm'   : also registers the phone for Firebase Cloud Messaging so messages
    //           ring even when the app is closed. Needs android/app/google-services.json
    //           AND the Cloud Function in /functions to be deployed.
    //           Do NOT switch to 'fcm' before google-services.json is in place.
    PUSH_MODE: 'local',
    NOTIFICATION_CHANNEL: 'messages',

    // ---- Storage ----------------------------------------------------------
    SQLITE_ENABLED: true,
    SQLITE_DB_NAME: 'physio_suai_chats',
    MAX_MSGS_PER_ROOM: 500,

    // Turn on if the page header is hidden behind the Android status bar.
    SAFE_AREA_PADDING: false,

    // ---- Attach pickers ---------------------------------------------------
    // true : the Document picker asks for "All files access" so it can list
    //        documents of the whole phone (sideloaded APK).
    // false: Play-Store-safe. Documents tab shows only what Android allows and
    //        "Browse other docs" opens the system file chooser.
    ALL_FILES_ACCESS: true
  };
})();
