import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore, getFirestore, memoryLocalCache } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const missing = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k)
export const isFirebaseConfigured = missing.length === 0

let app = null
let auth = null
let db = null
let storage = null

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  try {
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      localCache: memoryLocalCache(),
    })
  } catch (e) {
    db = getFirestore(app)
  }
  storage = getStorage(app)
}

export { app, auth, db, storage }
