/**
 * Cloud Functions stubs for Pulse.
 * Deploy when Blaze is available:
 *   cd functions && npm i && firebase deploy --only functions
 */
const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()

/** Example: delete expired stories (schedule) */
exports.cleanupExpiredStories = functions.pubsub.schedule('every 24 hours').onRun(async () => {
  const db = admin.firestore()
  const now = Date.now()
  const snap = await db.collection('stories').where('expiresAt', '<', now).limit(200).get()
  const batch = db.batch()
  snap.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
  return null
})

/** Set admin claim — call only from trusted admin SDK context */
exports.setAdminClaim = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin only')
  }
  const uid = data.uid
  await admin.auth().setCustomUserClaims(uid, { admin: true })
  return { ok: true }
})
