// Lista "Quiero ver" (privada): usuarios/{uid}/quieroVer/{tipo}_{tmdbId}
import { collection, doc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const ref = (uid) => collection(db, 'usuarios', uid, 'quieroVer')

export function escucharQuieroVer(uid, onDatos, onError) {
  return onSnapshot(
    ref(uid),
    (s) =>
      onDatos(
        s.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.agregada?.seconds ?? Infinity) - (a.agregada?.seconds ?? Infinity)),
      ),
    onError,
  )
}

export function agregarQuieroVer(uid, t) {
  return setDoc(doc(db, 'usuarios', uid, 'quieroVer', `${t.tipo}_${t.id}`), {
    tipo: t.tipo,
    tmdbId: t.id,
    titulo: t.titulo,
    poster: t.poster || '',
    anio: t.anio || 0,
    agregada: serverTimestamp(),
  })
}

export function quitarQuieroVer(uid, tipo, tmdbId) {
  return deleteDoc(doc(db, 'usuarios', uid, 'quieroVer', `${tipo}_${tmdbId}`))
}
