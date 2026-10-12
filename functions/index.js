/**
 * Sends a push notification (FCM) to the recipient whenever a private chat message is created.
 * This is what makes the phone ring when the app is CLOSED.
 *
 * Deploy:   firebase init functions   (choose this folder, JavaScript, do NOT overwrite index.js)
 *           firebase deploy --only functions
 * Needs the Blaze (pay-as-you-go) plan. Then set PUSH_MODE: 'fcm' in www/js/native/config.js.
 *
 * If your Realtime Database is NOT in us-central1, change REGION below
 * (europe-west1 for a europe-west1 database, asia-southeast1 for Singapore).
 */
const { onValueCreated } = require('firebase-functions/v2/database');
const { initializeApp } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();
const REGION = 'us-central1';

function preview(m) {
  const ft = String(m.fileType || '');
  let t = String(m.text || '');
  if (m.viewOnce || /^image\//.test(ft)) return '📷 Photo';
  if (/^video\//.test(ft)) return '🎥 Video';
  if (/^audio\//.test(ft)) return t.startsWith('🎤') ? '🎤 Voice message' : '🎵 Audio';
  if (ft) return '📄 ' + (t || 'Document');
  if (t.length > 160) t = t.slice(0, 157) + '…';
  return t || 'New message';
}

exports.notifyPrivateMessage = onValueCreated(
  { ref: '/chats/{chatId}/{msgId}', region: REGION },
  async (event) => {
    const m = event.data.val();
    if (!m || m.isGemini || m.senderUid === 'gemini' || !m.senderUid) return;

    // chatId = "<uidA>_<uidB>" (sorted)
    const recipient = event.params.chatId.split('_').find((id) => id && id !== m.senderUid);
    if (!recipient) return;

    const db = getDatabase();
    const snap = await db.ref('/fcm_tokens/' + recipient).get();
    const tokens = Object.keys(snap.val() || {});
    if (!tokens.length) return;

    const name = m.senderName || 'New message';
    const res = await getMessaging().sendEachForMulticast({
      tokens,
      notification: { title: name, body: preview(m) },
      data: { type: 'message', uid: String(m.senderUid), name: String(name) },
      android: {
        priority: 'high',
        notification: { channelId: 'messages', sound: 'default', tag: 'chat_' + m.senderUid }
      }
    });

    // clean up tokens that are no longer valid
    const dead = [];
    res.responses.forEach((r, i) => {
      const code = r.error && r.error.code;
      if (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token') dead.push(tokens[i]);
    });
    await Promise.all(dead.map((t) => db.ref('/fcm_tokens/' + recipient + '/' + t).remove()));
  }
);
