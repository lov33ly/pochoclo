import { useEffect, useRef, useState } from 'react'
import Estrellas from './Estrellas'
import { guardarResena, eliminarResena } from '../services/resenas'
import { quitarQuieroVer } from '../services/quieroVer'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { imagen } from '../lib/tmdb'
import { hoy } from '../lib/formato'

const MAX_TEXTO = 2000

// Diálogo para crear, editar o eliminar la reseña propia de un título.
export default function ResenaEditor({ abierto, onCerrar, ...props }) {
  const ref = useRef(null)

  useEffect(() => {
    const d = ref.current
    if (abierto && !d.open) d.showModal()
    if (!abierto && d.open) d.close()
  }, [abierto])

  return (
    <dialog
      ref={ref}
      className="dialogo"
      onClose={onCerrar}
      onClick={(e) => e.target === ref.current && onCerrar()}
      aria-labelledby="editor-titulo"
    >
      {/* Se vuelve a montar en cada apertura, así arranca con los datos actuales de la reseña. */}
      {abierto && <Formulario {...props} onCerrar={onCerrar} />}
    </dialog>
  )
}

function Formulario({ titulo, existente, enQuieroVer, onCerrar }) {
  const { usuario } = useAuth()
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
      await guardarResena(usuario, titulo, { ...datos, texto: datos.texto.trim() }, !!existente)
      if (enQuieroVer) await quitarQuieroVer(usuario.uid, titulo.tipo, titulo.id).catch(() => {})
      avisar(existente ? 'Reseña actualizada.' : `¡Reseñaste ${titulo.titulo}!`)
      onCerrar()
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
      onCerrar()
    } catch (err) {
      avisarError('No se pudo eliminar', err)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className="editor" onSubmit={guardar} noValidate>
      <header className="editor__cabecera">
        {titulo.poster && <img src={imagen(titulo.poster, 'w154')} alt="" className="editor__poster" />}
        <div>
          <p className="sobretitulo">{existente ? 'Editar reseña' : 'Nueva reseña'}</p>
          <h2 id="editor-titulo" className="editor__titulo">
            {titulo.titulo} <span>{titulo.anio}</span>
          </h2>
        </div>
        <button type="button" className="cerrar" onClick={onCerrar} aria-label="Cerrar">
          ✕
        </button>
      </header>

      <div className="editor__fila">
        <div>
          <span className="etiqueta">Tu puntaje</span>
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
          rows={6}
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
