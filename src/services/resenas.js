// Reseñas: resenas/{uid}_{tipo}_{tmdbId}
// El id fijo garantiza una sola reseña por persona y título.
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore'
import { db, sinFirebase } from '../firebase'

const resenasRef = () => collection(db, 'resenas')
export const idResena = (uid, tipo, tmdbId) => `${uid}_${tipo}_${tmdbId}`

const porFecha = (a, b) => (b.creada?.seconds ?? Infinity) - (a.creada?.seconds ?? Infinity)
const mapear = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }))

// CONSULTAR: reseñas de un título (de toda la comunidad)
export function escucharResenasDeTitulo(tipo, tmdbId, onDatos, onError) {
  const corte = sinFirebase(onError)
  if (corte) return corte
  const q = query(resenasRef(), where('clave', '==', `${tipo}_${tmdbId}`), limit(60))
  return onSnapshot(q, (s) => onDatos(mapear(s).sort(porFecha)), onError)
}

// CONSULTAR: reseñas de una persona (para su perfil)
export function escucharResenasDeUsuario(uid, onDatos, onError) {
  const corte = sinFirebase(onError)
  if (corte) return corte
  const q = query(resenasRef(), where('uid', '==', uid), limit(500))
  return onSnapshot(q, (s) => onDatos(mapear(s).sort(porFecha)), onError)
}

// CONSULTAR: actividad reciente de toda la comunidad
export function escucharUltimasResenas(cantidad, onDatos, onError) {
  const corte = sinFirebase(onError)
  if (corte) return corte
  const q = query(resenasRef(), orderBy('creada', 'desc'), limit(cantidad))
  return onSnapshot(q, (s) => onDatos(mapear(s)), onError)
}

// AGREGAR o MODIFICAR
export function guardarResena(usuario, titulo, datos, existente) {
  const id = idResena(usuario.uid, titulo.tipo, titulo.id)
  const ref = doc(db, 'resenas', id)
  const contenido = {
    puntaje: datos.puntaje,
    texto: datos.texto,
    meGusta: datos.meGusta,
    spoiler: datos.spoiler,
    vista: datos.vista,
    actualizada: serverTimestamp(),
  }
  if (existente) return updateDoc(ref, contenido)
  return setDoc(ref, {
    ...contenido,
    uid: usuario.uid,
    autorNombre: (usuario.nombre || usuario.displayName || 'Cinéfilo anónimo').slice(0, 80),
    autorFoto: (usuario.photoURL || '').startsWith('https://') ? usuario.photoURL.slice(0, 500) : '',
    clave: `${titulo.tipo}_${titulo.id}`,
    tipo: titulo.tipo,
    tmdbId: titulo.id,
    titulo: titulo.titulo,
    poster: titulo.poster || '',
    anio: titulo.anio || 0,
    paises: (titulo.paises || []).slice(0, 10),
    generos: (titulo.generos || []).slice(0, 6),
    duracion: titulo.duracion || 0,
    creada: serverTimestamp(),
  })
}

// ELIMINAR
export function eliminarResena(id) {
  return deleteDoc(doc(db, 'resenas', id))
}
