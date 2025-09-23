import { initializeApp } from 'firebase/app'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "<YOUR_API_KEY>",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "<YOUR_AUTH_DOMAIN>",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "<YOUR_PROJECT_ID>",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "<YOUR_STORAGE_BUCKET>",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "<YOUR_MSG_SENDER_ID>",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "<YOUR_APP_ID>"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// Try to enable IndexedDB persistence for offline support.
try {
  enableIndexedDbPersistence(db)
    .catch((err) => {
      console.warn('Failed to enable persistence:', err.code || err.message)
    })
} catch (e) {
  console.warn('Persistence not available', e.message || e)
}