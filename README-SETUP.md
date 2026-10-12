# Physio SUAI – Capacitor (Android)

Requirements on your laptop: **Node 22+**, **Android Studio** (JDK 21 is bundled), Android SDK 36.

## Build steps

```bash
npm install                 # installs Capacitor + plugins, copies Firebase SDK into www/vendor
npx cap add android         # creates the android/ project
npm run android:patch       # adds permissions + notification channel to AndroidManifest.xml
npx cap sync android        # copies www/ into the app and registers all plugins
npx cap open android        # opens Android Studio -> Build > Build APK(s)
```

After every change inside `www/` run `npx cap sync android` again.

`appId` is `com.physiosuai.app` (capacitor.config.json). Change it **before** `cap add android` if you want another one.
For the Play Store use `npm run android:patch:play` (leaves out "All files access").

---

## 1) Firebase login – what you need

| What | Needed? |
|---|---|
| Web config (apiKey, authDomain, databaseURL…) | Already in `www/js/hybrid-config.js` and `www/index.html`. Email/password login works with just this. |
| `google-services.json` | **Only for push notifications** (PUSH_MODE `fcm`). Not needed for login. |
| Authorized domain | `localhost` is authorized by default. The app runs at `https://localhost`. |
| Database rules | Add: `"fcm_tokens": { "$uid": { ".write": "auth != null && auth.uid === $uid" } }` |

To get `google-services.json`: Firebase console > Project settings > Add app > Android, package name `com.physiosuai.app`
(same as `appId`), download the file and put it in `android/app/`. Capacitor's Gradle files already apply it when present.

Firebase JS SDK is bundled locally (`www/vendor`) so login screens load offline; the CDN is a fallback.

## 2) SQLite chat storage

`www/js/native/sqlite-store.js` + `www/js/offline-cache.js`.
All rooms (public chat and every private chat) are saved in one SQLite table (`messages`, indexed by room + time).
New, edited and deleted messages are all kept in sync. Last 500 messages per room are kept (`MAX_MSGS_PER_ROOM`).
In a normal browser it falls back to IndexedDB automatically. `OfflineCache.searchMsgs(room, text)` gives local search.

## 3) Notifications

Set `PUSH_MODE` in `www/js/native/config.js`:

* **`'local'` (default, works immediately)** – Firebase listeners create real Android notifications (sound, heads-up, notification panel,
  tap opens the chat) while the app is running. Android may stop a backgrounded app after a while, so it will not ring once the app is fully closed.
* **`'fcm'`** – also registers the phone with Firebase Cloud Messaging. The Cloud Function in `functions/` sends the push, so the phone
  rings even when the app is closed. Steps: add `google-services.json`, `firebase init functions` + `firebase deploy --only functions`
  (Blaze plan required), then switch to `'fcm'`. Do **not** switch before `google-services.json` exists, the app can crash on register.

## 4) Attach pickers (WhatsApp style)

`www/js/native/pickers.js` + native plugin `plugins/physio-device-files` (reads Android MediaStore).

* **Gallery** – real thumbnail grid of photos/videos, Photos / Albums tabs, video duration badges, infinite scroll, "Browse all" = system chooser.
* **Audio** – real audio files grouped Today / Yesterday / This week…, duration + size, preview play button, search.
* **Document** – Media / Docs / Links tabs. Docs lists pdf, docx, xlsx, pptx, txt, zip… Links come from the current chat.
  Android 11+ hides other apps' documents unless the app has **All files access**, so the blue "Allow" banner opens that settings screen
  (this is the same banner as in your design). Without it you still have "Browse other docs…".
* **Contact** – real phone contacts. **Location** – Capacitor Geolocation.
* One attachment is staged at a time (that is how your composer works), so pickers select a single item.
* Android back button closes pickers.

Set `ALL_FILES_ACCESS: false` in config.js for a Play-Store-safe build.

## 5) Removed

Expo bridge (`expo-bridge.js`), all `ReactNativeWebView` / `window.Android` hooks, the fake `local-db.js`, the unused `alarm-manager.js`,
the sample audio and document lists, the 12 placeholder gallery cells, and the "Feature Test" bubble in `home.html`.
`pages/chatroom.html` had its own old copy of the attach menu; it now uses the same `js/attach-menu.js` as the home page.

## Before you release – please read

1. **Secrets are inside the app code.** `js/hybrid-config.js` contains your Cloudflare R2 *secret key* and `js/gemini-chat.js` / `js/ai-api.js`
   contain Gemini API keys. Anyone can extract them from the APK. Rotate them and move uploads/AI calls behind a small server
   (R2 presigned URLs from a Worker, Gemini through a Cloud Function).
2. **R2 CORS**: add `https://localhost` to the bucket's allowed origins, otherwise uploads and media caching fail from the app.
3. **Tailwind CDN** (`cdn.tailwindcss.com`) still needs internet at launch. For a fully offline UI, compile Tailwind to a CSS file.
4. If the page header sits under the status bar, set `SAFE_AREA_PADDING: true` in config.js.
5. Not yet run on a real device (no Android SDK where this was prepared). The Java plugin was compile-checked against stubs only,
   and the pickers and SQLite store were tested in a browser with a simulated plugin. Please test on a phone and report anything odd.
