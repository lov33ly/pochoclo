import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { detalle, imagen } from '../lib/tmdb'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../context/AuthContext'
import { escucharResenasDeTitulo, guardarResena, eliminarResena, idResena } from '../services/resenas'

export default function Detalle() {
  const { tipo, id } = useParams()
  const { usuario } = useAuth()
  const { datos: t, cargando, error } = useAsync(() => detalle(tipo, id), [tipo, id])
  const [resenas, setResenas] = useState([])
  const [puntaje, setPuntaje] = useState(3)
  const [texto, setTexto] = useState('')
  const [mensaje, setMensaje] = useState(null)

  useEffect(
    () => escucharResenasDeTitulo(tipo, id, setResenas, (e) => setMensaje(e.message)),
    [tipo, id],
  )

  const mia = usuario && resenas.find((r) => r.id === idResena(usuario.uid, tipo, Number(id)))

  async function guardar(e) {
    e.preventDefault()
    try {
      await guardarResena(usuario, t, {
        puntaje: Number(puntaje),
        texto: texto.trim(),
        meGusta: false,
        spoiler: false,
        vista: new Date().toISOString().slice(0, 10),
      }, !!mia)
      setMensaje('Reseña guardada')
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  if (cargando) return <p>Cargando…</p>
  if (error) return <p className="error">{error.message}</p>

  return (
    <article>
      <h1>{t.titulo} ({t.anio})</h1>
      <img src={imagen(t.poster)} alt="" width="200" />
      <p>{t.resumen}</p>

      {usuario ? (
        <form onSubmit={guardar}>
          <select value={puntaje} onChange={(e) => setPuntaje(e.target.value)}>
            {[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}
          </select>
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Tu reseña" />
          <button>{mia ? 'Actualizar' : 'Publicar'}</button>
          {mia && <button type="button" onClick={() => eliminarResena(mia.id)}>Eliminar</button>}
        </form>
      ) : (
        <p>Entrá con Google para reseñar.</p>
      )}
      {mensaje && <p>{mensaje}</p>}

      <h2>Reseñas</h2>
      {resenas.map((r) => (
        <div key={r.id} className="resena">
          <Link to={`/u/${r.uid}`}>{r.autorNombre}</Link> — {r.puntaje}★
          <p>{r.texto}</p>
        </div>
      ))}
    </article>
  )
}
