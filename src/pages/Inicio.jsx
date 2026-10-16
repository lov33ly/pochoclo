import { useState } from 'react'
import { Link } from 'react-router'
import { tmdb, listar, imagen } from '../lib/tmdb'
import { useAsync } from '../hooks/useAsync'

export default function Inicio() {
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const { datos, cargando, error } = useAsync(
    () => (busqueda ? tmdb('search/multi', { query: busqueda }) : tmdb('trending/all/week')).then((d) => listar(d)),
    [busqueda],
  )

  return (
    <>
      <form onSubmit={(e) => { e.preventDefault(); setBusqueda(texto.trim()) }}>
        <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Buscar película o serie" />
        <button>Buscar</button>
      </form>
      <h2>{busqueda ? `Resultados para “${busqueda}”` : 'Tendencias de la semana'}</h2>
      {cargando && <p>Cargando…</p>}
      {error && <p className="error">{error.message}</p>}
      <div className="grilla">
        {datos?.map((t) => (
          <Link key={t.tipo + t.id} to={`/${t.tipo}/${t.id}`} className="tarjeta">
            {t.poster ? <img src={imagen(t.poster)} alt="" /> : <div className="sin-poster">{t.titulo}</div>}
            <span>{t.titulo} ({t.anio || '—'})</span>
          </Link>
        ))}
      </div>
    </>
  )
}
