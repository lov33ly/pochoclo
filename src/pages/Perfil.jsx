import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { escucharResenasDeUsuario } from '../services/resenas'
import { escucharPerfil, actualizarBio } from '../services/usuarios'
import { escucharQuieroVer } from '../services/quieroVer'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { mes } from '../lib/formato'
import Avatar from '../components/Avatar'
import Poster from '../components/Poster'
import Resena from '../components/Resena'
import TextoEscalado from '../components/TextoEscalado'
import Pasaporte from '../components/Pasaporte'
import Estadisticas from '../components/Estadisticas'
import { Cargador, ErrorCarga, Vacio } from '../components/Estados'

const MAX_BIO = 160

// Bio editable solo en el perfil propio.
function Bio({ uid, bio, propio }) {
  const { avisar, avisarError } = useToast()
  const [editando, setEditando] = useState(false)
  const [texto, setTexto] = useState(bio)
  const [guardando, setGuardando] = useState(false)

  async function guardar(e) {
    e.preventDefault()
    if (texto.length > MAX_BIO) return
    setGuardando(true)
    try {
      await actualizarBio(uid, texto.trim())
      avisar('Bio actualizada.')
      setEditando(false)
    } catch (err) {
      avisarError('No se pudo guardar la bio', err)
    } finally {
      setGuardando(false)
    }
  }

  if (editando)
    return (
      <form className="bio bio--editando" onSubmit={guardar}>
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={MAX_BIO}
          placeholder="Ej.: fan del cine coreano y de las comedias de los 90"
          aria-label="Tu bio"
          autoFocus
        />
        <span className="bio__contador">{texto.length}/{MAX_BIO}</span>
        <button className="boton boton--chico" disabled={guardando}>{guardando ? '…' : 'Guardar'}</button>
        <button type="button" className="enlace" onClick={() => { setTexto(bio); setEditando(false) }}>Cancelar</button>
      </form>
    )

  return (
    <p className="bio">
      {bio || (propio ? 'Todavía no escribiste tu bio.' : '')}
      {propio && (
        <button className="enlace bio__editar" onClick={() => setEditando(true)}>
          {bio ? 'Editar' : 'Escribir bio'}
        </button>
      )}
    </p>
  )
}

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
      paises: new Set(mias.flatMap((r) => r.paises || [])).size,
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
        <Vacio titulo="Este perfil no existe" />
      </div>
    )

  const PESTANAS = [
    ['diario', 'Diario', mias.length],
    ['grilla', 'Pósters', mias.length],
    ['pasaporte', 'Pasaporte', cifras.paises],
    ['stats', 'Estadísticas', null],
    ...(propio ? [['quiero', 'Quiero ver', lista.length]] : []),
  ]

  return (
    <div className="perfil">
      <header className="perfil__cabecera">
        <div className="contenedor">
          <p className="rotulo rotulo--doble">
            <span>{propio ? 'Tu perfil' : 'Perfil'}</span>
            <span>{mias.length} reseñas</span>
          </p>
          <TextoEscalado como="h1" proporcion={Math.min(0.3, Math.max(0.12, 2.6 / datos.nombre.length))} maximo={280}>
            {datos.nombre.toUpperCase()}
          </TextoEscalado>
          <div className="perfil__fila">
            <Avatar nombre={datos.nombre} foto={datos.foto} tamano={64} />
            <Bio key={datos.bio} uid={uid} bio={datos.bio || ''} propio={propio} />
          </div>
          <dl className="cifras">
            <div><dt>Películas</dt><dd>{cifras.pelis}</dd></div>
            <div><dt>Series</dt><dd>{cifras.series}</dd></div>
            <div><dt>Horas de cine</dt><dd>{cifras.horas}</dd></div>
            <div><dt>Países</dt><dd>{cifras.paises}</dd></div>
            <div><dt>Promedio</dt><dd>{String(cifras.promedio).replace('.', ',')}</dd></div>
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
              {etiqueta} {n != null && <span className="contador">{n}</span>}
            </button>
          ))}
        </nav>

        {pestana === 'diario' &&
          (diario.length === 0 ? (
            <Vacio titulo={propio ? 'Tu diario está vacío' : 'Todavía no reseñó nada'}>
              {propio && 'Buscá la última película que viste y dejale tu reseña.'}
            </Vacio>
          ) : (
            diario.map(([k, rs]) => (
              <section key={k} className="diario__mes">
                <h2 className="diario__titulo">
                  <span>{mes(k + '-01')}</span>
                  <span>{rs.length}</span>
                </h2>
                {rs.map((r) => <Resena key={r.id} resena={{ ...r, autorNombre: null }} variante="autor" />)}
              </section>
            ))
          ))}

        {pestana === 'grilla' &&
          (mias.length === 0 ? (
            <Vacio titulo="Sin pósters todavía" />
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

        {pestana === 'pasaporte' && <Pasaporte resenas={mias} propio={propio} />}
        {pestana === 'stats' && <Estadisticas resenas={mias} />}

        {pestana === 'quiero' &&
          propio &&
          (lista.length === 0 ? (
            <Vacio titulo="Tu lista está vacía">Tocá “+ Quiero ver” en cualquier ficha para guardarla acá.</Vacio>
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
