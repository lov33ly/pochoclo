import { useState } from 'react'
import Estrellas from './Estrellas'
import { guardarResena, eliminarResena } from '../services/resenas'
import { quitarQuieroVer } from '../services/quieroVer'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { hoy } from '../lib/formato'

const MAX_TEXTO = 2000

// Formulario integrado en la ficha para crear, editar o eliminar la reseña propia.
export default function ResenaForm({ titulo, existente, enQuieroVer, onListo, onCancelar }) {
  const { usuario, perfil } = useAuth()
  const { avisar, avisarError } = useToast()
  const [datos, setDatos] = useState(() => ({
    puntaje: existente?.puntaje ?? null,
    texto: existente?.texto ?? '',
    meGusta: existente?.meGusta ?? false,
    spoiler: existente?.spoiler ?? false,
    vista: existente?.vista ?? hoy(),
  }))
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [confirmarBorrado, setConfirmarBorrado] = useState(false)

  const cambiar = (campo, valor) => setDatos((d) => ({ ...d, [campo]: valor }))

  async function guardar(e) {
    e.preventDefault()
    if (!datos.puntaje) return setError('Elegí un puntaje de media a cinco estrellas.')
    if (datos.texto.length > MAX_TEXTO) return setError(`La reseña puede tener hasta ${MAX_TEXTO} caracteres.`)
    if (!datos.vista || datos.vista > hoy()) return setError('La fecha en que la viste no puede ser futura.')
    setError(null)
    setGuardando(true)
    try {
      await guardarResena({ uid: usuario.uid, nombre: perfil?.nombre, displayName: usuario.displayName, photoURL: usuario.photoURL }, titulo, { ...datos, texto: datos.texto.trim() }, !!existente)
      if (enQuieroVer) await quitarQuieroVer(usuario.uid, titulo.tipo, titulo.id).catch(() => {})
      avisar(existente ? 'Reseña actualizada.' : `¡Reseñaste ${titulo.titulo}!`)
      onListo?.()
    } catch (err) {
      avisarError('No se pudo guardar la reseña', err)
    } finally {
      setGuardando(false)
    }
  }

  async function borrar() {
    setGuardando(true)
    try {
      await eliminarResena(existente.id)
      avisar('Reseña eliminada.')
      onListo?.()
    } catch (err) {
      avisarError('No se pudo eliminar', err)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className="editor" onSubmit={guardar} noValidate>
      <header className="editor__cabecera">
        <p className="rotulo">{existente ? 'Editando tu reseña' : 'Tu reseña'}</p>
        {onCancelar && (
          <button type="button" className="enlace" onClick={onCancelar}>
            Cancelar
          </button>
        )}
      </header>

      <div className="editor__fila">
        <div>
          <span className="etiqueta">Puntaje</span>
          <Estrellas valor={datos.puntaje} onChange={(v) => cambiar('puntaje', v)} />
        </div>
        <button
          type="button"
          className={`corazon ${datos.meGusta ? 'corazon--on' : ''}`}
          aria-pressed={datos.meGusta}
          onClick={() => cambiar('meGusta', !datos.meGusta)}
        >
          <span aria-hidden="true">♥</span> Me gustó
        </button>
      </div>

      <label className="campo">
        <span className="etiqueta">La vi el</span>
        <input type="date" value={datos.vista} max={hoy()} onChange={(e) => cambiar('vista', e.target.value)} />
      </label>

      <label className="campo">
        <span className="etiqueta">
          Reseña{' '}
          <em>
            opcional · {datos.texto.length}/{MAX_TEXTO}
          </em>
        </span>
        <textarea
          rows={5}
          value={datos.texto}
          onChange={(e) => cambiar('texto', e.target.value)}
          placeholder="¿Qué te pasó con esta historia?"
          aria-invalid={datos.texto.length > MAX_TEXTO}
        />
      </label>

      <label className="check">
        <input type="checkbox" checked={datos.spoiler} onChange={(e) => cambiar('spoiler', e.target.checked)} />
        Mi reseña contiene spoilers
      </label>

      {error && <p className="aviso aviso--error">{error}</p>}

      <footer className="editor__pie">
        {existente &&
          (confirmarBorrado ? (
            <span className="confirmar">
              ¿Seguro?
              <button type="button" className="enlace enlace--peligro" onClick={borrar} disabled={guardando}>
                Sí, eliminar
              </button>
              <button type="button" className="enlace" onClick={() => setConfirmarBorrado(false)}>
                No
              </button>
            </span>
          ) : (
            <button type="button" className="enlace enlace--peligro" onClick={() => setConfirmarBorrado(true)}>
              Eliminar reseña
            </button>
          ))}
        <button className="boton boton--primario" disabled={guardando}>
          {guardando ? 'Guardando…' : existente ? 'Guardar cambios' : 'Publicar reseña'}
        </button>
      </footer>
    </form>
  )
}
