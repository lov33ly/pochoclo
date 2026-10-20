import { useState } from 'react'
import Seccion from './Seccion'
import { imagen } from '../lib/tmdb'

// Tráiler de YouTube "liviano": primero se muestra solo la imagen, y el reproductor
// se carga recién al tocar play (más rápido y sin cookies de YouTube hasta ese momento).
// La portada es un fotograma de la película; si no hay, la miniatura de YouTube.
export default function Trailer({ trailer, titulo, fondo }) {
  const [reproduciendo, setReproduciendo] = useState(false)
  if (!trailer) return null

  return (
    <Seccion titulo="Tráiler" extra={<span>{trailer.idioma === 'es' ? 'En español' : 'Idioma original'}</span>}>
      <div className="trailer">
        {reproduciendo ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${trailer.clave}?autoplay=1&rel=0`}
            title={`Tráiler de ${titulo}`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button className="trailer__portada" onClick={() => setReproduciendo(true)} aria-label={`Ver el tráiler de ${titulo}`}>
            <img
              src={fondo ? imagen(fondo, 'w780') : `https://i.ytimg.com/vi/${trailer.clave}/hqdefault.jpg`}
              alt=""
              loading="lazy"
            />
            <span className="trailer__play" aria-hidden="true">▶</span>
            <span className="trailer__nombre">{trailer.nombre}</span>
          </button>
        )}
      </div>
    </Seccion>
  )
}
