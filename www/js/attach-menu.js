/**
 * PHYSIO SUAI – Attach Menu (Capacitor edition)
 *
 *  - The 8-item attach sheet, Camera (WebRTC), Location, Contact, Poll and Event
 *    live in this file.
 *  - Gallery / Audio / Document pickers are real WhatsApp-style pickers that
 *    read the phone's files through the native DeviceFiles plugin.
 *    They live in js/native/pickers.js and fall back to the system file
 *    chooser when running in a normal browser.
 */

var _attachCB  = null;

function _injectStyles() {
  if (document.getElementById('_aCSSr16')) return;
  var s = document.createElement('style'); s.id = '_aCSSr16';
  s.textContent = [
    '@keyframes _aUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}',
    '._ao{position:fixed;inset:0;z-index:9800;background:rgba(0,0,0,.55);display:flex;align-items:flex-end}',
    '._ap{width:100%;max-width:520px;margin:0 auto;background:#1f2c34;border-radius:20px 20px 0 0;padding:20px 16px 36px;animation:_aUp .25s cubic-bezier(.34,1.1,.64,1)}',
    '._ah{width:36px;height:4px;background:#4b5563;border-radius:2px;margin:0 auto 22px}',
    '._ag{display:grid;grid-template-columns:repeat(4,1fr);gap:20px 8px}',
    '._ai{display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;-webkit-tap-highlight-color:transparent;background:none;border:none;padding:4px;font-family:inherit}',
    '._ai:active ._aic{transform:scale(.88)}',
    '._aic{width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;transition:transform .1s;background:linear-gradient(135deg,#9333ea,#ec4899)}',
    '._aic svg{width:28px;height:28px;pointer-events:none}',
    '._ail{font-size:12.5px;color:#e5e7eb;font-weight:500;pointer-events:none}'
  ].join('');
  document.head.appendChild(s);
}

var SVGS = {
  gallery:  '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>',
  camera:   '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  location: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  contact:  '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  document: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  audio:    '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>',
  poll:     '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  event:    '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
};

function showAttachMenu(callback, opts) {
  // Debounce: ignore calls within 600ms of the last one
  var now = Date.now();
  if (now - (showAttachMenu._last||0) < 600) return;
  showAttachMenu._last = now;

  _attachCB = callback;
  _injectStyles();
  window._attachOpts = opts || {};

  var existing = document.getElementById('_aOvr');
  if (existing) { existing.remove(); _attachCB = null; return; }

  var ITEMS = [
    { id:'gallery',  label:'Gallery',  inputId:null },
    { id:'camera',   label:'Camera',   inputId:null },
    { id:'location', label:'Location', inputId:null },
    { id:'contact',  label:'Contact',  inputId:null },
    { id:'document', label:'Document', inputId:null           },
    { id:'audio',    label:'Audio',    inputId:null           },
    { id:'poll',     label:'Poll',     inputId:null },
    { id:'event',    label:'Event',    inputId:null }
  ];

  var overlay = document.createElement('div');
  overlay.id = '_aOvr'; overlay.className = '_ao';
  var _ready = false;
  setTimeout(function(){ _ready = true; }, 400);
  overlay.addEventListener('click', function(e){
    if (_ready && e.target === overlay){ overlay.remove(); _attachCB = null; }
  });

  var panel = document.createElement('div'); panel.className = '_ap';
  panel.innerHTML = '<div class="_ah"></div><div class="_ag" id="_aGrid"></div>';
  var grid = panel.querySelector('#_aGrid');

  ITEMS.forEach(function(item) {
    var inner = '<div class="_aic">'+(SVGS[item.id]||'')+'</div><span class="_ail">'+item.label+'</span>';

    if (item.inputId) {
      // GALLERY/DOC/AUDIO: <label for="input"> — user's real touch routes to input
      var lbl = document.createElement('label');
      lbl.className = '_ai'; lbl.htmlFor = item.inputId;
      lbl.innerHTML = inner;
      lbl.addEventListener('click', function(e) {
        e.stopPropagation();
        _attachCB = callback;
        // CRITICAL: Delay overlay removal — removing label from DOM during click
        // cancels the file picker gesture in Android WebView
        setTimeout(function() { overlay.remove(); }, 500);
      });
      grid.appendChild(lbl);
    } else {
      // NON-FILE (camera, location, contact, poll, event)
      var btn = document.createElement('button');
      btn.className = '_ai'; btn.type = 'button';
      btn.innerHTML = inner;
      var _actionId = item.id;
      btn.onclick = function(e) {
        e.stopPropagation();
        overlay.remove();
        _execAction(_actionId);
      };
      grid.appendChild(btn);
    }
  });

  overlay.appendChild(panel);
  document.body.appendChild(overlay);
}

function _execAction(action) {
  var P = window.PhysioPickers;
  if (action==='gallery')  { if (P) P.openGallery(_attachCB);  return; }
  if (action==='camera')   { _openCameraWebRTC();              return; }
  if (action==='location') { _openLocationUI();                return; }
  if (action==='audio')    { if (P) P.openAudio(_attachCB);    return; }
  if (action==='document') { if (P) P.openDocuments(_attachCB);return; }
  if (action==='contact')  { _openContactPicker();             return; }
  if (action==='poll')     { _openPoll();                      return; }
  if (action==='event')    { _openEvent();                     return; }
}

