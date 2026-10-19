import { useEffect, useRef, useState } from 'react'
import Avatar from './Avatar'
import { actualizarPerfil } from '../services/usuarios'
import { comprimirImagen } from '../lib/imagenes'
import { useToast } from '../context/ToastContext'

const LIMITES_PERFIL = { nombre: 40, bio: 160 }

// Diálogo para cambiar la foto (subiendo un archivo), el nombre y la bio.
export default function EditarPerfil({ abierto, perfil, onCerrar }) {
  const ref = useRef(null)

  useEffect(() => {
    const d = ref.current
    if (abierto && !d.open) d.showModal()
    if (!abierto && d.open) d.close()
  }, [abierto])

  return (
    <dialog ref={ref} className="dialogo" onClose={onCerrar} onClick={(e) => e.target === ref.current && onCerrar()} aria-labelledby="editar-perfil">
      {abierto && perfil && <Formulario perfil={perfil} onCerrar={onCerrar} />}
    </dialog>
  )
}

function Formulario({ perfil, onCerrar }) {
  const { avisar, avisarError } = useToast()
  const archivo = useRef(null)
  const [nombre, setNombre] = useState(perfil.nombre || '')
  const [bio, setBio] = useState(perfil.bio || '')
  const [foto, setFoto] = useState(perfil.foto || '')
  const [error, setError] = useState(null)
  const [procesando, setProcesando] = useState(false)
  const [guardando, setGuardando] = useState(false)

  async function elegirFoto(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setError(null)
    setProcesando(true)
    try {
      setFoto(await comprimirImagen(f))
    } catch (err) {
      setError(err.message)
    } finally {
      setProcesando(false)
    }
  }

  async function guardar(e) {
    e.preventDefault()
    const limpio = nombre.trim().replace(/\s+/g, ' ')
    if (limpio.length < 2) return setError('El nombre tiene que tener al menos 2 caracteres.')
    if (limpio.length > LIMITES_PERFIL.nombre) return setError(`El nombre puede tener hasta ${LIMITES_PERFIL.nombre} caracteres.`)
    if (bio.length > LIMITES_PERFIL.bio) return setError(`La bio puede tener hasta ${LIMITES_PERFIL.bio} caracteres.`)
    setError(null)
    setGuardando(true)
    try {
      await actualizarPerfil(perfil.uid, { nombre: limpio, bio: bio.trim(), foto })
      avisar('Perfil actualizado.')
      onCerrar()
    } catch (err) {
      avisarError('No se pudo guardar el perfil', err)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className="editor editor--perfil" onSubmit={guardar} noValidate>
      <header className="editor__cabecera">
        <h2 id="editar-perfil" className="rotulo">Editar perfil</h2>
        <button type="button" className="cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
      </header>

      <div className="editor__foto">
        <Avatar nombre={nombre || '?'} foto={foto} tamano={112} />
        <div className="editor__foto-acciones">
          <input ref={archivo} type="file" accept="image/jpeg,image/png,image/webp" onChange={elegirFoto} hidden />
          <button type="button" className="boton boton--negro" onClick={() => archivo.current.click()} disabled={procesando}>
            {procesando ? 'Procesando…' : 'Subir foto'}
          </button>
          {foto && (
            <button type="button" className="enlace" onClick={() => setFoto('')}>
              Quitar foto
            </button>
          )}
          <p className="editor__ayuda">JPG, PNG o WEBP de hasta 10 MB. Se recorta en cuadrado.</p>
        </div>
      </div>

      <label className="campo">
        <span className="etiqueta">
          Nombre de usuario <em>{nombre.length}/{LIMITES_PERFIL.nombre}</em>
        </span>
        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={LIMITES_PERFIL.nombre + 10} autoComplete="nickname" />
      </label>

      <label className="campo">
        <span className="etiqueta">
          Bio <em>{bio.length}/{LIMITES_PERFIL.bio}</em>
        </span>
        <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Ej.: fan del cine coreano y de las comedias de los 90" />
      </label>

      {error && <p className="aviso aviso--error">{error}</p>}

      <footer className="editor__pie">
        <button type="button" className="enlace" onClick={onCerrar}>Cancelar</button>
        <button className="boton" disabled={guardando || procesando}>{guardando ? 'Guardando…' : 'Guardar cambios'}</button>
      </footer>
    </form>
  )
}
