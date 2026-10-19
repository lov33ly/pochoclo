import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { escucharResenasDeUsuario } from '../services/resenas'
import { escucharPerfil } from '../services/usuarios'
import { escucharQuieroVer } from '../services/quieroVer'
import { useAuth } from '../context/AuthContext'
import { mes } from '../lib/formato'
import Avatar from '../components/Avatar'
import Poster from '../components/Poster'
import Resena from '../components/Resena'
import PortadaColor from '../components/PortadaColor'
import EditarPerfil from '../components/EditarPerfil'
import Pasaporte from '../components/Pasaporte'
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
  const [editando, setEditando] = useState(false)

  useEffect(() => escucharPerfil(uid, (datos) => setPerfil({ uid, datos }), setError), [uid])
  useEffect(() => escucharResenasDeUsuario(uid, (l) => setResenas({ uid, lista: l }), setError), [uid])
  useEffect(() => {
    if (!propio) return
    return escucharQuieroVer(uid, setLista, setError)
  }, [uid, propio])

  const datos = perfil.uid === uid ? perfil.datos : undefined
  const mias = useMemo(() => (resenas.uid === uid ? resenas.lista : []), [resenas, uid])

  const paises = useMemo(() => new Set(mias.flatMap((r) => r.paises || [])).size, [mias])

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
    ['pasaporte', 'Pasaporte', paises],
    ...(propio ? [['quiero', 'Quiero ver', lista.length]] : []),
  ]

  return (
    <div className="perfil">
      <PortadaColor
        color="negro"
        rotulo={propio ? 'Tu perfil' : 'Perfil'}
        rotuloDerecha={`${mias.length} ${mias.length === 1 ? 'reseña' : 'reseñas'}`}
        titulo={datos.nombre}
        proporcion={Math.min(0.3, Math.max(0.12, 2.6 / datos.nombre.length))}
        maximo={300}
        vertical="Diario de cine"
      >
        <div className="perfil__fila">
          <Avatar nombre={datos.nombre} foto={datos.foto} tamano={96} />
          <div className="perfil__texto">
            {datos.bio ? <p className="perfil__bio">{datos.bio}</p> : propio && <p className="perfil__bio perfil__bio--vacia">Todavía no escribiste tu bio.</p>}
            {propio && (
              <button className="boton boton--contorno boton--chico" onClick={() => setEditando(true)}>
                Editar perfil
              </button>
            )}
          </div>
        </div>
      </PortadaColor>

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
                {rs.map((r) => <Resena key={r.id} resena={{ ...r, autorNombre: null }} variante="autor" mostrarSpoiler={propio} />)}
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
      {propio && <EditarPerfil abierto={editando} perfil={datos} onCerrar={() => setEditando(false)} />}
    </div>
  )
}
