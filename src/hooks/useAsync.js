import { useEffect, useState } from 'react'

// Ejecuta una función asíncrona cuando cambian sus dependencias
// y expone { datos, cargando, error } para mostrar estados en la interfaz.
export function useAsync(fn, deps) {
  const [estado, setEstado] = useState({ datos: null, error: null, clave: null })
  const clave = JSON.stringify(deps)

  useEffect(() => {
    let vigente = true
    fn()
      .then((datos) => vigente && setEstado({ datos, error: null, clave }))
      .catch((error) => vigente && setEstado({ datos: null, error, clave }))
    return () => {
      vigente = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave])

  const vigente = estado.clave === clave
  return {
    datos: vigente ? estado.datos : null,
    error: vigente ? estado.error : null,
    cargando: !vigente,
  }
}