// ── CAMERA: WebRTC getUserMedia — WhatsApp style with Video/Photo/Video note ──
function _openCameraWebRTC() {
  // Inject CSS once
  if (!document.getElementById('_camCSS')) {
    var cs = document.createElement('style'); cs.id = '_camCSS';
    cs.textContent = '@keyframes spin{to{transform:rotate(360deg)}}@keyframes _recBlink{0%,100%{opacity:1}50%{opacity:.3}}';
    document.head.appendChild(cs);
  }

  var ov = document.createElement('div');
  ov.id = '_camOv';
  ov.style.cssText = 'position:fixed;inset:0;z-index:9900;background:#000;display:flex;flex-direction:column';

  ov.innerHTML =
    // Top bar
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px 10px;position:absolute;top:0;left:0;right:0;z-index:10">' +
      '<button id="_camClose" style="width:44px;height:44px;background:rgba(0,0,0,.5);border-radius:50%;border:none;cursor:pointer;color:#fff;font-size:20px;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button>' +
      '<div id="_camTimer" style="display:none;background:rgba(0,0,0,.55);border-radius:20px;padding:5px 16px;color:#fff;font-size:15px;font-weight:700;letter-spacing:1px">00:00</div>' +
      '<button id="_camFlash" style="width:44px;height:44px;background:rgba(0,0,0,.5);border-radius:50%;border:none;cursor:pointer;color:#fff;font-size:20px;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)">⚡</button>' +
    '</div>' +

    // Viewfinder - full screen
    '<video id="_camVid" autoplay playsinline muted style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></video>' +

    // Recording dot
    '<div id="_camRecDot" style="display:none;position:absolute;top:72px;left:50%;transform:translateX(-50%);width:10px;height:10px;background:#ec4899;border-radius:50%;animation:_recBlink 1s infinite;z-index:10"></div>' +

    // Circle overlay for video note mode
    '<div id="_camCircleOv" style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;pointer-events:none;z-index:5">' +
      '<div style="width:min(80vw,80vh);height:min(80vw,80vh);border-radius:50%;border:3px solid rgba(255,255,255,.6);box-shadow:0 0 0 9999px rgba(0,0,0,.55)"></div>' +
    '</div>' +

    // Bottom controls
    '<div style="position:absolute;bottom:0;left:0;right:0;z-index:10;padding:0 0 40px">' +
      // Mode tabs
      '<div style="display:flex;justify-content:center;gap:28px;margin-bottom:24px">' +
        '<button id="_camModeVideo" style="background:none;border:none;color:rgba(255,255,255,.55);font-size:14px;font-weight:600;cursor:pointer;padding:4px 10px;border-radius:20px">Video</button>' +
        '<button id="_camModePhoto" style="background:rgba(255,255,255,.15);border:none;color:#fff;font-size:14px;font-weight:700;cursor:pointer;padding:4px 18px;border-radius:20px;backdrop-filter:blur(4px)">Photo</button>' +
        '<button id="_camModeNote" style="background:none;border:none;color:rgba(255,255,255,.55);font-size:14px;font-weight:600;cursor:pointer;padding:4px 10px;border-radius:20px">Note</button>' +
      '</div>' +
      // Shutter row
      '<div style="display:flex;align-items:center;justify-content:space-around;padding:0 30px">' +
        // Gallery thumb
        '<button id="_camGalleryBtn" style="width:54px;height:54px;border-radius:14px;background:rgba(255,255,255,.15);border:1.5px solid rgba(255,255,255,.2);cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>' +
        '</button>' +
        // Shutter button
        '<button id="_camSnap" style="width:80px;height:80px;border-radius:50%;background:none;border:4px solid rgba(255,255,255,.8);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;-webkit-tap-highlight-color:transparent">' +
          '<div id="_camSnapInner" style="width:64px;height:64px;border-radius:50%;background:#fff;transition:all .15s"></div>' +
        '</button>' +
        // Flip
        '<button id="_camFlip" style="width:54px;height:54px;border-radius:50%;background:rgba(255,255,255,.15);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M1 4v6h6"/><path d="M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"/></svg>' +
        '</button>' +
      '</div>' +
    '</div>' +

    '<canvas id="_camCanvas" style="display:none"></canvas>';

  document.body.appendChild(ov);

  var stream = null, mediaRecorder = null, recChunks = [], timerInt = null, recSecs = 0;
  var facingMode = 'environment', camMode = 'photo', _isRecording = false;
  var vid = ov.querySelector('#_camVid');
  var canvas = ov.querySelector('#_camCanvas');

  // Mode selector
  function _camSetMode(mode) {
    camMode = mode;
    var btns = [['Video','_camModeVideo'],['Photo','_camModePhoto'],['Note','_camModeNote']];
    btns.forEach(function(b){
      var el = ov.querySelector('#'+b[1]); if (!el) return;
      var on = b[0].toLowerCase() === mode;
      el.style.background = on ? 'rgba(255,255,255,.15)' : 'none';
      el.style.color = on ? '#fff' : 'rgba(255,255,255,.55)';
      el.style.fontWeight = on ? '700' : '600';
    });
    var inner = ov.querySelector('#_camSnapInner');
    var circOv = ov.querySelector('#_camCircleOv');
    if (mode === 'photo') {
      inner.style.cssText = 'width:64px;height:64px;border-radius:50%;background:#fff;transition:all .15s';
      if (circOv) circOv.style.display = 'none';
    } else if (mode === 'video') {
      inner.style.cssText = 'width:28px;height:28px;border-radius:5px;background:linear-gradient(135deg,#9333ea,#ec4899);transition:all .15s';
      if (circOv) circOv.style.display = 'none';
    } else {
      inner.style.cssText = 'width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#9333ea,#ec4899);transition:all .15s';
      if (circOv) { circOv.style.display = 'flex'; }
    }
  }
  window._camSetMode = _camSetMode;

  ov.querySelector('#_camModeVideo').onclick = function() { _camSetMode('video'); };
  ov.querySelector('#_camModePhoto').onclick = function() { _camSetMode('photo'); };
  ov.querySelector('#_camModeNote').onclick  = function() { _camSetMode('note'); };

  function _stopRec() {
    if (timerInt) { clearInterval(timerInt); timerInt = null; }
    var timerEl = ov.querySelector('#_camTimer'); if (timerEl) timerEl.style.display = 'none';
    var recDot = ov.querySelector('#_camRecDot'); if (recDot) recDot.style.display = 'none';
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
  }

  function startCam(facing) {
    if (stream) stream.getTracks().forEach(function(t){ t.stop(); });
    navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: true })
      .then(function(s) { stream = s; vid.srcObject = s; })
      .catch(function() {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false })
          .then(function(s) { stream = s; vid.srcObject = s; })
          .catch(function() {
            // WebRTC unavailable — fallback to file input
            ov.remove();
            var inp = document.createElement('input');
            inp.type = 'file'; inp.accept = 'image/*'; inp.setAttribute('capture','environment');
            inp.style.cssText = 'position:fixed;top:-9999px;opacity:0';
            document.body.appendChild(inp);
            inp.onchange = function(){ if(inp.files[0]&&_attachCB){var cb=_attachCB;_attachCB=null;cb(inp.files[0]);} inp.remove(); };
            setTimeout(function(){ inp.click(); }, 100);
          });
      });
  }

  ov.querySelector('#_camClose').onclick = function() {
    _stopRec();
    if (stream) stream.getTracks().forEach(function(t){ t.stop(); });
    ov.remove(); delete window._camSetMode;
  };
  ov.querySelector('#_camFlip').onclick = function() {
    facingMode = facingMode === 'environment' ? 'user' : 'environment';
    startCam(facingMode);
  };
  ov.querySelector('#_camGalleryBtn').onclick = function() {
    // Camera screen -> open the real gallery picker
    var _cb = _attachCB;
    _stopRec();
    if (stream) stream.getTracks().forEach(function(t){ t.stop(); });
    ov.remove(); delete window._camSetMode;
    if (window.PhysioPickers) PhysioPickers.openGallery(_cb);
  };

  ov.querySelector('#_camSnap').onclick = function() {
    if (camMode === 'photo') {
      canvas.width = vid.videoWidth || 640;
      canvas.height = vid.videoHeight || 480;
      canvas.getContext('2d').drawImage(vid, 0, 0);
      if (stream) stream.getTracks().forEach(function(t){ t.stop(); });
      canvas.toBlob(function(blob) {
        ov.remove(); delete window._camSetMode;
        if (blob && _attachCB) { var cb = _attachCB; _attachCB = null; cb(new File([blob], 'photo_'+Date.now()+'.jpg', { type: 'image/jpeg' })); }
      }, 'image/jpeg', 0.92);
    } else {
      if (!_isRecording) {
        _isRecording = true; recChunks = []; recSecs = 0;
        var timerEl = ov.querySelector('#_camTimer');
        var recDot = ov.querySelector('#_camRecDot');
        if (timerEl) { timerEl.style.display = 'block'; timerEl.textContent = '00:00'; }
        if (recDot) recDot.style.display = 'block';
        timerInt = setInterval(function() {
          recSecs++;
          var m = Math.floor(recSecs/60), s = recSecs%60;
          if (timerEl) timerEl.textContent = (m<10?'0':'')+m+':'+(s<10?'0':'')+s;
        }, 1000);
        var inner = ov.querySelector('#_camSnapInner');
        if (inner) inner.style.cssText = 'width:24px;height:24px;border-radius:4px;background:#ec4899;transition:all .15s';
        try {
          mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.ondataavailable = function(e){ if(e.data&&e.data.size>0) recChunks.push(e.data); };
          mediaRecorder.onstop = function() {
            var blob = new Blob(recChunks, { type: 'video/webm' });
            ov.remove(); delete window._camSetMode;
            if (_attachCB) { var cb = _attachCB; _attachCB = null; cb(new File([blob], (camMode==='note'?'vidnote_':'video_')+Date.now()+'.webm', { type: 'video/webm' })); }
          };
          mediaRecorder.start();
        } catch(e) { _stopRec(); _isRecording = false; }
      } else {
        _isRecording = false;
        _stopRec();
      }
    }
  };

  // No WebRTC? fallback immediately
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    ov.remove();
    var inp = document.createElement('input');
    inp.type='file'; inp.accept='image/*'; inp.setAttribute('capture','environment');
    inp.style.cssText='position:fixed;top:-9999px;opacity:0';
    document.body.appendChild(inp);
    inp.onchange=function(){ if(inp.files[0]&&_attachCB){var cb=_attachCB;_attachCB=null;cb(inp.files[0]);} inp.remove(); };
    setTimeout(function(){ inp.click(); }, 100);
    return;
  }

  startCam(facingMode);
  _camSetMode('photo');
}

