import { Link } from 'react-router'
import { imagen } from '../lib/tmdb'
import { TIPOS } from '../lib/formato'
import { EstrellasFijas } from './Estrellas'
import { marcarTransicion } from '../lib/transicion'
import { useAuth } from '../context/AuthContext'

// Póster en blanco y negro; aparece en color si ya lo reseñaste.
export default function Poster({ titulo, puntaje, mostrarTipo = false, tamano = 'w342', prioridad = false }) {
  const { tipo, id } = titulo
  const { vistas } = useAuth()
  const vista = vistas.has(`${tipo}_${id}`)
  return (
    <Link
      to={`/${tipo}/${id}`}
      viewTransition
      onClick={marcarTransicion}
      className={`poster ${vista ? 'poster--vista' : ''}`}
      title={`${titulo.titulo}${titulo.anio ? ` (${titulo.anio})` : ''}`}
    >
      <div className="poster__marco">
        {titulo.poster ? (
          <img
            className="poster__img"
            data-vt
            src={imagen(titulo.poster, tamano)}
            alt=""
            loading={prioridad ? 'eager' : 'lazy'}
            decoding="async"
          />
        ) : (
          <div className="poster__img poster__img--vacio" data-vt>
            <span>{titulo.titulo}</span>
          </div>
        )}
        {puntaje != null && (
          <span className="poster__puntaje">
            <EstrellasFijas valor={puntaje} tamano={11} />
          </span>
        )}
      </div>
      <span className="poster__pie">
        <span className="poster__titulo">{titulo.titulo}</span>
        <span className="poster__meta">
          {mostrarTipo && `${TIPOS[tipo]} · `}
          {titulo.anio || '—'}
        </span>
      </span>
    </Link>
  )
}
