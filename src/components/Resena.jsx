import { useState } from 'react'
import { Link } from 'react-router'
import { imagen } from '../lib/tmdb'
import { fecha, TIPOS } from '../lib/formato'
import { EstrellasFijas } from './Estrellas'
import Avatar from './Avatar'
import { usePerfilPublico } from '../hooks/usePerfilPublico'

const LARGO_MAXIMO = 420

// Una reseña como fila tipográfica: puntaje en grande, autor/título, texto y fecha.
// variante "titulo" (en la ficha: se ve quién reseñó) o "autor" (en perfil e inicio: se ve qué película).
// origen: "pochoclo" (Firestore), "tmdb" (reseña real de TMDB) o "ejemplo" (inventada).
export default function Resena({ resena, variante = 'titulo', propia, mostrarSpoiler, onEditar }) {
  const [revelar, setRevelar] = useState(false)
  const [completa, setCompleta] = useState(false)
  const origen = resena.origen || 'pochoclo'
  // Para reseñas de Pochoclo se muestran el nombre y la foto actuales del perfil.
  const perfil = usePerfilPublico(origen === 'pochoclo' && variante === 'titulo' ? resena.uid : null)
  const nombre = perfil?.nombre || resena.autorNombre
  const foto = perfil ? perfil.foto : resena.autorFoto
  const oculto = resena.spoiler && !revelar && !propia && !mostrarSpoiler
  const largo = (resena.texto || '').length > LARGO_MAXIMO
  const texto = largo && !completa ? resena.texto.slice(0, LARGO_MAXIMO).trimEnd() + '…' : resena.texto

  const autor = (
    <>
      <Avatar nombre={nombre || '?'} foto={foto} tamano={24} />
      <span>{nombre}</span>
      {propia && <em>(vos)</em>}
    </>
  )

  return (
    <article className={`resena ${propia ? 'resena--propia' : ''}`}>
      {variante === 'autor' && (
        <Link to={`/${resena.tipo}/${resena.tmdbId}`} viewTransition className="resena__poster" tabIndex={-1} aria-hidden="true">
          {resena.poster ? <img src={imagen(resena.poster, 'w154')} alt="" loading="lazy" /> : <span />}
        </Link>
      )}

      <p className="resena__nota" aria-label={resena.puntaje ? `${resena.puntaje} de 5` : 'Sin puntaje'}>
        {resena.puntaje ? String(resena.puntaje).replace('.', ',') : '–'}
      </p>

      <div className="resena__cuerpo">
        <header className="resena__cabecera">
          {variante === 'autor' ? (
            <Link to={`/${resena.tipo}/${resena.tmdbId}`} viewTransition className="resena__titulo">
              {resena.titulo}
            </Link>
          ) : origen === 'pochoclo' ? (
            <Link to={`/u/${resena.uid}`} viewTransition className="resena__autor">{autor}</Link>
          ) : (
            <span className="resena__autor">{autor}</span>
          )}
          {resena.puntaje ? <EstrellasFijas valor={resena.puntaje} tamano={13} /> : null}
          {resena.meGusta && <span className="resena__corazon" title="Le gustó">♥</span>}
        </header>

        {texto && (
          <div className={`resena__texto ${oculto ? 'resena__texto--spoiler' : ''}`}>
            <p>{texto}</p>
            {largo && !oculto && (
              <button className="enlace resena__mas" onClick={() => setCompleta((c) => !c)}>
                {completa ? 'Leer menos' : 'Leer más'}
              </button>
            )}
            {oculto && (
              <button className="resena__revelar" onClick={() => setRevelar(true)}>
                Contiene spoilers — mostrar
              </button>
            )}
          </div>
        )}

        <footer className="resena__pie">
          {variante === 'autor' && (
            <span>
              {TIPOS[resena.tipo]} · {resena.anio || '—'}
              {resena.autorNombre && ` · ${resena.autorNombre}`}
            </span>
          )}
          {resena.vista && <span>{origen === 'tmdb' ? 'Publicada el' : 'Vista el'} {fecha(resena.vista)}</span>}
          {origen === 'tmdb' && (
            <a className="resena__origen" href={resena.url} target="_blank" rel="noreferrer">Vía TMDB</a>
          )}
          {origen === 'ejemplo' && <span className="resena__origen">Ejemplo</span>}
          {propia && onEditar && (
            <button className="enlace" onClick={onEditar}>Editar</button>
          )}
        </footer>
      </div>
    </article>
  )
}
