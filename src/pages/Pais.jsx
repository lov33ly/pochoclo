import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { tmdb, listar, imagen } from '../lib/tmdb'
import { nombrePais } from '../lib/paises'
import PortadaColor from '../components/PortadaColor'
import Poster from '../components/Poster'
import { SkeletonGrilla, Vacio, ErrorCarga } from '../components/Estados'

const ORDENES = [
  { valor: 'popular', etiqueta: 'Más vistas', params: { sort_by: 'popularity.desc' } },
  { valor: 'mejores', etiqueta: 'Mejor puntuadas', params: { sort_by: 'vote_average.desc', 'vote_count.gte': 80 } },
  { valor: 'recientes', etiqueta: 'Recientes', params: { sort_by: 'primary_release_date.desc', 'vote_count.gte': 5 } },
]

export default function Pais() {
  const { codigo } = useParams()
  const pais = codigo.toUpperCase()
  const valido = /^[A-Z]{2}$/.test(pais)
  const [params, setParams] = useSearchParams()
  const tipo = params.get('tipo') === 'tv' ? 'tv' : 'movie'
  const orden = ORDENES.find((o) => o.valor === params.get('orden')) || ORDENES[0]
  const clave = `${pais}|${tipo}|${orden.valor}`
  const [estado, setEstado] = useState({ clave: null, items: [], pagina: 1, total: 0, error: null })
  const [masCargando, setMasCargando] = useState(false)

  const consulta = (pagina) => {
    const p = { ...orden.params, with_origin_country: pais, include_adult: 'false', page: pagina }
    if (tipo === 'tv' && p.sort_by === 'primary_release_date.desc') p.sort_by = 'first_air_date.desc'
    return tmdb(`discover/${tipo}`, p)
  }

  useEffect(() => {
    if (!valido) return
    let vigente = true
    consulta(1)
      .then((d) => vigente && setEstado({ clave, items: listar(d, tipo), pagina: 1, total: d.total_pages, error: null }))
      .catch((error) => vigente && setEstado({ clave, items: [], pagina: 1, total: 0, error }))
    return () => {
      vigente = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave])

  async function cargarMas() {
    setMasCargando(true)
    try {
      const d = await consulta(estado.pagina + 1)
      setEstado((e) => ({ ...e, items: [...e.items, ...listar(d, tipo)], pagina: e.pagina + 1 }))
    } finally {
      setMasCargando(false)
    }
  }

  const cambiar = (k, v) => {
    const nuevo = Object.fromEntries(params)
    nuevo[k] = v
    setParams(nuevo, { replace: true })
  }

  if (!valido)
    return (
      <div className="contenedor pagina">
        <Vacio titulo="Ese país no está en el mapa" />
      </div>
    )

  return (
    <div>
      <PortadaColor
        color="rojo"
        fondo={estado.clave === clave && estado.items.find((t) => t.fondo) ? imagen(estado.items.find((t) => t.fondo).fondo, 'w1280') : null}
        rotulo={<Link to="/mundo" viewTransition>← Vuelta al mundo</Link>}
        rotuloDerecha={`Cine de ${nombrePais(pais)}`}
        titulo={nombrePais(pais)}
        proporcion={0.24}
        maximo={340}
        vertical={pais}
      />

      <div className="contenedor pagina">
        <div className="barra-filtros">
          <div className="chips" role="group" aria-label="Tipo">
            {[['movie', 'Películas'], ['tv', 'Series']].map(([v, e]) => (
              <button key={v} className={`chip ${tipo === v ? 'chip--activo' : ''}`} aria-pressed={tipo === v} onClick={() => cambiar('tipo', v)}>
                {e}
              </button>
            ))}
          </div>
          <div className="chips" role="group" aria-label="Orden">
            {ORDENES.map((o) => (
              <button
                key={o.valor}
                className={`chip ${orden.valor === o.valor ? 'chip--activo' : ''}`}
                aria-pressed={orden.valor === o.valor}
                onClick={() => cambiar('orden', o.valor)}
              >
                {o.etiqueta}
              </button>
            ))}
          </div>
        </div>

        {estado.clave !== clave ? (
          <SkeletonGrilla />
        ) : estado.error ? (
          <ErrorCarga error={estado.error} />
        ) : estado.items.length === 0 ? (
          <Vacio titulo="No encontramos títulos con este filtro" />
        ) : (
          <>
            <div className="grilla">
              {estado.items.map((t) => <Poster key={t.id} titulo={t} />)}
            </div>
            {estado.pagina < Math.min(estado.total, 500) && (
              <div className="centrado">
                <button className="boton" onClick={cargarMas} disabled={masCargando}>
                  {masCargando ? 'Cargando…' : 'Ver más'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