// ── LOCATION: Full-screen WhatsApp style ─────────────────────────────────────
function _openLocationUI() {
  var d = document.createElement('div');
  d.id = '_aLocUI';
  d.style.cssText = 'position:fixed;inset:0;z-index:9850;background:#0d0f1a;display:flex;flex-direction:column';
  d.innerHTML =
    '<div style="background:#1a1f2e;border-bottom:1px solid #2a3942;padding:12px 16px;display:flex;align-items:center;gap:12px;flex-shrink:0">' +
      '<button onclick="document.getElementById(\'_aLocUI\').remove()" style="width:40px;height:40px;background:#2a3942;border-radius:12px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e9edef" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
      '</button>' +
      '<span style="color:#fff;font-weight:700;font-size:16px;flex:1">Send location</span>' +
      '<button id="_aLocRefresh" style="width:36px;height:36px;background:#2a3942;border-radius:10px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>' +
      '</button>' +
    '</div>' +
    '<div style="height:200px;background:#0b141a;position:relative;flex-shrink:0;overflow:hidden">' +
      '<div id="_aLocMapEl" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center">' +
        '<div style="text-align:center"><div style="width:36px;height:36px;border:3px solid #9333ea;border-top:3px solid transparent;border-radius:50%;margin:0 auto 10px;animation:spin .8s linear infinite"></div><p style="color:#6b7280;font-size:13px;margin:0">Getting your location...</p></div>' +
      '</div>' +
    '</div>' +
    '<div style="flex:1;overflow-y:auto">' +
      '<div id="_aLocShareCurrent" style="padding:16px 18px;border-bottom:1px solid #2a3942;display:flex;align-items:center;gap:14px;cursor:pointer;-webkit-tap-highlight-color:transparent">' +
        '<div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#9333ea,#ec4899);display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
          '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>' +
        '</div>' +
        '<div><p style="color:#fff;font-weight:600;font-size:15px;margin:0">Send your current location</p>' +
        '<p id="_aLocAccuracy" style="color:#8696a0;font-size:12px;margin:2px 0 0">Getting location...</p></div>' +
      '</div>' +
      '<div style="padding:12px 18px">' +
        '<p style="color:#8696a0;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;margin:0 0 8px">Nearby places</p>' +
        '<div id="_aLocNearby" style="color:#6b7280;font-size:13px">Loading nearby places...</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(d);

  var _lat = null, _lng = null;

  function _gotLocation(p) {
    _lat = p.coords.latitude.toFixed(5);
    _lng = p.coords.longitude.toFixed(5);
    var acc = p.coords.accuracy ? 'Accurate to ' + Math.round(p.coords.accuracy) + ' meters' : 'Location found';
    var accEl = document.getElementById('_aLocAccuracy');
    if (accEl) accEl.textContent = acc;
    var mapEl = document.getElementById('_aLocMapEl');
    if (mapEl) {
      mapEl.innerHTML = '<iframe src="https://www.openstreetmap.org/export/embed.html?bbox='+(_lng-0.004)+','+(_lat-0.003)+','+(_lng*1+0.004)+','+(_lat*1+0.003)+'&layer=mapnik&marker='+_lat+','+_lng+'" style="width:100%;height:100%;border:none;pointer-events:none" scrolling="no"></iframe>';
    }
    var nbEl = document.getElementById('_aLocNearby');
    if (nbEl) {
      nbEl.innerHTML = '<a href="https://maps.google.com/?q='+_lat+','+_lng+'&z=16" target="_blank" style="display:block;color:#a78bfa;font-size:13px;text-decoration:none;padding:8px 0;border-bottom:1px solid #1a1f2e">🗺️ Open in Google Maps</a>' +
        '<p style="color:#6b7280;font-size:12px;margin:8px 0 0">Tap to see nearby places</p>';
    }
  }

  document.getElementById('_aLocShareCurrent').onclick = function() {
    if (!_lat) { return; }
    d.remove();
    _textCB('📍 Location: https://maps.google.com/?q=' + _lat + ',' + _lng);
  };
  document.getElementById('_aLocRefresh').onclick = function() {
    _lat = null; _lng = null;
    PhysioNative.getPosition(_gotLocation, function(){}, { enableHighAccuracy: true, timeout: 12000 });
  };
  PhysioNative.getPosition(_gotLocation, function() {
    var accEl = document.getElementById('_aLocAccuracy');
    if (accEl) accEl.textContent = 'Could not get location — allow location access and enable GPS';
  }, { enableHighAccuracy: true, timeout: 12000 });
}

