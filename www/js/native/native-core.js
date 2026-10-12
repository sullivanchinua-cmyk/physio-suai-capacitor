/**
 * PhysioNative - thin helpers around the Capacitor bridge.
 * Works without a bundler: Capacitor injects window.Capacitor into every page.
 */
(function () {
  var cap = window.Capacitor;
  var isNative = !!(cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform());

  function plugin(name) {
    if (!isNative || !cap) return null;
    try {
      if (cap.Plugins && cap.Plugins[name]) return cap.Plugins[name];
      if (typeof cap.registerPlugin === 'function') return cap.registerPlugin(name);
    } catch (e) {}
    return null;
  }

  var N = {
    isNative: isNative,
    plugin: plugin,

    deviceFiles: function () { return plugin('DeviceFiles'); },

    /** Capacitor serves local files through https://localhost/_capacitor_file_/... */
    toWebUrl: function (path) {
      if (!path) return path;
      return cap && cap.convertFileSrc ? cap.convertFileSrc('file://' + path) : 'file://' + path;
    },

    /** Reads a file that the native side copied to cache and returns a real File object. */
    fileFromPath: function (path, name, mime) {
      return fetch(N.toWebUrl(path)).then(function (r) {
        if (!r.ok) throw new Error('read failed ' + r.status);
        return r.blob();
      }).then(function (blob) {
        return new File([blob], name || ('file_' + Date.now()), { type: mime || blob.type || 'application/octet-stream' });
      });
    },

    /** content:// item -> File (copy to cache first). */
    fileFromUri: function (item) {
      var df = N.deviceFiles();
      if (!df) return Promise.reject(new Error('DeviceFiles plugin missing'));
      return df.copyToCache({ uri: item.uri, name: item.name }).then(function (r) {
        return N.fileFromPath(r.path, r.name, r.mime);
      });
    },

    /** Location with the Capacitor plugin on the phone, browser API elsewhere. */
    getPosition: function (ok, fail, opts) {
      var geo = plugin('Geolocation');
      if (geo) {
        geo.requestPermissions().then(function () {
          return geo.getCurrentPosition(opts || { enableHighAccuracy: true, timeout: 12000 });
        }).then(ok).catch(function (e) { if (fail) fail(e); });
        return;
      }
      if (navigator.geolocation) navigator.geolocation.getCurrentPosition(ok, fail || function () {}, opts);
      else if (fail) fail(new Error('no geolocation'));
    },

    /** Phone contacts through the DeviceFiles plugin. */
    listContacts: function () {
      var df = N.deviceFiles();
      if (!df) return Promise.resolve([]);
      return df.requestAccess({ contacts: true }).then(function (a) {
        if (!a.contacts) return [];
        return df.listContacts().then(function (r) { return r.contacts || []; });
      });
    },

    /** Called when the app returns to the foreground (e.g. back from Settings). */
    onResume: function (fn) {
      var app = plugin('App');
      if (app && app.addListener) app.addListener('appStateChange', function (s) { if (s && s.isActive) fn(); });
      else document.addEventListener('visibilitychange', function () { if (!document.hidden) fn(); });
    },

    // ---- Android back button -------------------------------------------
    _backStack: [],
    pushBack: function (fn) { N._backStack.push(fn); },
    popBack: function (fn) {
      var i = N._backStack.lastIndexOf(fn);
      if (i >= 0) N._backStack.splice(i, 1);
    }
  };

  var OVERLAYS = ['_galOv', '_aAudUI', '_aDocUI', '_aOvr', '_camOv', '_aLocUI', '_ctUI', '_pollUI', '_eventUI'];
  function closeTopOverlay() {
    if (N._backStack.length) { var f = N._backStack.pop(); try { f(); } catch (e) {} return true; }
    for (var i = 0; i < OVERLAYS.length; i++) {
      var el = document.getElementById(OVERLAYS[i]);
      if (el) { el.remove(); return true; }
    }
    return false;
  }

  if (isNative) {
    var app = plugin('App');
    if (app && app.addListener) {
      app.addListener('backButton', function (ev) {
        if (closeTopOverlay()) return;
        if (ev && ev.canGoBack) window.history.back();
        else if (app.minimizeApp) app.minimizeApp();
        else if (app.exitApp) app.exitApp();
      });
    }
  }

  // If the top bar hides under the Android status bar (Android 15+/16 draw edge-to-edge),
  // set SAFE_AREA_PADDING: true in config.js.
  if (isNative && (window.PHYSIO_CONFIG || {}).SAFE_AREA_PADDING) {
    var st = document.createElement('style');
    st.textContent = 'html body{box-sizing:border-box;padding-top:var(--safe-area-inset-top,env(safe-area-inset-top,0px));' +
      'padding-bottom:var(--safe-area-inset-bottom,env(safe-area-inset-bottom,0px))}';
    document.head.appendChild(st);
  }

  window.PhysioNative = N;
})();
