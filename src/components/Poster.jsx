import { Link } from 'react-router'
import { imagen } from '../lib/tmdb'
import { TIPOS } from '../lib/formato'
import { EstrellasFijas } from './Estrellas'
import { marcarTransicion } from '../lib/transicion'

// Póster en blanco y negro que recupera el color al pasar el cursor.
export default function Poster({ titulo, puntaje, mostrarTipo = false, tamano = 'w342', prioridad = false }) {
  const { tipo, id } = titulo
  return (
    <Link
      to={`/${tipo}/${id}`}
      viewTransition
      onClick={marcarTransicion}
      className="poster"
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
