// Run ONCE after `npx cap add android`  (npm run android:patch)
// Adds the permissions and notification settings the app needs to AndroidManifest.xml.
//   --play-store   leaves out MANAGE_EXTERNAL_STORAGE ("All files access")
const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
if (!fs.existsSync(manifestPath)) {
  console.error('android/ folder not found. Run:  npx cap add android');
  process.exit(1);
}
const playStore = process.argv.includes('--play-store');
let xml = fs.readFileSync(manifestPath, 'utf8');

const perms = [
  'android.permission.INTERNET',
  'android.permission.CAMERA',
  'android.permission.RECORD_AUDIO',
  'android.permission.MODIFY_AUDIO_SETTINGS',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.POST_NOTIFICATIONS',
  'android.permission.VIBRATE',
  'android.permission.READ_MEDIA_IMAGES',
  'android.permission.READ_MEDIA_VIDEO',
  'android.permission.READ_MEDIA_AUDIO',
  'android.permission.READ_CONTACTS'
];
if (!playStore) perms.push('android.permission.MANAGE_EXTERNAL_STORAGE');

const add = [];
for (const p of perms) {
  if (!xml.includes('android:name="' + p + '"')) add.push('    <uses-permission android:name="' + p + '" />');
}
if (!xml.includes('android:name="android.permission.READ_EXTERNAL_STORAGE"')) {
  add.push('    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />');
}
if (!xml.includes('android.hardware.camera')) {
  add.push('    <uses-feature android:name="android.hardware.camera" android:required="false" />');
  add.push('    <uses-feature android:name="android.hardware.microphone" android:required="false" />');
}
if (add.length) {
  xml = xml.replace('</manifest>', '\n    <!-- Physio SUAI -->\n' + add.join('\n') + '\n</manifest>');
}

const channelMeta = 'com.google.firebase.messaging.default_notification_channel_id';
if (!xml.includes(channelMeta)) {
  xml = xml.replace('</application>',
    '    <meta-data android:name="' + channelMeta + '" android:value="messages" />\n    </application>');
}

fs.writeFileSync(manifestPath, xml);
console.log('AndroidManifest.xml patched (' + add.length + ' entries added' + (playStore ? ', Play Store mode' : '') + ').');

const gs = path.join(__dirname, '..', 'android', 'app', 'google-services.json');
if (!fs.existsSync(gs)) {
  console.log('\nNote: android/app/google-services.json is missing.');
  console.log('      That is fine while PUSH_MODE is "local" (www/js/native/config.js).');
}
