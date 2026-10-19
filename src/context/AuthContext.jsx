import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, proveedorGoogle } from '../firebase'
import { asegurarPerfil, escucharPerfil } from '../services/usuarios'
import { escucharResenasDeUsuario } from '../services/resenas'
import { useToast } from './ToastContext'

// Traduce los errores más comunes del inicio de sesión a mensajes entendibles.
const MOTIVOS = {
  'auth/configuration-not-found': 'falta activar Authentication en la consola de Firebase',
  'auth/operation-not-allowed': 'falta habilitar el proveedor Google en Authentication',
  'auth/unauthorized-domain': 'este dominio no está autorizado en Authentication → Configuración',
  'auth/popup-blocked': 'el navegador bloqueó la ventana emergente; permitila e intentá de nuevo',
  'auth/network-request-failed': 'no hay conexión a internet',
}
const IGNORAR = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request']

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [listo, setListo] = useState(!auth)
  const [perfil, setPerfil] = useState(null)
  const [misResenas, setMisResenas] = useState([])
  const { avisar } = useToast()

  useEffect(() => {
    if (!auth) return
    return onAuthStateChanged(auth, (u) => {
      setUsuario(u)
      setListo(true)
      if (u) asegurarPerfil(u).catch((e) => console.error('No se pudo crear el perfil', e))
    })
  }, [])

  // Perfil propio en vivo (nombre, foto y bio editables desde la página de perfil).
  useEffect(() => {
    if (!usuario) return
    return escucharPerfil(usuario.uid, setPerfil, () => {})
  }, [usuario])

  // Títulos que reseñé: sus pósters se muestran en color en toda la app.
  useEffect(() => {
    if (!usuario) return
    return escucharResenasDeUsuario(usuario.uid, setMisResenas, () => {})
  }, [usuario])
  const vistas = useMemo(() => new Set(usuario ? misResenas.map((r) => r.clave) : []), [usuario, misResenas])

  const entrar = () =>
    signInWithPopup(auth, proveedorGoogle)
      .then((r) => avisar(`¡Hola, ${r.user.displayName?.split(' ')[0] || 'cinéfilo'}!`))
      .catch((e) => {
        if (IGNORAR.includes(e.code)) return
        avisar(`No se pudo entrar con Google: ${MOTIVOS[e.code] || e.message}`, 'error')
      })
  const salir = () => signOut(auth)

  return <AuthContext.Provider value={{ usuario, perfil: usuario ? perfil : null, vistas, listo, entrar, salir }}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
