// Perfiles públicos: usuarios/{uid}
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db, sinFirebase } from '../firebase'

// Crea el perfil la primera vez que alguien entra, con el nombre y la foto de Google.
// Después no lo pisa: la persona puede cambiar su nombre y su foto desde el perfil.
export async function asegurarPerfil(user) {
  const ref = doc(db, 'usuarios', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      nombre: (user.displayName || 'Cinéfilo anónimo').slice(0, 40),
      foto: user.photoURL || '',
      bio: '',
      creado: serverTimestamp(),
    })
  }
}

export function escucharPerfil(uid, onDatos, onError) {
  const corte = sinFirebase(onError)
  if (corte) return corte
  return onSnapshot(
    doc(db, 'usuarios', uid),
    (snap) => onDatos(snap.exists() ? { uid, ...snap.data() } : null),
    onError,
  )
}

// Lectura única con caché, para mostrar nombre y foto de quien escribió cada reseña.
const cache = new Map()
export function leerPerfil(uid) {
  if (!db) return Promise.resolve(null)
  if (!cache.has(uid)) {
    const promesa = getDoc(doc(db, 'usuarios', uid))
      .then((snap) => (snap.exists() ? { uid, ...snap.data() } : null))
      .catch(() => null)
    cache.set(uid, promesa)
  }
  return cache.get(uid)
}

// MODIFICAR: nombre, bio y/o foto (la foto es un data URL comprimido o una URL https).
export function actualizarPerfil(uid, cambios) {
  cache.delete(uid)
  return updateDoc(doc(db, 'usuarios', uid), cambios)
}
