import { useEffect, useState } from 'react'
import { leerPerfil } from '../services/usuarios'

// Nombre y foto actuales de una persona (con caché), para que un cambio de perfil
// se vea también en todas sus reseñas viejas.
export function usePerfilPublico(uid) {
  const [perfil, setPerfil] = useState({ uid: null, datos: null })

  useEffect(() => {
    if (!uid) return
    let vigente = true
    leerPerfil(uid).then((datos) => vigente && setPerfil({ uid, datos }))
    return () => {
      vigente = false
    }
  }, [uid])

  return perfil.uid === uid ? perfil.datos : null
}
