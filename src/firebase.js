// Punto único de conexión con Firebase (Authentication + Firestore).
// La configuración web es pública; los datos se protegen con firestore.rules.
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const configCompleta = Object.values(firebaseConfig).every(Boolean)

const app = configCompleta ? initializeApp(firebaseConfig) : null
export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
export const proveedorGoogle = new GoogleAuthProvider()

// Si Firebase no está configurado, las suscripciones avisan el error en vez de romper la app.
export function sinFirebase(onError) {
  if (db) return null
  setTimeout(() => onError?.(new Error('Firebase no está configurado (faltan variables de entorno).')))
  return () => {}
}
