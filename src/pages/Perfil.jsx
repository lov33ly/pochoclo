import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { escucharResenasDeUsuario } from '../services/resenas'
import { imagen } from '../lib/tmdb'

export default function Perfil() {
  const { uid } = useParams()
  const [resenas, setResenas] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => escucharResenasDeUsuario(uid, setResenas, (e) => setError(e.message)), [uid])

  if (error) return <p className="error">{error}</p>
  if (!resenas) return <p>Cargando…</p>

  return (
    <>
      <h1>Reseñas ({resenas.length})</h1>
      <div className="grilla">
        {resenas.map((r) => (
          <Link key={r.id} to={`/${r.tipo}/${r.tmdbId}`} className="tarjeta">
            <img src={imagen(r.poster)} alt="" />
            <span>{r.titulo} — {r.puntaje}★</span>
          </Link>
        ))}
      </div>
    </>
  )
}
