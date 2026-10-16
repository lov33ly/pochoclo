import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { tmdb, listar, imagen } from '../lib/tmdb'
import { TODOS_LOS_PAISES } from '../lib/mundo'
import { bandera, nombrePais } from '../lib/paises'
import { TIPOS } from '../lib/formato'

const ALTO = 240 // alto de cada póster en el rodillo (px)

// "No sé qué ver": una tragamonedas de pósters que frena en una recomendación al azar.
export default function Ruleta({ abierto, onCerrar }) {
  const ref = useRef(null)

  useEffect(() => {
    const d = ref.current
    if (abierto && !d.open) d.showModal()
    if (!abierto && d.open) d.close()
  }, [abierto])

  return (
    <dialog ref={ref} className="dialogo dialogo--ruleta" onClose={onCerrar} onClick={(e) => e.target === ref.current && onCerrar()} aria-label="Ruleta">
      {abierto && <Maquina onCerrar={onCerrar} />}
    </dialog>
  )
}

function Maquina({ onCerrar }) {
  const [tipo, setTipo] = useState('movie')
  const [genero, setGenero] = useState('')
  const [pais, setPais] = useState('')
  const [generos, setGeneros] = useState([])
  const [rodillo, setRodillo] = useState([])
  const [girando, setGirando] = useState(false)
  const [elegido, setElegido] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    tmdb(`genre/${tipo}/list`).then((d) => setGeneros(d.genres || [])).catch(() => setGeneros([]))
  }, [tipo])

  async function girar() {
    setError(null)
    setElegido(null)
    setGirando(true)
    try {
      const base = { sort_by: 'popularity.desc', 'vote_count.gte': 30, include_adult: 'false' }
      if (genero) base.with_genres = genero
      if (pais) base.with_origin_country = pais
      const primera = await tmdb(`discover/${tipo}`, { ...base, page: 1 })
      const paginas = Math.min(primera.total_pages || 1, 25)
      const pagina = 1 + Math.floor(Math.random() * paginas)
      const datos = pagina === 1 ? primera : await tmdb(`discover/${tipo}`, { ...base, page: pagina })
      const opciones = listar(datos, tipo).filter((t) => t.poster)
      if (!opciones.length) throw new Error('No hay títulos con esa combinación. Probá con otro género o país.')

      const ganador = opciones[Math.floor(Math.random() * opciones.length)]
      // El rodillo: pósters al azar y el ganador al final.
      const relleno = Array.from({ length: 18 }, () => opciones[Math.floor(Math.random() * opciones.length)])
      setRodillo([...relleno, ganador])
      setTimeout(() => {
        setElegido(ganador)
        setGirando(false)
      }, 2600)
    } catch (e) {
      setError(e.message)
      setGirando(false)
    }
  }

  return (
    <div className="ruleta">
      <header className="editor__cabecera">
        <div>
          <p className="sobretitulo">No sé qué ver</p>
          <h2 className="editor__titulo">La ruleta del pochoclo</h2>
        </div>
        <button type="button" className="cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
      </header>

      <div className="ruleta__opciones">
        <div className="chips">
          {Object.entries(TIPOS).map(([v, e]) => (
            <button key={v} className={`chip ${tipo === v ? 'chip--activo' : ''}`} onClick={() => { setTipo(v); setGenero('') }} disabled={girando}>
              {e}
            </button>
          ))}
        </div>
        <label>
          <span className="etiqueta">Género</span>
          <select value={genero} onChange={(e) => setGenero(e.target.value)} disabled={girando}>
            <option value="">Cualquiera</option>
            {generos.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </label>
        <label>
          <span className="etiqueta">País</span>
          <select value={pais} onChange={(e) => setPais(e.target.value)} disabled={girando}>
            <option value="">Cualquiera</option>
            {TODOS_LOS_PAISES.map((p) => <option key={p} value={p}>{bandera(p)} {nombrePais(p)}</option>)}
          </select>
        </label>
      </div>

      <div className="ruleta__ventana" aria-live="polite">
        {rodillo.length > 0 ? (
          <div
            key={rodillo.map((r) => r.id).join()}
            className="ruleta__rodillo"
            style={{ '--destino': `-${(rodillo.length - 1) * ALTO}px` }}
          >
            {rodillo.map((t, i) => (
              <img key={i} src={imagen(t.poster, 'w342')} alt={i === rodillo.length - 1 ? t.titulo : ''} />
            ))}
          </div>
        ) : (
          <span className="ruleta__signo" aria-hidden="true">?</span>
        )}
      </div>

      {error && <p className="aviso aviso--error">{error}</p>}

      {elegido ? (
        <div className="ruleta__resultado">
          <p className="sobretitulo">Hoy te toca</p>
          <p className="ruleta__titulo">{elegido.titulo} <span>{elegido.anio}</span></p>
          <div className="ruleta__acciones">
            <Link to={`/${elegido.tipo}/${elegido.id}`} viewTransition className="boton boton--primario" onClick={onCerrar}>
              Ver ficha
            </Link>
            <button className="boton" onClick={girar}>Girar otra vez</button>
          </div>
        </div>
      ) : (
        <button className="boton boton--primario boton--grande ruleta__girar" onClick={girar} disabled={girando}>
          {girando ? 'Girando…' : '🎰 ¡Girar!'}
        </button>
      )}
    </div>
  )
}
