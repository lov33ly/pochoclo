import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { escucharResenasDeUsuario } from '../services/resenas'
import { escucharPerfil } from '../services/usuarios'
import { escucharQuieroVer } from '../services/quieroVer'
import { useAuth } from '../context/AuthContext'
import { mes } from '../lib/formato'
import Avatar from '../components/Avatar'
import Poster from '../components/Poster'
import Ticket from '../components/Ticket'
import { Cargador, ErrorCarga, Vacio } from '../components/Estados'

export default function Perfil() {
  const { uid } = useParams()
  const { usuario } = useAuth()
  const propio = usuario?.uid === uid
  const [params, setParams] = useSearchParams()
  const pestana = params.get('ver') || 'diario'
  const [perfil, setPerfil] = useState({ uid: null, datos: null })
  const [resenas, setResenas] = useState({ uid: null, lista: [] })
  const [lista, setLista] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => escucharPerfil(uid, (datos) => setPerfil({ uid, datos }), setError), [uid])
  useEffect(() => escucharResenasDeUsuario(uid, (l) => setResenas({ uid, lista: l }), setError), [uid])
  useEffect(() => {
    if (!propio) return
    return escucharQuieroVer(uid, setLista, setError)
  }, [uid, propio])

  const datos = perfil.uid === uid ? perfil.datos : undefined
  const mias = useMemo(() => (resenas.uid === uid ? resenas.lista : []), [resenas, uid])

  const cifras = useMemo(() => {
    const pelis = mias.filter((r) => r.tipo === 'movie')
    return {
      pelis: pelis.length,
      series: mias.length - pelis.length,
      horas: Math.round(pelis.reduce((s, r) => s + (r.duracion || 0), 0) / 60),
      promedio: mias.length ? (mias.reduce((s, r) => s + r.puntaje, 0) / mias.length).toFixed(1) : '–',
    }
  }, [mias])

  // Diario: reseñas agrupadas por el mes en que se vieron.
  const diario = useMemo(() => {
    const grupos = new Map()
    ;[...mias]
      .sort((a, b) => (b.vista || '').localeCompare(a.vista || ''))
      .forEach((r) => {
        const k = (r.vista || '0000-00').slice(0, 7)
        if (!grupos.has(k)) grupos.set(k, [])
        grupos.get(k).push(r)
      })
    return [...grupos]
  }, [mias])

  if (error) return <div className="contenedor pagina"><ErrorCarga error={error} /></div>
  if (datos === undefined || resenas.uid !== uid) return <Cargador texto="Buscando la butaca" />
  if (datos === null)
    return (
      <div className="contenedor pagina">
        <Vacio icono="👻" titulo="Este perfil no existe" />
      </div>
    )

  const PESTANAS = [
    ['diario', 'Diario', mias.length],
    ['grilla', 'Pósters', mias.length],
    ...(propio ? [['quiero', 'Quiero ver', lista.length]] : []),
  ]

  return (
    <div className="perfil">
      <header className="perfil__cabecera">
        <div className="contenedor perfil__interior">
          <Avatar nombre={datos.nombre} foto={datos.foto} tamano={96} />
          <div className="perfil__nombre">
            <p className="sobretitulo">{propio ? 'Tu perfil' : 'Perfil'}</p>
            <h1 className="titulo-pagina">{datos.nombre}</h1>
          </div>
          <dl className="cifras">
            <div><dt>Películas</dt><dd>{cifras.pelis}</dd></div>
            <div><dt>Series</dt><dd>{cifras.series}</dd></div>
            <div><dt>Horas de cine</dt><dd>{cifras.horas}</dd></div>
            <div><dt>Promedio</dt><dd>{cifras.promedio}</dd></div>
          </dl>
        </div>
      </header>

      <div className="contenedor pagina">
        <nav className="pestanas" aria-label="Secciones del perfil">
          {PESTANAS.map(([v, etiqueta, n]) => (
            <button
              key={v}
              className={`pestana ${pestana === v ? 'pestana--activa' : ''}`}
              aria-current={pestana === v ? 'page' : undefined}
              onClick={() => setParams({ ver: v }, { replace: true })}
            >
              {etiqueta} <span className="contador">{n}</span>
            </button>
          ))}
        </nav>

        {pestana === 'diario' &&
          (diario.length === 0 ? (
            <Vacio icono="🎟️" titulo={propio ? 'Tu diario está vacío' : 'Todavía no reseñó nada'}>
              {propio && 'Buscá la última película que viste y dejale tu reseña.'}
            </Vacio>
          ) : (
            diario.map(([k, rs]) => (
              <section key={k} className="diario__mes">
                <h2 className="diario__titulo">{mes(k + '-01')}</h2>
                {rs.map((r) => <Ticket key={r.id} resena={r} variante="autor" />)}
              </section>
            ))
          ))}

        {pestana === 'grilla' &&
          (mias.length === 0 ? (
            <Vacio icono="🖼️" titulo="Sin pósters todavía" />
          ) : (
            <div className="grilla">
              {mias.map((r) => (
                <Poster
                  key={r.id}
                  titulo={{ id: r.tmdbId, tipo: r.tipo, titulo: r.titulo, poster: r.poster, anio: r.anio }}
                  puntaje={r.puntaje}
                />
              ))}
            </div>
          ))}

        {pestana === 'quiero' &&
          propio &&
          (lista.length === 0 ? (
            <Vacio icono="📌" titulo="Tu lista está vacía">Tocá “+ Quiero ver” en cualquier ficha para guardarla acá.</Vacio>
          ) : (
            <div className="grilla">
              {lista.map((q) => (
                <Poster key={q.id} titulo={{ id: q.tmdbId, tipo: q.tipo, titulo: q.titulo, poster: q.poster, anio: q.anio }} />
              ))}
            </div>
          ))}
      </div>
    </div>
  )
}
