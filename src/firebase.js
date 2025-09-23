import { initializeApp } from 'firebase/app'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDzeI6mMuICNJdO_G2F7fiGFlQhyo8RWM8",
  authDomain: "budgeting-b3974.firebaseapp.com",
  projectId: "budgeting-b3974",
  storageBucket: "budgeting-b3974.firebasestorage.app",
  messagingSenderId: "462817466291",
  appId: "1:462817466291:web:13260b80355f9d0b559dc6"
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