// ── CONTACT PICKER: Full-screen — App contacts + Phone contacts (native contacts via Capacitor) ──
function _openContactPicker() {
  var ex = document.getElementById('_ctUI'); if (ex) ex.remove();

  var d = document.createElement('div');
  d.id = '_ctUI';
  d.style.cssText = 'position:fixed;inset:0;z-index:9850;background:#0b0f1a;display:flex;flex-direction:column;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';

  d.innerHTML =
    '<div style="background:linear-gradient(135deg,#1a1040,#0f1a2e);border-bottom:1px solid rgba(147,51,234,.25);padding:14px 16px 10px;flex-shrink:0">' +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">' +
        '<button id="_ctClose" style="width:42px;height:42px;background:rgba(147,51,234,.18);border-radius:14px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;-webkit-tap-highlight-color:transparent">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
        '</button>' +
        '<div style="flex:1">' +
          '<p style="color:#f3e8ff;font-weight:800;font-size:17px;margin:0">Contacts to send</p>' +
          '<p id="_ctSelCount" style="color:#a78bfa;font-size:12px;font-weight:600;margin:2px 0 0">0 selected</p>' +
        '</div>' +
        '<button id="_ctSearchToggle" style="width:42px;height:42px;background:rgba(147,51,234,.18);border-radius:14px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;-webkit-tap-highlight-color:transparent">' +
          '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
        '</button>' +
      '</div>' +
      '<div id="_ctChips" style="display:none;flex-wrap:nowrap;overflow-x:auto;gap:8px;padding-bottom:6px;scrollbar-width:none"></div>' +
      '<div id="_ctSearchBar" style="display:none;background:rgba(255,255,255,.07);border:1.5px solid rgba(147,51,234,.35);border-radius:14px;padding:10px 14px;gap:10px;align-items:center;margin-top:6px">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
        '<input id="_ctSearchInp" placeholder="Search name or number..." type="text" autocomplete="off" style="flex:1;background:none;border:none;color:#f3e8ff;font-size:14px;outline:none;font-family:inherit" oninput="_ctDoSearch(this.value)">' +
        '<button onclick="document.getElementById(\'_ctSearchInp\').value=\'\';_ctDoSearch(\'\')" style="background:none;border:none;color:#6b7280;font-size:18px;cursor:pointer;padding:0;line-height:1">✕</button>' +
      '</div>' +
    '</div>' +
    '<div style="display:flex;background:#0f1520;border-bottom:1px solid rgba(147,51,234,.2);flex-shrink:0">' +
      '<button id="_ctTabApp" onclick="_ctSwitchTab(\'app\')" style="flex:1;background:none;border:none;border-bottom:3px solid #ec4899;padding:13px 8px;color:#ec4899;font-weight:700;font-size:13.5px;cursor:pointer;-webkit-tap-highlight-color:transparent;display:flex;align-items:center;justify-content:center;gap:6px">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>' +
        'App Contacts' +
      '</button>' +
      '<button id="_ctTabPhone" onclick="_ctSwitchTab(\'phone\')" style="flex:1;background:none;border:none;border-bottom:3px solid transparent;padding:13px 8px;color:#6b7280;font-weight:600;font-size:13.5px;cursor:pointer;-webkit-tap-highlight-color:transparent;display:flex;align-items:center;justify-content:center;gap:6px">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>' +
        'Phone Contacts' +
      '</button>' +
    '</div>' +
    '<div id="_ctList" style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch"></div>' +
    '<div id="_ctSendBar" style="display:none;padding:14px 16px 32px;background:linear-gradient(to top,#0b0f1a 80%,transparent);flex-shrink:0;border-top:1px solid rgba(147,51,234,.2)">' +
      '<button id="_ctSendBtn" style="width:100%;background:linear-gradient(135deg,#9333ea,#ec4899);border:none;border-radius:18px;color:#fff;font-weight:800;font-size:15px;padding:16px;cursor:pointer;box-shadow:0 6px 24px rgba(147,51,234,.45);-webkit-tap-highlight-color:transparent">Send Contact</button>' +
    '</div>';

  document.body.appendChild(d);

  var _tab = 'app', _selected = [], _appContacts = [], _phoneContacts = [], _phoneLoaded = false, _searchOpen = false, _activeList = [];
  var COLORS = ['#ec4899','#8b5cf6','#3b82f6','#10b981','#f97316','#06b6d4','#a855f7','#ef4444'];
  function _clr(n){ return COLORS[(n||'?').charCodeAt(0)%COLORS.length]; }
  function _ini(n){ return (n||'?')[0].toUpperCase(); }
  function _xesc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

  function _renderChips() {
    var chips=document.getElementById('_ctChips'),cnt=document.getElementById('_ctSelCount'),bar=document.getElementById('_ctSendBar'),btn=document.getElementById('_ctSendBtn');
    if(cnt)cnt.textContent=_selected.length+' selected';
    if(bar)bar.style.display=_selected.length>0?'block':'none';
    if(btn)btn.textContent='Send '+_selected.length+' Contact'+(_selected.length!==1?'s':'');
    if(!chips)return;
    if(!_selected.length){chips.style.display='none';chips.innerHTML='';return;}
    chips.style.display='flex';
    chips.innerHTML=_selected.map(function(c,i){
      return '<div style="display:flex;align-items:center;gap:6px;background:rgba(147,51,234,.22);border:1.5px solid rgba(147,51,234,.4);border-radius:24px;padding:5px 10px 5px 6px;flex-shrink:0;max-width:140px">'+
        '<div style="width:26px;height:26px;border-radius:50%;background:'+_clr(c.name)+';display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;color:#fff;flex-shrink:0">'+_ini(c.name)+'</div>'+
        '<span style="color:#e9d5ff;font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:70px">'+_xesc(c.name)+'</span>'+
        '<button onclick="_ctDeselectIdx('+i+')" style="background:none;border:none;color:#a78bfa;font-size:15px;cursor:pointer;padding:0;line-height:1;flex-shrink:0;margin-left:2px">✕</button>'+
      '</div>';
    }).join('');
  }

  window._ctDeselectIdx = function(idx){ _selected.splice(idx,1); _renderChips(); _renderList(_activeList); };

  function _renderList(contacts) {
    _activeList = contacts;
    var list = document.getElementById('_ctList'); if(!list)return;
    if(!contacts||!contacts.length){
      list.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 24px;gap:14px">'+
        '<div style="width:72px;height:72px;border-radius:50%;background:rgba(147,51,234,.12);display:flex;align-items:center;justify-content:center"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="1.6"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>'+
        (_tab==='phone'
          ?'<p style="color:#e9d5ff;font-size:15px;font-weight:700;margin:0;text-align:center">Phone Contacts</p><p style="color:#6b7280;font-size:13px;margin:0;text-align:center;line-height:1.5">Contacts permission was denied, or there are no contacts on this phone.</p><button id="_ctPhoneRetry" onclick="_ctLoadPhone()" style="margin-top:4px;background:linear-gradient(135deg,#9333ea,#ec4899);border:none;border-radius:12px;color:#fff;font-size:14px;font-weight:700;padding:11px 24px;cursor:pointer">Allow Access</button>'
          :'<p style="color:#e9d5ff;font-size:15px;font-weight:700;margin:0">No app users found</p><p style="color:#6b7280;font-size:13px;margin:0;text-align:center">No other users are registered yet.</p>')+
      '</div>';
      return;
    }
    list.innerHTML=contacts.map(function(c,i){
      var sel=_selected.some(function(s){return(s.uid&&s.uid===c.uid)||(s.name===c.name&&s.phone===c.phone);});
      var bg=_clr(c.name),sub=c.phone||c.email||(_tab==='app'?'App user':'');
      return '<div onclick="_ctToggle('+i+')" style="display:flex;align-items:center;gap:14px;padding:13px 18px;border-bottom:1px solid rgba(255,255,255,.05);cursor:pointer;background:'+(sel?'rgba(147,51,234,.14)':'transparent')+';-webkit-tap-highlight-color:transparent;transition:background .12s">'+
        '<div style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,'+bg+',#8b5cf6);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;color:#fff;flex-shrink:0;box-shadow:0 4px 12px rgba(0,0,0,.3)">'+_ini(c.name)+'</div>'+
        '<div style="flex:1;min-width:0"><p style="color:#f3e8ff;font-weight:700;font-size:15px;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+_xesc(c.name||'Unknown')+'</p>'+(sub?'<p style="color:#8696a0;font-size:12.5px;margin:3px 0 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+_xesc(sub)+'</p>':'')+'</div>'+
        '<div style="width:26px;height:26px;border-radius:50%;border:2.5px solid '+(sel?'transparent':'rgba(255,255,255,.2)')+';background:'+(sel?'linear-gradient(135deg,#9333ea,#ec4899)':'transparent')+';display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:'+(sel?'0 3px 10px rgba(147,51,234,.5)':'none')+'">'+
          (sel?'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>':'')+
        '</div>'+
      '</div>';
    }).join('');
  }

  window._ctToggle = function(idx){
    var c=_activeList[idx]; if(!c)return;
    var pos=_selected.findIndex(function(s){return(s.uid&&s.uid===c.uid)||(s.name===c.name&&s.phone===c.phone);});
    if(pos>=0)_selected.splice(pos,1); else _selected.push({uid:c.uid||null,name:c.name,phone:c.phone||'',email:c.email||''});
    _renderChips(); _renderList(_activeList);
  };

  window._ctDoSearch = function(q){
    var src=_tab==='app'?_appContacts:_phoneContacts;
    if(!q){_renderList(src);return;}
    var ql=q.toLowerCase();
    _renderList(src.filter(function(c){return(c.name||'').toLowerCase().includes(ql)||(c.phone||'').includes(q)||(c.email||'').toLowerCase().includes(ql);}));
  };

  window._ctSwitchTab = function(tab){
    _tab=tab;
    ['App','Phone'].forEach(function(t){
      var b=document.getElementById('_ctTab'+t); if(!b)return;
      var on=(t.toLowerCase()===tab);
      b.style.borderBottomColor=on?'#ec4899':'transparent';
      b.style.color=on?'#ec4899':'#6b7280';
      b.style.fontWeight=on?'700':'600';
    });
    var si=document.getElementById('_ctSearchInp'); if(si)si.value='';
    if(tab==='phone'){if(!_phoneLoaded)_ctLoadPhone();else _renderList(_phoneContacts);}
    else _renderList(_appContacts);
  };

  window._ctLoadPhone = function(){
    var list=document.getElementById('_ctList');
    if(list)list.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 24px;gap:16px"><div style="width:56px;height:56px;border-radius:50%;border:3px solid #9333ea;border-top:3px solid transparent;animation:spin .8s linear infinite"></div><p style="color:#a78bfa;font-size:14px;font-weight:600;margin:0">Requesting permission...</p></div>';
    /* Native phone contacts (Capacitor DeviceFiles plugin) */
    if (window.PhysioNative && PhysioNative.isNative && PhysioNative.deviceFiles()) {
      PhysioNative.listContacts().then(function(rows){
        _phoneContacts = (rows||[]).map(function(c){
          return { name:c.name||'Unknown', phone:(c.phones&&c.phones[0])||'', email:(c.emails&&c.emails[0])||'' };
        });
        _phoneLoaded = true; _renderList(_phoneContacts);
      }).catch(function(){ _phoneLoaded=true; _phoneContacts=[]; _renderList([]); });
      return;
    }
    /* Web Contacts API fallback */
    if(navigator.contacts&&navigator.contacts.select){
      navigator.contacts.select(['name','tel','email'],{multiple:true})
        .then(function(cts){
          _phoneContacts=(cts||[]).map(function(c){return{name:(c.name&&c.name[0])||'Unknown',phone:(c.tel&&c.tel[0])||'',email:(c.email&&c.email[0])||''};}).sort(function(a,b){return a.name.localeCompare(b.name);});
          _phoneLoaded=true; _renderList(_phoneContacts);
        }).catch(function(){_phoneLoaded=true;_phoneContacts=[];_renderList([]);});
      return;
    }
    _phoneLoaded=true; _phoneContacts=[]; _renderList([]);
  };

  document.getElementById('_ctSearchToggle').onclick=function(){
    _searchOpen=!_searchOpen;
    var bar=document.getElementById('_ctSearchBar'); if(bar)bar.style.display=_searchOpen?'flex':'none';
    if(_searchOpen)setTimeout(function(){var si=document.getElementById('_ctSearchInp');if(si)si.focus();},80);
    else{var si=document.getElementById('_ctSearchInp');if(si)si.value='';_ctDoSearch('');}
  };
  document.getElementById('_ctClose').onclick=function(){d.remove();};
  document.getElementById('_ctSendBtn').onclick=function(){
    if(!_selected.length)return;
    d.remove();
    var msg;
    if(_selected.length===1){
      var c=_selected[0];
      msg='👤 *Contact:* '+c.name;
      if(c.phone)msg+='\n📞 '+c.phone+'\n[call:'+c.phone.replace(/\s/g,'')+']';
      if(c.email)msg+='\n📧 '+c.email;
    } else {
      msg='👥 *Contacts ('+_selected.length+'):*\n'+_selected.map(function(c,i){return(i+1)+'. '+c.name+(c.phone?' · '+c.phone:'');}).join('\n');
    }
    // Contact always sends directly — clear callback to bypass fileStrip
    _attachCB = null;
    if (window._waDirectSend) { window._waDirectSend(msg); }
    else { _textCB(msg); }
  };

  /* Load app contacts */
  (function(){
    var list=document.getElementById('_ctList');
    if(list)list.innerHTML='<div style="display:flex;align-items:center;justify-content:center;padding:60px 24px;gap:16px"><div style="width:48px;height:48px;border-radius:50%;border:3px solid #9333ea;border-top:3px solid transparent;animation:spin .8s linear infinite"></div><p style="color:#a78bfa;font-size:14px;font-weight:600;margin:0">Loading app users...</p></div>';
    if(typeof db!=='undefined'&&typeof currentUser!=='undefined'&&currentUser){
      db.ref('users').once('value').then(function(snap){
        _appContacts=[];
        snap.forEach(function(c){
          if(c.key===currentUser.uid)return;
          var v=c.val()||{};
          if(!v.name&&!v.displayName)return;
          _appContacts.push({uid:c.key,name:v.name||v.displayName||'Unknown',phone:v.phone||'',email:v.email||''});
        });
        _appContacts.sort(function(a,b){return(a.name||'').localeCompare(b.name||'');});
        _renderList(_appContacts);
      }).catch(function(){_renderList([]);});
    } else { _renderList([]); }
  })();
}

