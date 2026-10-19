import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router'
import { tmdb, listar, imagen } from '../lib/tmdb'
import { TIPOS } from '../lib/formato'
import { useAsync } from '../hooks/useAsync'
import { marcarTransicion } from '../lib/transicion'
import { escucharUltimasResenas } from '../services/resenas'
import { REGIONES } from '../lib/mundo'
import { nombrePais } from '../lib/paises'
import Carrusel from '../components/Carrusel'
import Resena from '../components/Resena'
import Seccion from '../components/Seccion'
import TextoEscalado from '../components/TextoEscalado'
import Cinta from '../components/Cinta'

function useLista(ruta, params, tipo) {
  return useAsync(() => tmdb(ruta, params).then((d) => listar(d, tipo)), [ruta, params, tipo])
}

// Portada: fotograma en duotono azul, el nombre gigante en rojo encima y la película en cartelera.
function Portada({ items, abrirRuleta }) {
  const [i, setI] = useState(0)
  const destacados = items.filter((t) => t.fondo).slice(0, 6)
  const t = destacados.length ? destacados[i % destacados.length] : null

  useEffect(() => {
    if (destacados.length < 2) return
    const id = setInterval(() => setI((n) => n + 1), 6500)
    return () => clearInterval(id)
  }, [destacados.length])

  return (
    <section className="portada-inicio">
      {destacados.map((d) => (
        <img
          key={d.id}
          src={imagen(d.fondo, 'w1280')}
          alt=""
          aria-hidden="true"
          className={`portada-inicio__fondo ${d === t ? 'portada-inicio__fondo--activo' : ''}`}
        />
      ))}

      <div className="contenedor portada-inicio__interior">
        <p className="portada-inicio__barra">
          <span>Reseñas de cine y series</span>
          <span>Todo el mundo, todas las películas</span>
        </p>

        <TextoEscalado como="h1" proporcion={0.3} maximo={420} className="portada-inicio__marca">
          POCHOCLO
        </TextoEscalado>

        <div className="portada-inicio__grilla">
          <div>
            <p className="portada-inicio__lema">Tu diario, tus puntajes, tu pasaporte de cine.</p>
            <div className="portada-inicio__acciones">
              <Link to="/buscar" viewTransition className="boton boton--rojo">Buscar un título</Link>
              <button className="boton boton--contorno" onClick={abrirRuleta}>No sé qué ver</button>
            </div>
          </div>

          {t && (
            <Link to={`/${t.tipo}/${t.id}`} viewTransition onClick={marcarTransicion} className="cartelera">
              <span className="cartelera__poster-caja">
                <img src={imagen(t.poster, 'w185')} alt="" data-vt className="cartelera__poster" />
                <Cinta arriba={-10} izquierda="18%" giro={-6} ancho={70} />
              </span>
              <span className="cartelera__texto">
                <span className="cartelera__rotulo">En cartelera</span>
                <strong key={t.id}>{t.titulo}</strong>
                <span>{TIPOS[t.tipo]} · {t.anio}</span>
              </span>
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}

// Últimas reseñas de toda la comunidad, en tiempo real.
function Actividad() {
  const [resenas, setResenas] = useState(null)
  const [error, setError] = useState(null)
  useEffect(() => escucharUltimasResenas(6, setResenas, setError), [])

  return (
    <Seccion titulo="Recién reseñadas" extra={<span className="mono">En vivo</span>}>
      {error ? (
        <p className="aviso aviso--error">No se pudo cargar la actividad: {error.message}</p>
      ) : !resenas ? (
        <div className="actividad">
          {[0, 1].map((i) => <div key={i} className="skeleton actividad__esqueleto" />)}
        </div>
      ) : resenas.length === 0 ? (
        <p className="nota-vacia">Todavía no hay reseñas. Buscá tu película favorita y estrená Pochoclo.</p>
      ) : (
        <div className="actividad">
          {resenas.map((r) => <Resena key={r.id} resena={r} variante="autor" />)}
        </div>
      )}
    </Seccion>
  )
}

// Bloque negro que invita a la sección Mundo, con códigos de país como señalética.
function VueltaAlMundo() {
  const paises = REGIONES.flatMap((r) => r.paises.slice(0, 3))
  return (
    <section className="bloque-mundo">
      <p className="rotulo">Vuelta al mundo</p>
      <TextoEscalado proporcion={0.2} maximo={260}>EL CINE NO HABLA UN SOLO IDIOMA</TextoEscalado>
      <ul className="codigos">
        {paises.map((p) => (
          <li key={p}>
            <Link to={`/mundo/${p}`} viewTransition title={nombrePais(p)}>
              <strong>{p}</strong>
              <span>{nombrePais(p)}</span>
            </Link>
          </li>
        ))}
        <li>
          <Link to="/mundo" viewTransition className="codigos__todos">
            <strong>→</strong>
            <span>Ver todos</span>
          </Link>
        </li>
      </ul>
    </section>
  )
}

export default function Inicio() {
  const { abrirRuleta } = useOutletContext()
  const tendencias = useLista('trending/all/week')
  const pelis = useLista('movie/popular', { region: 'AR' }, 'movie')
  const series = useLista('trending/tv/week', undefined, 'tv')
  const joyas = useLista(
    'discover/movie',
    { sort_by: 'vote_average.desc', 'vote_count.gte': 1500, without_original_language: 'en' },
    'movie',
  )

  return (
    <>
      <Portada items={tendencias.datos || []} abrirRuleta={abrirRuleta} />
      <div className="contenedor pagina">
        <Carrusel titulo="Tendencias" bajada="Lo más visto esta semana" mostrarTipo {...props(tendencias)} />
        <Carrusel titulo="Películas populares" {...props(pelis)} />
        <Actividad />
        <Carrusel titulo="Series en tendencia" {...props(series)} />
        <VueltaAlMundo />
        <Carrusel titulo="Joyas fuera de Hollywood" bajada="Mejor puntuadas, no habladas en inglés" {...props(joyas)} />
      </div>
    </>
  )
}

const props = (r) => ({ items: r.datos || [], cargando: r.cargando, error: r.error })
