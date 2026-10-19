import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { tmdb, listar } from '../lib/tmdb'
import Poster from '../components/Poster'
import TextoEscalado from '../components/TextoEscalado'
import { SkeletonGrilla, Vacio, ErrorCarga } from '../components/Estados'

const FILTROS = [
  { valor: 'multi', etiqueta: 'Todo' },
  { valor: 'movie', etiqueta: 'Películas' },
  { valor: 'tv', etiqueta: 'Series' },
]

export default function Buscar() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const filtro = params.get('tipo') || 'multi'
  const [texto, setTexto] = useState(q)
  const [estado, setEstado] = useState({ clave: null, items: [], pagina: 1, total: 0, error: null })
  const [masCargando, setMasCargando] = useState(false)
  const clave = `${filtro}|${q}`

  // Búsqueda con espera (debounce): actualiza la URL 350 ms después de dejar de escribir.
  useEffect(() => {
    const t = setTimeout(() => {
      if (texto.trim() !== q) setParams(texto.trim() ? { q: texto.trim(), tipo: filtro } : {}, { replace: true })
    }, 350)
    return () => clearTimeout(t)
  }, [texto, q, filtro, setParams])

  useEffect(() => {
    if (!q) return
    let vigente = true
    tmdb(`search/${filtro}`, { query: q, include_adult: 'false', page: 1 })
      .then((d) => {
        if (vigente)
          setEstado({ clave, items: listar(d, filtro === 'multi' ? undefined : filtro), pagina: 1, total: d.total_pages, error: null })
      })
      .catch((error) => vigente && setEstado({ clave, items: [], pagina: 1, total: 0, error }))
    return () => {
      vigente = false
    }
  }, [q, filtro, clave])

  async function cargarMas() {
    setMasCargando(true)
    try {
      const d = await tmdb(`search/${filtro}`, { query: q, include_adult: 'false', page: estado.pagina + 1 })
      setEstado((e) => ({ ...e, items: [...e.items, ...listar(d, filtro === 'multi' ? undefined : filtro)], pagina: e.pagina + 1 }))
    } finally {
      setMasCargando(false)
    }
  }

  const cargando = q && estado.clave !== clave
  const items = estado.items.filter((t, i, arr) => arr.findIndex((x) => x.tipo === t.tipo && x.id === t.id) === i)

  return (
    <div className="contenedor pagina">
      <header className="portada">
        <p className="rotulo">Buscador</p>
        <TextoEscalado como="h1" proporcion={0.24} maximo={300}>¿QUÉ VISTE?</TextoEscalado>
      </header>

      <div className="buscador">
        <input
          className="buscador__input"
          type="search"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Parasite, La casa de papel, Relatos salvajes…"
          aria-label="Buscar"
          autoFocus
        />
        <div className="chips" role="group" aria-label="Tipo">
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              className={`chip ${filtro === f.valor ? 'chip--activo' : ''}`}
              aria-pressed={filtro === f.valor}
              onClick={() => setParams(q ? { q, tipo: f.valor } : { tipo: f.valor }, { replace: true })}
            >
              {f.etiqueta}
            </button>
          ))}
        </div>
      </div>

      {!q ? (
        <Vacio titulo="Buscá cualquier película o serie del mundo">
          Más de un millón de títulos: desde Hollywood hasta el cine iraní, el anime o las telenovelas.
        </Vacio>
      ) : cargando ? (
        <SkeletonGrilla />
      ) : estado.error ? (
        <ErrorCarga error={estado.error} />
      ) : items.length === 0 ? (
        <Vacio titulo={`Nada para “${q}”`}>Probá con el título original o en otro idioma.</Vacio>
      ) : (
        <>
          <div className="grilla">
            {items.map((t) => (
              <Poster key={t.tipo + t.id} titulo={t} mostrarTipo={filtro === 'multi'} />
            ))}
          </div>
          {estado.pagina < estado.total && (
            <div className="centrado">
              <button className="boton" onClick={cargarMas} disabled={masCargando}>
                {masCargando ? 'Cargando…' : 'Ver más resultados'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