// ── POLL: Full-screen WhatsApp style ─────────────────────────────────────────
function _openPoll() {
  var d = document.createElement('div');
  d.id = '_pollUI';
  d.style.cssText = 'position:fixed;inset:0;z-index:9850;background:#0d0f1a;display:flex;flex-direction:column';
  d.innerHTML =
    '<div style="background:#1a1f2e;border-bottom:1px solid #2a3942;padding:12px 16px;display:flex;align-items:center;gap:12px;flex-shrink:0">' +
      '<button onclick="document.getElementById(\'_pollUI\').remove()" style="width:40px;height:40px;background:#2a3942;border-radius:12px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e9edef" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
      '<span style="color:#fff;font-weight:700;font-size:16px;flex:1">Create poll</span>' +
      '<button id="_pollSendBtn" disabled style="background:linear-gradient(135deg,#9333ea,#ec4899);border:none;border-radius:12px;color:#fff;padding:8px 18px;font-weight:700;font-size:14px;cursor:pointer;opacity:.5">Send</button>' +
    '</div>' +
    '<div style="flex:1;overflow-y:auto;padding:16px">' +
      '<p style="color:#a78bfa;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px">Question</p>' +
      '<textarea id="_pollQ" placeholder="Ask question" rows="3" style="width:100%;background:#1a1f2e;border:1.5px solid #2a3942;border-radius:14px;color:#fff;font-size:15px;padding:12px 14px;outline:none;resize:none;box-sizing:border-box;font-family:inherit;margin-bottom:20px" oninput="_pollCheck()"></textarea>' +
      '<p style="color:#a78bfa;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px">Options</p>' +
      '<div id="_pollOpts">' +
        '<div class="_pollOptRow" style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><input class="_pollOpt" placeholder="Option 1" style="flex:1;background:#1a1f2e;border:1.5px solid #2a3942;border-radius:12px;color:#fff;font-size:14px;padding:11px 14px;outline:none;font-family:inherit" oninput="_pollCheck()"></div>' +
        '<div class="_pollOptRow" style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><input class="_pollOpt" placeholder="Option 2" style="flex:1;background:#1a1f2e;border:1.5px solid #2a3942;border-radius:12px;color:#fff;font-size:14px;padding:11px 14px;outline:none;font-family:inherit" oninput="_pollCheck()"></div>' +
      '</div>' +
      '<button onclick="_pollAddOption()" style="width:100%;background:#1a1f2e;border:1.5px dashed #2a3942;border-radius:12px;color:#a78bfa;font-size:14px;font-weight:600;padding:12px;cursor:pointer;margin-bottom:20px">+ Add option</button>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;background:#1a1f2e;border-radius:14px;padding:14px 16px">' +
        '<span style="color:#fff;font-size:14px">Allow multiple answers</span>' +
        '<div id="_pollMultiTog" onclick="_pollToggleMulti(this)" style="width:48px;height:26px;background:#374151;border-radius:13px;cursor:pointer;position:relative;transition:background .2s"><div style="width:22px;height:22px;background:#fff;border-radius:50%;position:absolute;top:2px;left:2px;transition:left .2s;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div></div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(d);
  var _multi = false;
  window._pollCheck = function() {
    var q = (document.getElementById('_pollQ').value||'').trim();
    var n = Array.from(document.querySelectorAll('._pollOpt')).filter(function(i){ return i.value.trim(); }).length;
    var b = document.getElementById('_pollSendBtn');
    if (b) { b.disabled = !(q && n >= 2); b.style.opacity = (q && n >= 2) ? '1' : '.5'; }
  };
  window._pollAddOption = function() {
    var c = document.getElementById('_pollOpts'); if (!c || c.children.length >= 12) return;
    var n = c.children.length + 1;
    var r = document.createElement('div');
    r.className = '_pollOptRow'; r.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px';
    r.innerHTML = '<input class="_pollOpt" placeholder="Option ' + n + '" style="flex:1;background:#1a1f2e;border:1.5px solid #2a3942;border-radius:12px;color:#fff;font-size:14px;padding:11px 14px;outline:none;font-family:inherit" oninput="_pollCheck()">' +
      '<button onclick="var r=this.closest(\'._pollOptRow\');if(document.querySelectorAll(\'._pollOpt\').length>2){r.remove();_pollCheck();}" style="background:none;border:none;color:#6b7280;font-size:22px;cursor:pointer;flex-shrink:0;line-height:1">✕</button>';
    c.appendChild(r); r.querySelector('input').focus();
  };
  window._pollToggleMulti = function(el) {
    _multi = !_multi;
    el.style.background = _multi ? 'linear-gradient(135deg,#9333ea,#ec4899)' : '#374151';
    el.querySelector('div').style.left = _multi ? '24px' : '2px';
  };
  document.getElementById('_pollSendBtn').onclick = function() {
    var q = (document.getElementById('_pollQ').value||'').trim(); if (!q) return;
    var em = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
    var opts = Array.from(document.querySelectorAll('._pollOpt')).map(function(i,x){ return em[x] + ' ' + i.value.trim(); }).filter(function(s){ return s.trim().length > 3; });
    if (opts.length < 2) return;
    d.remove();
    // Generate a permanent pollId so votes persist across forwards
    var pollId = 'pid_' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
    var pollTxt = '📊 *Poll:* ' + q + '\n' + opts.join('\n') + (_multi ? '\n\n_Multiple answers allowed_' : '') + '\n\n_Tap to vote!_\n[pid:'+pollId+']';
    _attachCB = null;
    if (window._waDirectSend) { window._waDirectSend(pollTxt); }
    else { _textCB(pollTxt); }
  };
}

