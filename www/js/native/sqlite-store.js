/**
 * PhysioSQLite - chat message storage on top of @capacitor-community/sqlite.
 * One table for every room (public_chat, priv_<chatId>, ...), indexed by (room, ts).
 * offline-cache.js uses this automatically and falls back to IndexedDB in a browser.
 */
(function () {
  var cfg = window.PHYSIO_CONFIG || {};
  var N = window.PhysioNative;
  var plugin = (N && N.isNative && cfg.SQLITE_ENABLED !== false) ? N.plugin('CapacitorSQLite') : null;
  var DB = cfg.SQLITE_DB_NAME || 'physio_suai_chats';
  var MAX = cfg.MAX_MSGS_PER_ROOM || 500;

  var SCHEMA =
    'CREATE TABLE IF NOT EXISTS messages (' +
    ' pk TEXT PRIMARY KEY NOT NULL, room TEXT NOT NULL, msg_id TEXT NOT NULL, ts INTEGER NOT NULL,' +
    ' sender TEXT, body TEXT, file_url TEXT, file_type TEXT, json TEXT NOT NULL);' +
    'CREATE INDEX IF NOT EXISTS idx_messages_room_ts ON messages(room, ts);' +
    'CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY NOT NULL, v TEXT);';

  var S = { enabled: false, ready: null, _ok: false };
  var queue = [];          // [{statement, values}]
  var roomsTouched = {};
  var timer = null;
  var flushing = Promise.resolve();

  function opt(extra) {
    var o = { database: DB, readonly: false };
    for (var k in extra) o[k] = extra[k];
    return o;
  }

  function init() {
    if (!plugin) return Promise.resolve(false);
    return Promise.resolve()
      .then(function () {
        // A page change keeps the native connection alive, so "already exists" is fine.
        return plugin.createConnection({ database: DB, version: 1, encrypted: false, mode: 'no-encryption', readonly: false })
          .catch(function () {});
      })
      .then(function () {
        return (plugin.isDBOpen ? plugin.isDBOpen({ database: DB, readonly: false }) : Promise.resolve({ result: false }))
          .catch(function () { return { result: false }; });
      })
      .then(function (r) {
        if (r && r.result) return;
        return plugin.open({ database: DB, readonly: false });
      })
      .then(function () { return plugin.execute(opt({ statements: SCHEMA, transaction: true })); })
      .then(function () { S.enabled = true; S._ok = true; return true; })
      .catch(function (e) {
        console.warn('[PhysioSQLite] disabled, using IndexedDB fallback:', e && e.message || e);
        return false;
      });
  }

  S.ready = init();

  function toNum(v) { v = Number(v); return isFinite(v) ? v : 0; }

  function flush() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (!queue.length) return flushing;
    var batch = queue; queue = [];
    var rooms = Object.keys(roomsTouched); roomsTouched = {};
    var set = batch.slice();
    rooms.forEach(function (room) {
      set.push({
        statement: 'DELETE FROM messages WHERE room = ? AND pk NOT IN (SELECT pk FROM messages WHERE room = ? ORDER BY ts DESC LIMIT ' + MAX + ')',
        values: [room, room]
      });
    });
    flushing = flushing.then(function () {
      return plugin.executeSet(opt({ set: set, transaction: true }));
    }).catch(function (e) { console.warn('[PhysioSQLite] write failed', e && e.message || e); });
    return flushing;
  }

  function schedule() { if (!timer) timer = setTimeout(flush, 60); }

  S.put = function (room, id, obj) {
    obj = obj || {};
    var rec = {};
    for (var k in obj) rec[k] = obj[k];
    rec.id = rec.id || id;
    var ts = toNum(rec.ts || rec.timestamp) || Date.now();
    queue.push({
      statement: 'INSERT OR REPLACE INTO messages (pk, room, msg_id, ts, sender, body, file_url, file_type, json) VALUES (?,?,?,?,?,?,?,?,?)',
      values: [room + '__' + id, room, String(id), ts, String(rec.senderUid || rec.senderId || ''),
               String(rec.text || rec.message || ''), String(rec.fileUrl || ''), String(rec.fileType || ''), JSON.stringify(rec)]
    });
    roomsTouched[room] = 1;
    schedule();
  };

  S.remove = function (room, id) {
    queue.push({ statement: 'DELETE FROM messages WHERE pk = ?', values: [room + '__' + id] });
    schedule();
  };

  function parseRows(res, room) {
    var rows = (res && res.values) || [];
    var out = [];
    rows.forEach(function (r) {
      if (!r || r.json === undefined) return;      // iOS metadata row
      try {
        var m = JSON.parse(r.json);
        m.room = room; m.ts = r.ts !== undefined ? r.ts : m.ts; m._pk = room + '__' + m.id;
        out.push(m);
      } catch (e) {}
    });
    return out;
  }

  S.get = function (room, limit) {
    return flush().then(function () {
      return plugin.query(opt({
        statement: 'SELECT json, ts FROM messages WHERE room = ? ORDER BY ts DESC LIMIT ?',
        values: [room, limit || 80]
      }));
    }).then(function (res) { return parseRows(res, room).reverse(); })
      .catch(function () { return []; });
  };

  S.search = function (room, text, limit) {
    return flush().then(function () {
      return plugin.query(opt({
        statement: 'SELECT json, ts FROM messages WHERE room = ? AND body LIKE ? ORDER BY ts DESC LIMIT ?',
        values: [room, '%' + text + '%', limit || 100]
      }));
    }).then(function (res) { return parseRows(res, room); }).catch(function () { return []; });
  };

  /** Links shared in a room (used by the Links tab of the Document picker). */
  S.links = function (room, limit) {
    return flush().then(function () {
      return plugin.query(opt({
        statement: "SELECT body, ts FROM messages WHERE room = ? AND body LIKE '%http%' ORDER BY ts DESC LIMIT ?",
        values: [room, limit || 200]
      }));
    }).then(function (res) {
      var seen = {}, out = [];
      ((res && res.values) || []).forEach(function (r) {
        if (!r || r.body === undefined) return;
        (String(r.body).match(/https?:\/\/[^\s<>"']+/g) || []).forEach(function (u) {
          if (!seen[u]) { seen[u] = 1; out.push({ url: u, ts: r.ts }); }
        });
      });
      return out;
    }).catch(function () { return []; });
  };

  S.clear = function () {
    queue = [];
    return flush().then(function () { return plugin.execute(opt({ statements: 'DELETE FROM messages;', transaction: true })); })
      .catch(function () {});
  };

  S.flush = flush;
  window.addEventListener('pagehide', function () { if (S.enabled) flush(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden && S.enabled) flush(); });

  window.PhysioSQLite = S;
})();
