import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, proveedorGoogle } from '../firebase'
import { asegurarPerfil } from '../services/usuarios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [listo, setListo] = useState(!auth)

  useEffect(() => {
    if (!auth) return
    return onAuthStateChanged(auth, (u) => {
      setUsuario(u)
      setListo(true)
      if (u) asegurarPerfil(u).catch((e) => console.error('No se pudo crear el perfil', e))
    })
  }, [])

  const entrar = () => signInWithPopup(auth, proveedorGoogle)
  const salir = () => signOut(auth)

  return <AuthContext.Provider value={{ usuario, listo, entrar, salir }}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