// ── EVENT: Full-screen WhatsApp style ────────────────────────────────────────
function _openEvent(prefill) {
  var ex = document.getElementById('_eventUI'); if (ex) ex.remove();
  var d = document.createElement('div');
  d.id = '_eventUI';
  d.style.cssText = 'position:fixed;inset:0;z-index:9850;background:#0d0f1a;display:flex;flex-direction:column;overflow-y:auto';
  var now = new Date(); var pad = function(n){ return n<10?'0'+n:n; };
  var defDt = now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate())+'T'+pad(now.getHours())+':00';
  var pf = prefill || {};
  d.innerHTML =
    '<div style="background:#1a1f2e;border-bottom:1px solid #2a3942;padding:12px 16px;display:flex;align-items:center;gap:12px;flex-shrink:0">' +
      '<button onclick="document.getElementById(\'_eventUI\').remove()" style="width:40px;height:40px;background:#2a3942;border-radius:12px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e9edef" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
      '<span style="color:#fff;font-weight:700;font-size:16px;flex:1">' + (pf.title ? 'Edit Event' : 'Create Event') + '</span>' +
    '</div>' +
    '<div style="padding:20px 16px;flex:1">' +
      '<input id="_evtN" placeholder="Event name" value="' + (pf.title||'').replace(/"/g,'&quot;') + '" style="width:100%;background:none;border:none;border-bottom:1.5px solid #2a3942;color:#fff;font-size:22px;font-weight:500;padding:8px 0;outline:none;margin-bottom:8px;box-sizing:border-box;font-family:inherit">' +
      '<input id="_evtDesc" placeholder="Description (Optional)" value="' + (pf.desc||'').replace(/"/g,'&quot;') + '" style="width:100%;background:none;border:none;border-bottom:1px solid #2a3942;color:#9ca3af;font-size:14px;padding:8px 0;outline:none;margin-bottom:24px;box-sizing:border-box;font-family:inherit">' +
      '<div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid #1a1f2e">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
        '<input id="_evtDt" type="datetime-local" value="' + (pf.dt||defDt) + '" style="flex:1;background:none;border:none;color:#fff;font-size:15px;outline:none;font-family:inherit">' +
      '</div>' +
      '<div id="_evtEndToggle" style="display:' + (pf.endDt?'none':'flex') + ';align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid #1a1f2e;cursor:pointer" onclick="document.getElementById(\'_evtEndWrap\').style.display=\'flex\';this.style.display=\'none\'">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
        '<span style="color:#6b7280;font-size:14px">Add end time</span>' +
      '</div>' +
      '<div id="_evtEndWrap" style="display:' + (pf.endDt?'flex':'none') + ';align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid #1a1f2e">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
        '<input id="_evtEnd" type="datetime-local" value="' + (pf.endDt||'') + '" style="flex:1;background:none;border:none;color:#fff;font-size:15px;outline:none;font-family:inherit">' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid #1a1f2e">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>' +
        '<input id="_evtLoc" placeholder="Add location" value="' + (pf.loc||'').replace(/"/g,'&quot;') + '" style="flex:1;background:none;border:none;color:#9ca3af;font-size:14px;outline:none;font-family:inherit">' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid #1a1f2e">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.8"><path d="M15 10l5 5-5 5"/><path d="M4 4v7a4 4 0 004 4h12"/></svg>' +
        '<span style="color:#9ca3af;font-size:14px;flex:1">Reminder</span>' +
        '<select id="_evtRemind" style="background:#1a1f2e;border:1px solid #2a3942;color:#a78bfa;font-size:14px;outline:none;padding:4px 10px;border-radius:8px;cursor:pointer">' +
          '<option value="">None</option>' +
          '<option value="30m"' + (pf.remind==='30m'?' selected':'') + '>30 min before</option>' +
          '<option value="1h"' + (pf.remind==='1h'?' selected':(!pf.remind?' selected':'')) + '>1 hour before</option>' +
          '<option value="1d"' + (pf.remind==='1d'?' selected':'') + '>1 day before</option>' +
        '</select>' +
      '</div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid #1a1f2e">' +
        '<div style="display:flex;align-items:center;gap:14px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg><span style="color:#9ca3af;font-size:14px">WhatsApp call link</span></div>' +
        '<div id="_evtCallTog" onclick="_evtToggleCall(this)" style="width:48px;height:26px;background:#374151;border-radius:13px;cursor:pointer;position:relative;transition:background .2s"><div style="width:22px;height:22px;background:#fff;border-radius:50%;position:absolute;top:2px;left:2px;transition:left .2s;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div></div>' +
      '</div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid #1a1f2e">' +
        '<div style="display:flex;flex-direction:column;gap:2px"><span style="color:#9ca3af;font-size:14px">Allow guests</span><span style="color:#6b7280;font-size:11px">Allow people to bring one additional guest</span></div>' +
        '<div id="_evtGuestTog" onclick="_evtToggleGuest(this)" style="width:48px;height:26px;background:#374151;border-radius:13px;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0;margin-left:12px"><div style="width:22px;height:22px;background:#fff;border-radius:50%;position:absolute;top:2px;left:2px;transition:left .2s;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div></div>' +
      '</div>' +
      '<button onclick="_doSendEvent()" style="width:100%;background:linear-gradient(135deg,#9333ea,#ec4899);border:none;border-radius:16px;color:#fff;font-weight:700;font-size:15px;padding:15px;cursor:pointer;margin-top:28px">' + (pf.title ? 'Update Event' : 'Send Event') + '</button>' +
    '</div>';
  document.body.appendChild(d);
  window._evtToggleCall = function(el) {
    var on = el.querySelector('div').style.left === '24px';
    el.style.background = on ? '#374151' : 'linear-gradient(135deg,#9333ea,#ec4899)';
    el.querySelector('div').style.left = on ? '2px' : '24px';
  };
  window._evtToggleGuest = function(el) {
    var on = el.querySelector('div').style.left === '24px';
    el.style.background = on ? '#374151' : 'linear-gradient(135deg,#9333ea,#ec4899)';
    el.querySelector('div').style.left = on ? '2px' : '24px';
  };
  window._doSendEvent = function() {
    var title = (document.getElementById('_evtN').value||'').trim();
    if (!title) { document.getElementById('_evtN').focus(); return; }
    var desc   = (document.getElementById('_evtDesc').value||'').trim();
    var dt     = document.getElementById('_evtDt').value;
    var endDt  = document.getElementById('_evtEnd').value;
    var loc    = (document.getElementById('_evtLoc').value||'').trim();
    var remind = document.getElementById('_evtRemind').value;
    var msg = '📅 *Event:* ' + title;
    if (desc)  msg += '\n📝 ' + desc;
    if (dt) {
      msg += '\n🕐 ' + new Date(dt).toLocaleString('en-GB',{weekday:'short',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
      msg += '\n⏱iso:' + dt;
    }
    if (endDt) msg += '\n⏱isoend:' + endDt;
    if (loc)   msg += '\n📍 ' + loc;
    if (remind) msg += '\n🔔 Reminder: ' + remind.replace('m',' min').replace('h',' hour').replace('d',' day') + ' before';
    d.remove();
    // If editing existing event — update in Firebase directly
    if (pf.msgId && typeof db !== 'undefined' && typeof chatId !== 'undefined') {
      db.ref('chats/' + chatId + '/' + pf.msgId).update({text: msg}).then(function(){
        if (typeof showToast === 'function') showToast('Event updated ✅');
      }).catch(function(){ if (typeof showToast === 'function') showToast('Update failed','error'); });
    } else {
      _textCB(msg);
    }
  };
}

function _textCB(text) {
  if (_attachCB) { _attachCB(null, 'text', text); _attachCB = null; }
  else if (window._waDirectSend) { window._waDirectSend(text); }
}
function _v(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
console.log('✅ Attach Menu (Capacitor) ready');
