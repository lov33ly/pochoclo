import { Link } from 'react-router'
import { imagen } from '../lib/tmdb'
import { estiloColor } from '../lib/color'
import { TIPOS } from '../lib/formato'
import { EstrellasFijas } from './Estrellas'
import { marcarTransicion } from '../lib/transicion'

export default function Poster({ titulo, puntaje, mostrarTipo = false, tamano = 'w342', prioridad = false }) {
  const { tipo, id } = titulo
  return (
    <Link
      to={`/${tipo}/${id}`}
      viewTransition
      onClick={marcarTransicion}
      className="poster"
      style={estiloColor(id)}
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
        {mostrarTipo && <span className="poster__tipo">{TIPOS[tipo]}</span>}
        {puntaje != null && (
          <span className="poster__puntaje">
            <EstrellasFijas valor={puntaje} tamano={12} />
          </span>
        )}
      </div>
      <span className="poster__titulo">{titulo.titulo}</span>
      {titulo.anio ? <span className="poster__anio">{titulo.anio}</span> : null}
    </Link>
  )
}
