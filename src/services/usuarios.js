// Perfiles públicos: usuarios/{uid}
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

// Crea el perfil la primera vez que alguien entra; después solo actualiza nombre y foto.
export async function asegurarPerfil(user) {
  const ref = doc(db, 'usuarios', user.uid)
  const datos = { nombre: user.displayName || 'Cinéfilo anónimo', foto: user.photoURL || '' }
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, { ...datos, bio: '', creado: serverTimestamp() })
  } else if (snap.data().nombre !== datos.nombre || snap.data().foto !== datos.foto) {
    await updateDoc(ref, datos)
  }
}

export function escucharPerfil(uid, onDatos, onError) {
  return onSnapshot(
    doc(db, 'usuarios', uid),
    (snap) => onDatos(snap.exists() ? { uid, ...snap.data() } : null),
    onError,
  )
}

export function actualizarBio(uid, bio) {
  return updateDoc(doc(db, 'usuarios', uid), { bio })
}
