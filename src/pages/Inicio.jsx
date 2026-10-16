import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router'
import { tmdb, listar, imagen } from '../lib/tmdb'
import { estiloColor, colorDe } from '../lib/color'
import { TIPOS } from '../lib/formato'
import { useAsync } from '../hooks/useAsync'
import { marcarTransicion } from '../lib/transicion'
import Carrusel from '../components/Carrusel'
import Ticket from '../components/Ticket'
import { Vacio } from '../components/Estados'
import { escucharUltimasResenas } from '../services/resenas'
import { REGIONES } from '../lib/mundo'
import { bandera, nombrePais } from '../lib/paises'

function useLista(ruta, params, tipo) {
  return useAsync(() => tmdb(ruta, params).then((d) => listar(d, tipo)), [ruta, params, tipo])
}

// Cartelera principal: rota entre las tendencias de la semana.
function Hero({ items }) {
  const [i, setI] = useState(0)
  const destacados = items.filter((t) => t.fondo).slice(0, 6)
  const t = destacados[i % destacados.length]

  useEffect(() => {
    if (destacados.length < 2) return
    const id = setInterval(() => setI((n) => n + 1), 7000)
    return () => clearInterval(id)
  }, [destacados.length])

  if (!t) return <section className="hero hero--vacio" />

  return (
    <section className="hero" style={estiloColor(t.id)}>
      {destacados.map((d, n) => (
        <img
          key={d.id}
          src={imagen(d.fondo, 'w1280')}
          alt=""
          aria-hidden="true"
          className={`hero__fondo ${d === t ? 'hero__fondo--activo' : ''}`}
          fetchPriority={n === 0 ? 'high' : 'low'}
        />
      ))}
      <div className="contenedor hero__interior">
        <p className="hero__rotulo">
          <span className="hero__luz" /> En cartelera esta semana · {TIPOS[t.tipo]}
        </p>
        <h1 key={t.id} className="hero__titulo">{t.titulo}</h1>
        <p className="hero__resumen">{t.resumen}</p>
        <div className="hero__acciones">
          <Link to={`/${t.tipo}/${t.id}`} viewTransition onClick={marcarTransicion} className="boton boton--grande boton--claro">
            Ver ficha y reseñar
            <img src={imagen(t.poster, 'w92')} alt="" data-vt className="hero__mini" />
          </Link>
        </div>
        <div className="hero__puntos" role="tablist" aria-label="Destacados">
          {destacados.map((d, n) => (
            <button
              key={d.id}
              role="tab"
              aria-selected={d === t}
              aria-label={d.titulo}
              className={d === t ? 'activo' : ''}
              onClick={() => setI(n)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// Actividad reciente de toda la comunidad, en tiempo real.
function Actividad() {
  const [resenas, setResenas] = useState(null)
  const [error, setError] = useState(null)
  useEffect(() => escucharUltimasResenas(6, setResenas, setError), [])

  return (
    <section className="actividad">
      <header className="carrusel__cabecera">
        <div>
          <h2 className="titulo-seccion">Recién salidas de la sala</h2>
          <p className="carrusel__bajada">Las últimas reseñas de la comunidad</p>
        </div>
      </header>
      {error ? (
        <p className="aviso aviso--error">No se pudo cargar la actividad: {error.message}</p>
      ) : !resenas ? (
        <div className="actividad__lista">
          {[0, 1].map((i) => <div key={i} className="skeleton actividad__esqueleto" />)}
        </div>
      ) : resenas.length === 0 ? (
        <Vacio icono="🎟️" titulo="Todavía no hay reseñas">Buscá tu película favorita y estrená Pochoclo.</Vacio>
      ) : (
        <div className="actividad__lista">
          {resenas.map((r) => <Ticket key={r.id} resena={r} />)}
        </div>
      )}
    </section>
  )
}

// Franja de banderas que invita a la sección Mundo.
function VueltaAlMundo({ abrirRuleta }) {
  const paises = REGIONES.flatMap((r) => r.paises.slice(0, 4))
  return (
    <section className="mundo-franja">
      <div className="mundo-franja__texto">
        <p className="sobretitulo">Vuelta al mundo</p>
        <h2 className="titulo-seccion">El cine no habla un solo idioma</h2>
        <p>Descubrí qué se ve en Corea, Nigeria, Irán o Uruguay. Cada país que reseñás suma un sello a tu pasaporte.</p>
        <div className="mundo-franja__acciones">
          <Link to="/mundo" viewTransition className="boton boton--primario">Elegir un país</Link>
          <button className="boton" onClick={abrirRuleta}>🎰 No sé qué ver</button>
        </div>
      </div>
      <ul className="mundo-franja__banderas" aria-label="Países">
        {paises.map((p) => (
          <li key={p}>
            <Link to={`/mundo/${p}`} viewTransition style={{ background: colorDe(p).fondo }} title={nombrePais(p)}>
              <span aria-hidden="true">{bandera(p)}</span>
              <span className="visualmente-oculto">{nombrePais(p)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Inicio() {
  const { abrirRuleta } = useOutletContext()
  const tendencias = useLista('trending/all/week')
  const pelis = useLista('movie/popular', { region: 'AR' }, 'movie')
  const series = useLista('tv/popular', undefined, 'tv')
  const joyas = useLista(
    'discover/movie',
    { sort_by: 'vote_average.desc', 'vote_count.gte': 1500, without_original_language: 'en' },
    'movie',
  )

  return (
    <>
      <Hero items={tendencias.datos || []} />
      <div className="contenedor pagina">
        <Carrusel titulo="Tendencias" bajada="Lo que más se está viendo en el planeta" mostrarTipo {...props(tendencias)} />
        <Carrusel titulo="Películas populares" {...props(pelis)} />
        <Actividad />
        <Carrusel titulo="Series del momento" {...props(series)} />
        <VueltaAlMundo abrirRuleta={abrirRuleta} />
        <Carrusel titulo="Joyas fuera de Hollywood" bajada="Las mejor puntuadas que no están habladas en inglés" {...props(joyas)} />
      </div>
    </>
  )
}

const props = (r) => ({ items: r.datos || [], cargando: r.cargando, error: r.error })
