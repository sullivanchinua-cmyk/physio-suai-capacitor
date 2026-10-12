/**
 * PhysioNotify - WhatsApp-style message notifications.
 *
 *  PUSH_MODE 'local' (default)
 *     Firebase Realtime Database listeners create real Android notifications
 *     (sound + heads-up + notification panel) while the app process is alive.
 *  PUSH_MODE 'fcm'
 *     Additionally registers the phone for Firebase Cloud Messaging so the
 *     Cloud Function in /functions can ring the phone even when the app is closed.
 *     (Local notifications are then only used while the app is in the foreground,
 *      to avoid double notifications.)
 */
(function () {
  var N = window.PhysioNative;
  var cfg = window.PHYSIO_CONFIG || {};
  if (!N || !N.isNative || typeof firebase === 'undefined') { window.PhysioNotify = { start: function () {}, stop: function () { return Promise.resolve(); }, test: function () {} }; return; }

  var LN = N.plugin('LocalNotifications');
  var PN = N.plugin('PushNotifications');
  var APP = N.plugin('App');
  var CHANNEL = cfg.NOTIFICATION_CHANNEL || 'messages';
  var MODE = cfg.PUSH_MODE === 'fcm' ? 'fcm' : 'local';

  var isActive = true;
  var floor = Date.now() - 20000;      // ignore anything older than this page load
  var refs = [];                        // listeners to detach on stop()
  var me = null;
  var started = false;

  if (APP && APP.addListener) APP.addListener('appStateChange', function (s) { isActive = !!(s && s.isActive); });

  // ---------- helpers ----------------------------------------------------
  function hash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0; }
    return Math.abs(h) % 2147483000 + 1;
  }
  function seen(key) {
    var list = [];
    try { list = JSON.parse(localStorage.getItem('physio_notified') || '[]'); } catch (e) {}
    if (list.indexOf(key) !== -1) return true;
    list.push(key);
    try { localStorage.setItem('physio_notified', JSON.stringify(list.slice(-300))); } catch (e) {}
    return false;
  }
  function go(extra) {
    var root = cfg.ROOT_URL || '/';
    if (extra && extra.uid) {
      window.location.href = root + 'pages/chatroom.html?uid=' + encodeURIComponent(extra.uid) + '&name=' + encodeURIComponent(extra.name || 'Chat');
    } else {
      window.location.href = root + 'home.html';
    }
  }
  function preview(m) {
    var t = String(m.text || '');
    var ft = String(m.fileType || '');
    if (m.viewOnce) return '📷 Photo';
    if (/^image\//.test(ft)) return '📷 Photo';
    if (/^video\//.test(ft)) return '🎥 Video';
    if (/^audio\//.test(ft)) return t && t.indexOf('🎤') === 0 ? '🎤 Voice message' : '🎵 Audio';
    if (ft) return '📄 ' + (t || 'Document');
    if (m.poll || /^\[?poll/i.test(t)) return '📊 Poll';
    if (t.length > 160) t = t.slice(0, 157) + '…';
    return t || 'New message';
  }

  // ---------- show a notification --------------------------------------
  function show(opts) {
    if (!LN) return;
    var okNow = (MODE === 'local') || isActive;     // in 'fcm' mode the push handles background
    if (!okNow) return;
    LN.schedule({
      notifications: [{
        id: opts.id || hash(String(Math.random())),
        title: opts.title || 'Physio SUAI',
        body: opts.body || '',
        channelId: CHANNEL,
        group: opts.group,
        extra: opts.extra || {}
      }]
    }).catch(function (e) { console.warn('[notify]', e && e.message || e); });
  }

  // ---------- permissions + channel -------------------------------------
  function prepare() {
    if (!LN) return Promise.resolve(false);
    return LN.createChannel({
      id: CHANNEL, name: 'Messages', description: 'New chat messages',
      importance: 5, visibility: 1, vibration: true, lights: true, lightColor: '#9333EA'
    }).catch(function () {})
      .then(function () { return LN.checkPermissions(); })
      .then(function (p) {
        if (p.display === 'granted') return true;
        return LN.requestPermissions().then(function (r) { return r.display === 'granted'; });
      })
      .catch(function () { return false; });
  }

  // ---------- private chats ---------------------------------------------
  function watchChats(db, uid) {
    db.ref('users').once('value').then(function (snap) {
      var users = snap.val() || {};
      Object.keys(users).forEach(function (other) {
        if (other === uid) return;
        var chatId = [uid, other].sort().join('_');
        var ref = db.ref('chats/' + chatId).limitToLast(1);
        ref.on('child_added', function (s) {
          var m = s.val();
          if (!m || m.senderUid === uid || m.senderUid === 'gemini' || m.isGemini) return;
          var ts = Number(m.ts || m.timestamp || 0);
          if (ts < floor) return;
          var key = 'c_' + chatId + '_' + s.key;
          if (seen(key)) return;
          // already looking at this conversation
          if (isActive && !document.hidden && window.friendUid === other && /chatroom\.html/.test(location.pathname)) return;
          var name = m.senderName || (users[other] && users[other].name) || 'New message';
          show({
            id: hash(key), title: name, body: preview(m), group: 'chat_' + other,
            extra: { type: 'message', uid: other, name: name }
          });
        });
        refs.push(ref);
      });
    }).catch(function (e) { console.warn('[notify] chat watch failed', e && e.message || e); });
  }

  // ---------- mentions, friend requests, orders ----------------------------
  function watchBell(db, uid) {
    var ref = db.ref('notifications/' + uid).limitToLast(20);
    ref.on('child_added', function (s) {
      var v = s.val();
      if (!v || v.read === true) return;
      var ts = Number(v.timestamp || v.ts || 0);
      if (ts < floor) return;
      var text = String(v.message || v.text || '');
      if (/^New message from /i.test(text)) return;          // private messages are handled by watchChats
      var key = 'n_' + uid + '_' + s.key;
      if (seen(key)) return;
      show({ id: hash(key), title: v.title || 'Physio SUAI', body: text || 'You have a new notification', extra: { type: 'bell' } });
    });
    refs.push(ref);
  }

  // ---------- FCM (optional) ---------------------------------------------
  function registerPush(db, uid) {
    if (!PN || MODE !== 'fcm') return;
    PN.addListener('registration', function (t) {
      if (!t || !t.value) return;
      var tag = uid + ':' + t.value;
      try { if (localStorage.getItem('physio_fcm_saved') === tag) return; } catch (e) {}
      db.ref('fcm_tokens/' + uid + '/' + t.value).set({ platform: 'android', updatedAt: firebase.database.ServerValue.TIMESTAMP })
        .then(function () { try { localStorage.setItem('physio_fcm_saved', tag); localStorage.setItem('physio_fcm_token', t.value); } catch (e) {} });
    });
    PN.addListener('registrationError', function (e) { console.warn('[push] registration error', e); });
    PN.addListener('pushNotificationActionPerformed', function (a) {
      var d = (a && a.notification && a.notification.data) || {};
      go({ uid: d.uid, name: d.name });
    });
    PN.requestPermissions().then(function (r) {
      if (r.receive === 'granted') return PN.register();
    }).catch(function (e) { console.warn('[push]', e && e.message || e); });
  }

  // ---------- public API -------------------------------------------------
  var P = {
    start: function (user) {
      if (started || !user) return;
      started = true; me = user;
      var db = firebase.database();
      prepare().then(function (granted) {
        watchChats(db, user.uid);
        watchBell(db, user.uid);
        if (granted) registerPush(db, user.uid);
      });
    },
    stop: function () {
      refs.forEach(function (r) { try { r.off(); } catch (e) {} });
      refs = []; started = false;
      var tok = null;
      try { tok = localStorage.getItem('physio_fcm_token'); } catch (e) {}
      if (me && tok) {
        return firebase.database().ref('fcm_tokens/' + me.uid + '/' + tok).remove().catch(function () {}).then(function () {
          try { localStorage.removeItem('physio_fcm_saved'); localStorage.removeItem('physio_fcm_token'); } catch (e) {}
          if (PN && PN.unregister) return PN.unregister().catch(function () {});
        });
      }
      return Promise.resolve();
    },
    /** Console helper: PhysioNotify.test() */
    test: function () { show({ id: hash('test' + Date.now()), title: 'Physio SUAI', body: 'Test notification 🔔', extra: {} }); }
  };

  if (LN && LN.addListener) {
    LN.addListener('localNotificationActionPerformed', function (a) {
      go((a && a.notification && a.notification.extra) || {});
    });
  }

  firebase.auth().onAuthStateChanged(function (user) { if (user) P.start(user); });
  window.PhysioNotify = P;
})();
