import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, proveedorGoogle } from '../firebase'
import { asegurarPerfil } from '../services/usuarios'
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
  const { avisar } = useToast()

  useEffect(() => {
    if (!auth) return
    return onAuthStateChanged(auth, (u) => {
      setUsuario(u)
      setListo(true)
      if (u) asegurarPerfil(u).catch((e) => console.error('No se pudo crear el perfil', e))
    })
  }, [])

  const entrar = () =>
    signInWithPopup(auth, proveedorGoogle)
      .then((r) => avisar(`¡Hola, ${r.user.displayName?.split(' ')[0] || 'cinéfilo'}!`))
      .catch((e) => {
        if (IGNORAR.includes(e.code)) return
        avisar(`No se pudo entrar con Google: ${MOTIVOS[e.code] || e.message}`, 'error')
      })
  const salir = () => signOut(auth)

  return <AuthContext.Provider value={{ usuario, listo, entrar, salir }}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
