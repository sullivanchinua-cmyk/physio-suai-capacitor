/**
 * PhysioPickers - WhatsApp-style Gallery, Audio and Document pickers.
 * They list REAL files from the phone (MediaStore) through the DeviceFiles plugin.
 * In a normal browser (no native plugin) they open the system file chooser instead.
 *
 *   PhysioPickers.openGallery(cb)    cb(File)
 *   PhysioPickers.openAudio(cb)      cb(File)
 *   PhysioPickers.openDocuments(cb)  cb(File)
 */
(function () {
  var N = window.PhysioNative;
  var cfg = window.PHYSIO_CONFIG || {};
  var PAGE = 90;

  // ------------------------------------------------------------ helpers
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtSize(b) {
    b = Number(b) || 0;
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return Math.round(b / 1024) + ' kB';
    if (b < 1024 * 1024 * 1024) return (b / 1048576).toFixed(b < 10485760 ? 2 : 1) + ' MB';
    return (b / 1073741824).toFixed(1) + ' GB';
  }
  function fmtDur(ms) {
    var s = Math.round((Number(ms) || 0) / 1000), m = Math.floor(s / 60);
    s = s % 60;
    if (m >= 60) { var h = Math.floor(m / 60); m = m % 60; return h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }
  function fmtDate(sec) {
    var d = new Date(sec * 1000);
    return (d.getMonth() + 1) + '/' + d.getDate() + '/' + String(d.getFullYear()).slice(2);
  }
  var MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  function dayLabel(sec) {
    var now = new Date(), d = new Date(sec * 1000);
    var start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    var t = d.getTime();
    if (t >= start) return 'TODAY';
    if (t >= start - 864e5) return 'YESTERDAY';
    if (t >= start - 6 * 864e5) return 'THIS WEEK';
    if (t >= start - 13 * 864e5) return 'LAST WEEK';
    return MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }
  function chatTitle() {
    return (typeof friendName !== 'undefined' && friendName) ? friendName : 'Physiotherapy';
  }
  function chatRoom() {
    return (typeof chatId !== 'undefined' && chatId) ? 'priv_' + chatId : 'public_chat';
  }
  function toast(msg) {
    if (typeof showToast === 'function') { try { showToast(msg); return; } catch (e) {} }
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#1f2937;color:#fff;padding:10px 16px;border-radius:12px;font-size:13px;z-index:99999';
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2500);
  }

  var ICON_BACK = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>';
  var ICON_SEARCH = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
  var ICON_INFO = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  var ICON_FOLDER = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>';
  var ICON_PLAY = '<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><polygon points="7 4 20 12 7 20 7 4"/></svg>';
  var ICON_PAUSE = '<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
  var ICON_HEAD = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>';

  // One app-resume hook for all pickers (back from Settings after granting access)
  var resumeFn = null;
  N.onResume(function () { if (resumeFn) resumeFn(); });

  /** System file chooser fallback (browser, or "Browse other ..." button). */
  function browseSystem(accept, cb) {
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = accept;
    inp.style.cssText = 'position:fixed;top:-9999px;opacity:0;width:1px;height:1px;pointer-events:none';
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0];
      inp.remove();
      if (f && cb) cb(f);
    });
    document.body.appendChild(inp);
    inp.click();
  }

  /** Mount a full overlay and wire the Android back button to close it. */
  function mount(el, onClose) {
    document.body.appendChild(el);
    var closer = function () { close(); };
    function close() {
      N.popBack(closer);
      if (onClose) { try { onClose(); } catch (e) {} }
      el.remove();
    }
    N.pushBack(closer);
    return close;
  }

  function sheetCSS() {
    if (document.getElementById('_pkCSS')) return;
    var s = document.createElement('style');
    s.id = '_pkCSS';
    s.textContent =
      '@keyframes _pkUp{from{transform:translateY(100%)}to{transform:translateY(0)}}' +
      '@keyframes _pkSpin{to{transform:rotate(360deg)}}' +
      '._pkCell{position:relative;background:#1a1f2e;overflow:hidden;cursor:pointer;aspect-ratio:1;-webkit-tap-highlight-color:transparent}' +
      '._pkCell:active{opacity:.75}' +
      '._pkCell img{width:100%;height:100%;object-fit:cover;display:block}' +
      '._pkBadge{position:absolute;left:5px;bottom:5px;background:rgba(0,0,0,.6);color:#fff;font-size:11px;font-weight:700;padding:2px 6px;border-radius:10px;display:flex;align-items:center;gap:3px}' +
      '._pkSpin{position:absolute;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center}' +
      '._pkSpin i{width:26px;height:26px;border:3px solid rgba(255,255,255,.3);border-top-color:#ec4899;border-radius:50%;animation:_pkSpin .8s linear infinite}' +
      '._pkRow{display:flex;align-items:center;gap:14px;padding:12px 16px;border-bottom:1px solid rgba(42,57,66,.6);cursor:pointer;-webkit-tap-highlight-color:transparent}' +
      '._pkRow:active{background:#1a1f2e}' +
      '._pkHead{color:#8696a0;font-size:11px;font-weight:700;letter-spacing:1px;padding:14px 18px 6px;margin:0}' +
      '._pkEmpty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:60px 28px;text-align:center}' +
      '._pkEmpty p{color:#6b7280;font-size:14px;margin:0;line-height:1.5}' +
      '._pkBtn{background:linear-gradient(135deg,#9333ea,#ec4899);color:#fff;border:none;padding:10px 20px;border-radius:12px;font-weight:700;font-size:13px;cursor:pointer}';
    document.head.appendChild(s);
  }

  function emptyState(html, btnLabel, onBtn) {
    var d = document.createElement('div');
    d.className = '_pkEmpty';
    d.innerHTML = '<p>' + html + '</p>' + (btnLabel ? '<button class="_pkBtn">' + esc(btnLabel) + '</button>' : '');
    if (btnLabel) d.querySelector('button').onclick = onBtn;
    return d;
  }

  function spinnerRow() {
    var d = document.createElement('div');
    d.style.cssText = 'display:flex;justify-content:center;padding:30px';
    d.innerHTML = '<div style="position:relative;width:30px;height:30px"><div class="_pkSpin" style="background:none"><i></i></div></div>';
    return d;
  }

  // ------------------------------------------------------------ media grid (shared by Gallery + Docs>Media)
  function MediaGrid(host, scroller, df, onPick) {
    var state = { albumId: '', offset: 0, loading: false, more: true, gen: 0 };
    var io = null;

    function observer() {
      if (io) io.disconnect();
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var cell = en.target; io.unobserve(cell);
          var it = cell._item;
          df.getThumbnail({ uri: it.uri, id: it.id, kind: it.kind, size: 256 }).then(function (r) {
            var img = document.createElement('img');
            img.alt = '';
            img.onload = function () { cell.style.background = '#000'; };
            img.src = N.toWebUrl(r.path);
            cell.insertBefore(img, cell.firstChild);
          }).catch(function () {});
        });
      }, { root: scroller, rootMargin: '300px' });
    }

    function addCell(it) {
      var cell = document.createElement('div');
      cell.className = '_pkCell';
      cell._item = it;
      if (it.kind === 'video') {
        cell.innerHTML = '<div class="_pkBadge"><svg width="11" height="11" viewBox="0 0 24 24" fill="#fff"><polygon points="6 4 20 12 6 20"/></svg>' + fmtDur(it.duration) + '</div>';
      }
      cell.onclick = function () {
        if (cell._busy) return;
        cell._busy = true;
        var sp = document.createElement('div'); sp.className = '_pkSpin'; sp.innerHTML = '<i></i>';
        cell.appendChild(sp);
        N.fileFromUri(it).then(onPick).catch(function (e) {
          cell._busy = false; sp.remove();
          toast('Could not read this file');
          console.warn('[picker]', e);
        });
      };
      host.appendChild(cell);
      io.observe(cell);
    }

    function load(reset) {
      if (reset) { state.offset = 0; state.more = true; state.gen++; host.innerHTML = ''; observer(); }
      if (state.loading || !state.more) return Promise.resolve();
      state.loading = true;
      var gen = state.gen;
      return df.listMedia({ kind: 'all', albumId: state.albumId || undefined, limit: PAGE, offset: state.offset }).then(function (r) {
        if (gen !== state.gen) return;
        (r.items || []).forEach(addCell);
        state.offset += (r.items || []).length;
        state.more = !!r.hasMore;
        if (!state.offset) host.appendChild(emptyState('No photos or videos found on this phone.'));
      }).catch(function (e) {
        if (gen !== state.gen) return;
        throw e;
      }).then(function () { state.loading = false; }, function (e) { state.loading = false; throw e; });
    }

    function onScroll() {
      if (scroller.scrollTop + scroller.clientHeight > scroller.scrollHeight - 600) load(false).catch(function () {});
    }
    scroller.addEventListener('scroll', onScroll);

    return {
      reset: function (albumId) { state.albumId = albumId || ''; return load(true); },
      stop: function () { if (io) io.disconnect(); scroller.removeEventListener('scroll', onScroll); }
    };
  }

  /** Make sure we hold the permission; resolves with the access object. */
  function ensureAccess(df, what) {
    var req = {}; req[what] = true;
    return df.getAccess().then(function (a) {
      if (a[what]) return a;
      return df.requestAccess(req);
    });
  }

  // ------------------------------------------------------------ GALLERY
  function openGallery(cb) {
    var df = N.deviceFiles();
    if (!df) { browseSystem('image/*,video/*', cb); return; }
    sheetCSS();

    var ov = document.createElement('div');
    ov.id = '_galOv';
    ov.style.cssText = 'position:fixed;inset:0;z-index:9850;background:rgba(0,0,0,.5);display:flex;flex-direction:column;justify-content:flex-end';
    ov.innerHTML =
      '<div style="background:#111827;border-radius:20px 20px 0 0;height:85vh;display:flex;flex-direction:column;animation:_pkUp .28s cubic-bezier(.34,1.1,.64,1)">' +
        '<div style="padding:10px 0 6px;display:flex;justify-content:center;flex-shrink:0"><div style="width:36px;height:4px;background:#374151;border-radius:2px"></div></div>' +
        '<div style="display:flex;align-items:center;padding:6px 14px 12px;flex-shrink:0">' +
          '<button id="_pkClose" style="width:38px;height:38px;background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
          '<div style="flex:1"><p style="color:#f9fafb;font-weight:700;font-size:16px;margin:0">Photos</p><p id="_pkSub" style="color:#6b7280;font-size:12px;margin:1px 0 0">Recent</p></div>' +
          '<button id="_pkBrowse" style="background:linear-gradient(135deg,#9333ea,#ec4899);color:#fff;border:none;font-size:13px;font-weight:700;padding:8px 16px;border-radius:20px;cursor:pointer">Browse all</button>' +
        '</div>' +
        '<div style="display:flex;padding:0 16px;gap:4px;flex-shrink:0;border-bottom:1px solid #1f2937">' +
          '<button id="_pkTabP" style="background:none;border:none;border-bottom:2px solid #ec4899;color:#f9fafb;font-weight:700;font-size:14px;padding:8px 14px;cursor:pointer">Photos</button>' +
          '<button id="_pkTabA" style="background:none;border:none;border-bottom:2px solid transparent;color:#6b7280;font-weight:600;font-size:14px;padding:8px 14px;cursor:pointer">Albums</button>' +
        '</div>' +
        '<div id="_pkScroll" style="flex:1;overflow-y:auto;padding:2px">' +
          '<div id="_pkGrid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:2px"></div>' +
          '<div id="_pkAlbums" style="display:none"></div>' +
        '</div>' +
      '</div>';

    var done = false;
    var grid, close;
    function finish(file) {
      if (done) return; done = true;
      if (grid) grid.stop();
      close();
      if (cb) cb(file);
    }
    close = mount(ov, function () { if (grid) grid.stop(); });

    var $ = function (id) { return ov.querySelector(id); };
    $('#_pkClose').onclick = function () { close(); };
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    $('#_pkBrowse').onclick = function () { close(); setTimeout(function () { browseSystem('image/*,video/*', cb); }, 60); };

    var gridEl = $('#_pkGrid'), albumsEl = $('#_pkAlbums'), scroll = $('#_pkScroll');
    grid = MediaGrid(gridEl, scroll, df, finish);

    function tab(which) {
      var p = which === 'photos';
      $('#_pkTabP').style.cssText = 'background:none;border:none;border-bottom:2px solid ' + (p ? '#ec4899' : 'transparent') + ';color:' + (p ? '#f9fafb' : '#6b7280') + ';font-weight:' + (p ? 700 : 600) + ';font-size:14px;padding:8px 14px;cursor:pointer';
      $('#_pkTabA').style.cssText = 'background:none;border:none;border-bottom:2px solid ' + (p ? 'transparent' : '#ec4899') + ';color:' + (p ? '#6b7280' : '#f9fafb') + ';font-weight:' + (p ? 600 : 700) + ';font-size:14px;padding:8px 14px;cursor:pointer';
      gridEl.style.display = p ? 'grid' : 'none';
      albumsEl.style.display = p ? 'none' : 'block';
    }
    $('#_pkTabP').onclick = function () { tab('photos'); };
    $('#_pkTabA').onclick = function () { tab('albums'); loadAlbums(); };

    var albumsLoaded = false;
    function loadAlbums() {
      if (albumsLoaded) return;
      albumsLoaded = true;
      df.listAlbums().then(function (r) {
        albumsEl.innerHTML = '';
        var all = document.createElement('div');
        all.className = '_pkRow'; all.style.cssText += ';padding:12px 14px';
        all.innerHTML = '<div style="flex:1"><p style="color:#f9fafb;font-size:15px;font-weight:600;margin:0">Recent</p><p style="color:#6b7280;font-size:12px;margin:2px 0 0">All photos and videos</p></div>';
        all.onclick = function () { $('#_pkSub').textContent = 'Recent'; tab('photos'); grid.reset(''); };
        albumsEl.appendChild(all);
        (r.albums || []).forEach(function (a) {
          var row = document.createElement('div');
          row.className = '_pkRow'; row.style.cssText += ';padding:12px 14px';
          row.innerHTML = '<div style="flex:1;min-width:0"><p style="color:#f9fafb;font-size:15px;font-weight:600;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(a.name) + '</p><p style="color:#6b7280;font-size:12px;margin:2px 0 0">' + a.count + ' item' + (a.count === 1 ? '' : 's') + '</p></div>';
          row.onclick = function () { $('#_pkSub').textContent = a.name; tab('photos'); grid.reset(a.id); };
          albumsEl.appendChild(row);
        });
      }).catch(function () { albumsLoaded = false; });
    }

    function start() {
      gridEl.innerHTML = '';
      ensureAccess(df, 'media').then(function (a) {
        if (!a.media) {
          gridEl.style.display = 'block';
          gridEl.appendChild(emptyState('Allow access to your photos and videos so you can choose them here.', 'Allow access', function () {
            df.requestAccess({ media: true }).then(function (r) {
              if (r.media) { gridEl.style.display = 'grid'; start(); }
              else { df.openAppSettings(); toast('Turn on Photos and videos permission, then come back'); }
            });
          }));
          return;
        }
        gridEl.style.display = 'grid';
        grid.reset('').catch(function () { toast('Could not load photos'); });
      }).catch(function () { toast('Could not request permission'); });
    }
    start();
  }

  // ------------------------------------------------------------ AUDIO
  function openAudio(cb) {
    var df = N.deviceFiles();
    if (!df) { browseSystem('audio/*,.mp3,.m4a,.ogg,.wav,.aac,.flac,.opus', cb); return; }
    sheetCSS();

    var ov = document.createElement('div');
    ov.id = '_aAudUI';
    ov.style.cssText = 'position:fixed;inset:0;z-index:9850;background:#0d1117;display:flex;flex-direction:column;font-family:inherit';
    ov.innerHTML =
      '<div style="background:#1a1f2e;border-bottom:1px solid #2a3942;padding:12px 16px;display:flex;align-items:center;gap:12px;flex-shrink:0">' +
        '<button id="_pkBack" style="width:38px;height:38px;background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#e9edef">' + ICON_BACK + '</button>' +
        '<div id="_pkTitle" style="flex:1;min-width:0"><p style="color:#fff;font-weight:700;font-size:16px;margin:0">Send to ~ Audio</p><p style="color:#8696a0;font-size:12px;margin:0">Tap to select</p></div>' +
        '<input id="_pkQ" placeholder="Search audio" style="display:none;flex:1;background:#0d1117;border:1px solid #2a3942;border-radius:10px;color:#fff;padding:8px 12px;font-size:14px;outline:none;min-width:0"/>' +
        '<button id="_pkSearch" style="width:36px;height:36px;background:#2a3942;border-radius:10px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center">' + ICON_SEARCH + '</button>' +
      '</div>' +
      '<div id="_pkBanner"></div>' +
      '<div id="_pkList" style="flex:1;overflow-y:auto"></div>';

    var player = null, playingId = null;
    function stopPlayer() {
      if (player) { try { player.pause(); } catch (e) {} player = null; }
      if (playingId != null) {
        var b = ov.querySelector('[data-play="' + playingId + '"]');
        if (b) b.innerHTML = ICON_PLAY;
      }
      playingId = null;
    }
    var close = mount(ov, stopPlayer);
    var $ = function (s) { return ov.querySelector(s); };
    var list = $('#_pkList'), q = $('#_pkQ');
    var state = { offset: 0, more: true, loading: false, gen: 0, query: '', lastLabel: '' };

    function finish(file) { stopPlayer(); close(); if (cb) cb(file); }

    $('#_pkBack').onclick = function () { close(); };
    $('#_pkSearch').onclick = function () {
      var open = q.style.display === 'none';
      q.style.display = open ? 'block' : 'none';
      $('#_pkTitle').style.display = open ? 'none' : 'block';
      if (open) q.focus(); else { q.value = ''; reload(''); }
    };
    var qt = null;
    q.oninput = function () { clearTimeout(qt); qt = setTimeout(function () { reload(q.value); }, 250); };

    function row(a) {
      var el = document.createElement('div');
      el.className = '_pkRow';
      var sub = a.artist || a.album || '';
      el.innerHTML =
        '<button data-play="' + a.id + '" style="width:48px;height:48px;background:linear-gradient(145deg,#f59e0b,#d97706);border:none;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 8px rgba(245,158,11,.3);cursor:pointer">' + ICON_PLAY + '</button>' +
        '<div style="flex:1;min-width:0">' +
          '<p style="color:#e9edef;font-size:14.5px;font-weight:500;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(a.title || a.name) + '</p>' +
          (sub ? '<p style="color:#8696a0;font-size:12px;margin:2px 0 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(sub) + '</p>' : '') +
        '</div>' +
        '<div style="text-align:right;flex-shrink:0"><p style="color:#e9edef;font-size:13px;margin:0">' + fmtDur(a.duration) + '</p><p style="color:#6b7280;font-size:11.5px;margin:2px 0 0">' + fmtSize(a.size) + '</p></div>';
      el.querySelector('button').onclick = function (e) {
        e.stopPropagation();
        var btn = e.currentTarget;
        if (playingId === a.id) { stopPlayer(); return; }
        stopPlayer();
        playingId = a.id; btn.innerHTML = ICON_PAUSE;
        df.copyToCache({ uri: a.uri, name: a.name }).then(function (r) {
          if (playingId !== a.id) return;
          player = new Audio(N.toWebUrl(r.path));
          player.onended = stopPlayer;
          player.onerror = function () { stopPlayer(); toast('Cannot preview this audio'); };
          return player.play();
        }).catch(function () { stopPlayer(); });
      };
      el.onclick = function () {
        if (el._busy) return; el._busy = true; el.style.opacity = '.5';
        N.fileFromUri(a).then(finish).catch(function () { el._busy = false; el.style.opacity = '1'; toast('Could not read this file'); });
      };
      return el;
    }

    function addItems(items) {
      items.forEach(function (a) {
        var lab = dayLabel(a.dateAdded);
        if (lab !== state.lastLabel) {
          state.lastLabel = lab;
          var h = document.createElement('p'); h.className = '_pkHead'; h.textContent = lab; list.appendChild(h);
        }
        list.appendChild(row(a));
      });
    }

    function top() {
      var b = document.createElement('div');
      b.className = '_pkRow';
      b.innerHTML = '<div style="width:48px;height:48px;background:#2a3942;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0">' + ICON_FOLDER + '</div><div style="flex:1"><p style="color:#e9edef;font-size:14.5px;font-weight:600;margin:0">Browse other audio…</p><p style="color:#8696a0;font-size:12px;margin:2px 0 0">Choose from your files</p></div>';
      b.onclick = function () { close(); setTimeout(function () { browseSystem('audio/*,.mp3,.m4a,.ogg,.wav,.aac,.flac,.opus', cb); }, 60); };
      return b;
    }

    function load() {
      if (state.loading || !state.more) return;
      state.loading = true;
      var gen = state.gen;
      var sp = spinnerRow(); list.appendChild(sp);
      df.listAudio({ limit: 120, offset: state.offset, query: state.query }).then(function (r) {
        if (gen !== state.gen) return;
        sp.remove();
        addItems(r.items || []);
        state.offset += (r.items || []).length;
        state.more = !!r.hasMore;
        state.loading = false;
        if (!state.offset) list.appendChild(emptyState(state.query ? 'No audio matches your search.' : 'No audio files found on this phone.'));
      }).catch(function () { sp.remove(); state.loading = false; });
    }

    function reload(query) {
      state.gen++; state.offset = 0; state.more = true; state.loading = false; state.query = query || ''; state.lastLabel = '';
      list.innerHTML = '';
      list.appendChild(top());
      load();
    }
    list.addEventListener('scroll', function () {
      if (list.scrollTop + list.clientHeight > list.scrollHeight - 500) load();
    });

    function banner(show) {
      var b = $('#_pkBanner');
      if (!show) { b.innerHTML = ''; return; }
      b.innerHTML = '<div style="background:#1e3a5f;padding:10px 16px;display:flex;align-items:center;gap:10px">' + ICON_INFO +
        '<span style="color:#93c5fd;font-size:12.5px;flex:1">Allow storage access to see your audio files</span>' +
        '<button id="_pkAllow" style="background:#3b82f6;color:#fff;border:none;font-size:12px;font-weight:700;padding:5px 12px;border-radius:20px;cursor:pointer">Allow</button></div>';
      $('#_pkAllow').onclick = function () {
        df.requestAccess({ audio: true }).then(function (a) {
          if (a.audio) { banner(false); reload(''); } else { df.openAppSettings(); toast('Turn on Music and audio permission, then come back'); }
        });
      };
    }

    ensureAccess(df, 'audio').then(function (a) {
      banner(!a.audio);
      if (a.audio) reload('');
      else { list.appendChild(top()); }
    }).catch(function () { banner(true); list.appendChild(top()); });

    resumeFn = function () {
      if (!document.getElementById('_aAudUI')) return;
      df.getAccess().then(function (a) { if (a.audio && $('#_pkBanner').innerHTML) { banner(false); reload(''); } });
    };
  }

  // ------------------------------------------------------------ DOCUMENTS
  var TYPE_ICONS = {
    doc: { bg: '#1e40af', t: 'W' }, docx: { bg: '#1e40af', t: 'W' }, rtf: { bg: '#1e40af', t: 'W' }, odt: { bg: '#1e40af', t: 'W' },
    pdf: { bg: '#b91c1c', t: 'PDF' },
    xls: { bg: '#166534', t: 'X' }, xlsx: { bg: '#166534', t: 'X' }, ods: { bg: '#166534', t: 'X' }, csv: { bg: '#065f46', t: 'CSV' },
    ppt: { bg: '#9a3412', t: 'P' }, pptx: { bg: '#9a3412', t: 'P' }, odp: { bg: '#9a3412', t: 'P' },
    txt: { bg: '#374151', t: 'T' }, md: { bg: '#374151', t: 'MD' }, json: { bg: '#374151', t: '{}' },
    zip: { bg: '#4c1d95', t: 'ZIP' }, rar: { bg: '#4c1d95', t: 'RAR' }, '7z': { bg: '#4c1d95', t: '7Z' },
    epub: { bg: '#78350f', t: 'E' }
  };
  var DOC_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf,.odt,.ods,.odp,.zip,.rar,.7z,.epub,.json,.md';

  function openDocuments(cb) {
    var df = N.deviceFiles();
    if (!df) { browseSystem(DOC_ACCEPT, cb); return; }
    sheetCSS();

    var ov = document.createElement('div');
    ov.id = '_aDocUI';
    ov.style.cssText = 'position:fixed;inset:0;z-index:9850;background:#0d1117;display:flex;flex-direction:column;font-family:inherit';
    ov.innerHTML =
      '<div style="background:#1a1f2e;border-bottom:1px solid #2a3942;padding:12px 16px;display:flex;align-items:center;gap:12px;flex-shrink:0">' +
        '<button id="_pkBack" style="width:38px;height:38px;background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#e9edef">' + ICON_BACK + '</button>' +
        '<div id="_pkTitle" style="flex:1;min-width:0"><p style="color:#fff;font-weight:700;font-size:15px;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(chatTitle()) + '</p><p style="color:#8696a0;font-size:12px;margin:0">Send a document</p></div>' +
        '<input id="_pkQ" placeholder="Search documents" style="display:none;flex:1;background:#0d1117;border:1px solid #2a3942;border-radius:10px;color:#fff;padding:8px 12px;font-size:14px;outline:none;min-width:0"/>' +
        '<button id="_pkSearch" style="width:36px;height:36px;background:#2a3942;border-radius:10px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center">' + ICON_SEARCH + '</button>' +
      '</div>' +
      '<div id="_pkBanner"></div>' +
      '<div id="_pkTabs" style="display:flex;background:#1a1f2e;border-bottom:1px solid #2a3942;flex-shrink:0"></div>' +
      '<div id="_pkBody" style="flex:1;overflow-y:auto"></div>';

    var close = mount(ov);
    var $ = function (s) { return ov.querySelector(s); };
    var body = $('#_pkBody'), q = $('#_pkQ');
    var tabNow = 'Docs';
    var access = { allFiles: false, sdk: 0 };
    var mediaGrid = null;

    function finish(file) { close(); if (cb) cb(file); }

    $('#_pkBack').onclick = function () { close(); };
    $('#_pkSearch').onclick = function () {
      var open = q.style.display === 'none';
      q.style.display = open ? 'block' : 'none';
      $('#_pkTitle').style.display = open ? 'none' : 'block';
      if (open) { q.focus(); if (tabNow !== 'Docs') showTab('Docs'); } else { q.value = ''; docs.reload(''); }
    };
    var qt = null;
    q.oninput = function () { clearTimeout(qt); qt = setTimeout(function () { docs.reload(q.value); }, 250); };

    // ---- tabs
    function drawTabs() {
      $('#_pkTabs').innerHTML = ['Media', 'Docs', 'Links'].map(function (t) {
        var on = t === tabNow;
        return '<button data-tab="' + t + '" style="flex:1;background:none;border:none;border-bottom:2px solid ' + (on ? '#25d366' : 'transparent') + ';color:' + (on ? '#25d366' : '#8696a0') + ';font-size:14px;font-weight:' + (on ? 700 : 500) + ';padding:12px 0;cursor:pointer">' + t + '</button>';
      }).join('');
      $('#_pkTabs').querySelectorAll('button').forEach(function (b) { b.onclick = function () { showTab(b.getAttribute('data-tab')); }; });
    }
    function showTab(t) {
      tabNow = t; drawTabs();
      if (mediaGrid) { mediaGrid.stop(); mediaGrid = null; }
      body.innerHTML = '';
      body.onscroll = null;
      if (t === 'Docs') docs.reload(q.value || '');
      else if (t === 'Media') media();
      else links();
    }

    // ---- Docs
    var docs = (function () {
      var st = { offset: 0, more: true, loading: false, gen: 0, query: '', last: '' };
      function icon(ext) {
        var ic = TYPE_ICONS[ext] || { bg: '#374151', t: (ext || 'FILE').slice(0, 4).toUpperCase() };
        return '<div style="width:44px;height:52px;background:' + ic.bg + ';border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 6px rgba(0,0,0,.4);position:relative">' +
          '<div style="position:absolute;top:0;right:0;width:10px;height:10px;background:rgba(255,255,255,.25);border-radius:0 8px 0 8px"></div>' +
          '<span style="color:#fff;font-size:' + (ic.t.length > 2 ? 11 : 14) + 'px;font-weight:800">' + esc(ic.t) + '</span></div>';
      }
      function row(d) {
        var el = document.createElement('div');
        el.className = '_pkRow'; el.style.gap = '12px';
        el.innerHTML = icon(d.ext) +
          '<div style="flex:1;min-width:0"><p style="color:#e9edef;font-size:13.5px;font-weight:500;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(d.name) + '</p>' +
          '<p style="color:#6b7280;font-size:11.5px;margin:3px 0 0">' + fmtSize(d.size) + ' · ' + esc((d.ext || '').toUpperCase()) + ' · ' + fmtDate(d.dateModified || d.dateAdded) + '</p></div>';
        el.onclick = function () {
          if (el._busy) return; el._busy = true; el.style.opacity = '.5';
          N.fileFromUri(d).then(finish).catch(function () { el._busy = false; el.style.opacity = '1'; toast('Could not read this file'); });
        };
        return el;
      }
      function browseRow() {
        var b = document.createElement('div');
        b.className = '_pkRow';
        b.innerHTML = '<div style="width:44px;height:52px;background:#2a3942;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0">' + ICON_FOLDER + '</div><div style="flex:1"><p style="color:#e9edef;font-size:14px;font-weight:600;margin:0">Browse other docs…</p><p style="color:#8696a0;font-size:12px;margin:2px 0 0">Open the Android file chooser</p></div>';
        b.onclick = function () { close(); setTimeout(function () { browseSystem(DOC_ACCEPT, cb); }, 60); };
        return b;
      }
      function load() {
        if (st.loading || !st.more) return;
        st.loading = true;
        var gen = st.gen, sp = spinnerRow(); body.appendChild(sp);
        df.listDocuments({ limit: 120, offset: st.offset, query: st.query }).then(function (r) {
          if (gen !== st.gen) return;
          sp.remove();
          (r.items || []).forEach(function (d) {
            var lab = dayLabel(d.dateModified || d.dateAdded);
            if (lab !== st.last) { st.last = lab; var h = document.createElement('p'); h.className = '_pkHead'; h.textContent = lab; body.appendChild(h); }
            body.appendChild(row(d));
          });
          st.offset += (r.items || []).length;
          st.more = !!r.hasMore; st.loading = false;
          if (!st.offset) {
            body.appendChild(emptyState(st.query ? 'No documents match your search.' :
              (access.allFiles ? 'No documents found on this phone.' : (cfg.ALL_FILES_ACCESS === false ? 'Use “Browse other docs” to pick a file from your phone.' : 'Android only lets this app list its own documents.<br>Allow storage access above, or use “Browse other docs”.'))));
          }
        }).catch(function () { sp.remove(); st.loading = false; });
      }
      body.addEventListener('scroll', function () {
        if (tabNow === 'Docs' && body.scrollTop + body.clientHeight > body.scrollHeight - 500) load();
      });
      return {
        reload: function (query) {
          st.gen++; st.offset = 0; st.more = true; st.loading = false; st.query = query || ''; st.last = '';
          body.innerHTML = '';
          body.appendChild(browseRow());
          load();
        }
      };
    })();

    // ---- Media (recent photos & videos)
    function media() {
      var host = document.createElement('div');
      host.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:2px;padding:2px';
      body.appendChild(host);
      ensureAccess(df, 'media').then(function (a) {
        if (!a.media) {
          host.style.display = 'block';
          host.appendChild(emptyState('Allow access to your photos and videos to see them here.', 'Allow access', function () {
            df.requestAccess({ media: true }).then(function (r) { if (r.media) showTab('Media'); else df.openAppSettings(); });
          }));
          return;
        }
        mediaGrid = MediaGrid(host, body, df, finish);
        mediaGrid.reset('').catch(function () {});
      });
    }

    // ---- Links (from this chat's saved messages)
    function links() {
      var P = window.PhysioSQLite;
      var p = (P && P.enabled) ? P.links(chatRoom(), 200) : Promise.resolve([]);
      p.then(function (items) {
        body.innerHTML = '';
        if (!items.length) { body.appendChild(emptyState('No links shared in this chat yet.')); return; }
        items.forEach(function (it) {
          var el = document.createElement('div');
          el.className = '_pkRow';
          var host = it.url.replace(/^https?:\/\//, '').split('/')[0];
          el.innerHTML = '<div style="width:44px;height:44px;background:#1e3a5f;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg></div>' +
            '<div style="flex:1;min-width:0"><p style="color:#e9edef;font-size:13.5px;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(it.url) + '</p><p style="color:#6b7280;font-size:11.5px;margin:3px 0 0">' + esc(host) + ' · ' + fmtDate(it.ts / 1000) + '</p></div>';
          el.onclick = function () { close(); if (typeof _textCB === 'function') _textCB(it.url); };
          body.appendChild(el);
        });
      });
    }

    // ---- permission banner (Android "All files access" is what lets us list documents)
    function banner(show) {
      var b = $('#_pkBanner');
      if (!show) { b.innerHTML = ''; return; }
      b.innerHTML = '<div style="background:#1e3a5f;padding:10px 16px;display:flex;align-items:center;gap:10px">' + ICON_INFO +
        '<span style="color:#93c5fd;font-size:12.5px;flex:1">Allow storage access to browse your documents</span>' +
        '<button id="_pkAllow" style="background:#3b82f6;color:#fff;border:none;font-size:12px;font-weight:700;padding:5px 12px;border-radius:20px;cursor:pointer">Allow</button></div>';
      $('#_pkAllow').onclick = function () {
        if (access.sdk >= 30) df.openAllFilesSettings();           // Settings > All files access
        else df.requestAccess({ documents: true }).then(function () { recheck(); });
      };
    }
    function recheck() {
      return df.getAccess().then(function (a) {
        access = a;
        var need = cfg.ALL_FILES_ACCESS !== false && !a.allFiles;
        banner(need);
        return a;
      });
    }

    drawTabs();
    recheck().then(function () { showTab('Docs'); }).catch(function () { showTab('Docs'); });

    // coming back from the Settings screen
    resumeFn = function () {
      if (!document.getElementById('_aDocUI')) return;
      var was = access.allFiles;
      recheck().then(function (a) { if (a.allFiles && !was && tabNow === 'Docs') docs.reload(q.value || ''); });
    };
  }

  window.PhysioPickers = { openGallery: openGallery, openAudio: openAudio, openDocuments: openDocuments };
})();
