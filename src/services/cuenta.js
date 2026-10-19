// Operaciones sobre la cuenta completa: exportar los datos propios y eliminar la cuenta.
import { collection, deleteDoc, doc, getDoc, getDocs, query, where, writeBatch } from 'firebase/firestore'
import { deleteUser, reauthenticateWithPopup } from 'firebase/auth'
import { auth, db, proveedorGoogle } from '../firebase'

async function leerTodo(uid) {
  const [perfil, resenas, quieroVer] = await Promise.all([
    getDoc(doc(db, 'usuarios', uid)),
    getDocs(query(collection(db, 'resenas'), where('uid', '==', uid))),
    getDocs(collection(db, 'usuarios', uid, 'quieroVer')),
  ])
  return { perfil, resenas: resenas.docs, quieroVer: quieroVer.docs }
}

// Convierte las fechas de Firestore a texto para poder guardarlas en JSON.
const plano = (datos) =>
  JSON.parse(JSON.stringify(datos, (_, v) => (v && typeof v.toDate === 'function' ? v.toDate().toISOString() : v)))

// Descarga un archivo .json con todo lo que la persona guardó en Pochoclo.
export async function descargarMisDatos(uid) {
  const { perfil, resenas, quieroVer } = await leerTodo(uid)
  const exportado = {
    exportado: new Date().toISOString(),
    perfil: perfil.exists() ? plano(perfil.data()) : null,
    resenas: resenas.map((d) => plano({ id: d.id, ...d.data() })),
    quieroVer: quieroVer.map((d) => plano({ id: d.id, ...d.data() })),
  }
  const blob = new Blob([JSON.stringify(exportado, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pochoclo-mis-datos-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ELIMINAR la cuenta: reseñas, lista "Quiero ver", perfil y, por último, el usuario de Authentication.
export async function eliminarCuenta() {
  const usuario = auth.currentUser
  if (!usuario) throw new Error('No hay una sesión iniciada.')

  // Firebase exige un inicio de sesión reciente para borrar un usuario: se confirma con Google antes de tocar datos.
  await reauthenticateWithPopup(usuario, proveedorGoogle)

  const { resenas, quieroVer } = await leerTodo(usuario.uid)
  const documentos = [...resenas, ...quieroVer].map((d) => d.ref)
  for (let i = 0; i < documentos.length; i += 400) {
    const lote = writeBatch(db)
    documentos.slice(i, i + 400).forEach((ref) => lote.delete(ref))
    await lote.commit()
  }
  await deleteDoc(doc(db, 'usuarios', usuario.uid))
  await deleteUser(usuario)
}
