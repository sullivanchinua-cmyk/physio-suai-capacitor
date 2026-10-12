// Copies the Firebase web SDK from node_modules into www/vendor so the app works offline.
// Runs automatically after `npm install`. If a file is missing, the pages fall back to the CDN.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'www', 'vendor');
const files = ['firebase-app-compat.js', 'firebase-auth-compat.js', 'firebase-database-compat.js'];

fs.mkdirSync(out, { recursive: true });
let copied = 0;
for (const f of files) {
  const candidates = [
    path.join(root, 'node_modules', 'firebase', f),
    path.join(root, 'node_modules', 'firebase', 'dist', f)
  ];
  const src = candidates.find((c) => fs.existsSync(c));
  if (!src) { console.warn('[vendor] not found, CDN fallback will be used for:', f); continue; }
  fs.copyFileSync(src, path.join(out, f));
  copied++;
}
console.log('[vendor] firebase files copied:', copied + '/' + files.length);
