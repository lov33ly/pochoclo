import { useState } from 'react'
import { Link } from 'react-router'
import { imagen } from '../lib/tmdb'
import { estiloColor } from '../lib/color'
import { fecha, TIPOS } from '../lib/formato'
import { EstrellasFijas } from './Estrellas'
import Avatar from './Avatar'

// Una reseña con forma de entrada de cine: talón con el póster y cuerpo con la crítica.
// variante "titulo" (en la ficha: se ve quién reseñó) o "autor" (en el perfil: se ve qué película).
export default function Ticket({ resena, variante = 'titulo', propia, onEditar }) {
  const [revelar, setRevelar] = useState(false)
  const oculto = resena.spoiler && !revelar && !propia
  const numero = resena.id.slice(-6).toUpperCase()

  return (
    <article className="ticket" style={estiloColor(resena.tmdbId)}>
      <Link to={`/${resena.tipo}/${resena.tmdbId}`} viewTransition className="ticket__talon">
        {resena.poster ? (
          <img src={imagen(resena.poster, 'w185')} alt="" loading="lazy" />
        ) : (
          <span className="ticket__sin-poster">{resena.titulo}</span>
        )}
        <span className="ticket__admite">Admite uno</span>
      </Link>

      <div className="ticket__cuerpo">
        <header className="ticket__cabecera">
          {variante === 'titulo' ? (
            <Link to={`/u/${resena.uid}`} viewTransition className="ticket__autor">
              <Avatar nombre={resena.autorNombre} foto={resena.autorFoto} tamano={28} />
              <span>{resena.autorNombre}</span>
            </Link>
          ) : (
            <Link to={`/${resena.tipo}/${resena.tmdbId}`} viewTransition className="ticket__titulo">
              {resena.titulo} <span>{resena.anio || ''}</span>
            </Link>
          )}
          <span className="ticket__numero">Nº {numero}</span>
        </header>

        <div className="ticket__puntaje">
          <EstrellasFijas valor={resena.puntaje} tamano={18} />
          {resena.meGusta && <span className="ticket__corazon" title="Le gustó">♥</span>}
          {variante === 'autor' && <span className="ticket__tipo">{TIPOS[resena.tipo]}</span>}
        </div>

        {resena.texto && (
          <div className={`ticket__texto ${oculto ? 'ticket__texto--spoiler' : ''}`}>
            <p>{resena.texto}</p>
            {oculto && (
              <button className="ticket__revelar" onClick={() => setRevelar(true)}>
                Contiene spoilers · mostrar
              </button>
            )}
          </div>
        )}

        <footer className="ticket__pie">
          <span>Vista el {fecha(resena.vista)}</span>
          {propia && onEditar && (
            <button className="enlace" onClick={onEditar}>Editar</button>
          )}
        </footer>
      </div>
    </article>
  )
}
