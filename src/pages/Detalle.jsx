import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { detalle, imagen } from '../lib/tmdb'
import { estiloColor } from '../lib/color'
import { bandera, nombreIdioma, nombrePais } from '../lib/paises'
import { duracion, TIPOS } from '../lib/formato'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { escucharResenasDeTitulo, idResena } from '../services/resenas'
import { escucharQuieroVer, agregarQuieroVer, quitarQuieroVer } from '../services/quieroVer'
import { Cargador, ErrorCarga, Vacio } from '../components/Estados'
import { EstrellasFijas } from '../components/Estrellas'
import Carrusel from '../components/Carrusel'
import Ticket from '../components/Ticket'
import ResenaEditor from '../components/ResenaEditor'

export default function Detalle() {
  const { tipo, id } = useParams()
  const valido = (tipo === 'movie' || tipo === 'tv') && /^\d+$/.test(id)
  const { usuario, entrar } = useAuth()
  const { avisar, avisarError } = useToast()
  const { datos: t, cargando, error } = useAsync(
    () => (valido ? detalle(tipo, id) : Promise.reject(new Error('Esa dirección no corresponde a ninguna película o serie.'))),
    [tipo, id],
  )
  const [resenas, setResenas] = useState({ clave: null, lista: [] })
  const [quieroVer, setQuieroVer] = useState([])
  const [editor, setEditor] = useState(false)
  const clave = `${tipo}_${id}`

  useEffect(() => {
    if (!valido) return
    return escucharResenasDeTitulo(
      tipo,
      id,
      (lista) => setResenas({ clave, lista }),
      (e) => avisarError('No se pudieron cargar las reseñas', e),
    )
  }, [tipo, id, clave, valido, avisarError])

  useEffect(() => {
    if (!usuario) return
    return escucharQuieroVer(usuario.uid, setQuieroVer, () => {})
  }, [usuario])

  const lista = useMemo(() => (resenas.clave === clave ? resenas.lista : []), [resenas, clave])
  const mia = usuario ? lista.find((r) => r.id === idResena(usuario.uid, tipo, Number(id))) : null
  const enLista = quieroVer.some((q) => q.id === clave)

  const comunidad = useMemo(() => {
    if (!lista.length) return null
    const promedio = lista.reduce((s, r) => s + r.puntaje, 0) / lista.length
    const barras = [1, 2, 3, 4, 5].map((n) => lista.filter((r) => Math.ceil(r.puntaje) === n).length)
    return { promedio, barras, max: Math.max(...barras), gustos: lista.filter((r) => r.meGusta).length }
  }, [lista])

  async function alternarLista() {
    if (!usuario) return entrar().catch(() => {})
    try {
      if (enLista) {
        await quitarQuieroVer(usuario.uid, tipo, t.id)
        avisar('Quitada de “Quiero ver”.')
      } else {
        await agregarQuieroVer(usuario.uid, t)
        avisar('Agregada a “Quiero ver”.')
      }
    } catch (e) {
      avisarError('No se pudo actualizar tu lista', e)
    }
  }

  if (cargando) return <Cargador texto="Preparando la función" />
  if (error) return <div className="contenedor pagina"><ErrorCarga error={error} /></div>

  const otros = lista.filter((r) => r.id !== mia?.id)

  return (
    <article className="ficha" style={estiloColor(t.id)}>
      <section className="ficha__hero">
        {t.fondo && (
          <img className="ficha__fondo" src={imagen(t.fondo, 'w1280')} alt="" aria-hidden="true" />
        )}
        <div className="contenedor ficha__hero-interior">
          {t.poster ? (
            <img
              key={t.id}
              className="ficha__poster"
              src={imagen(t.poster, 'w500')}
              alt={`Póster de ${t.titulo}`}
              style={{ viewTransitionName: 'poster-activo' }}
              data-vt-activo=""
            />
          ) : (
            <div className="ficha__poster ficha__poster--vacio">{t.titulo}</div>
          )}

          <div className="ficha__info">
            <p className="sobretitulo">
              {TIPOS[t.tipo]} {t.anio && `· ${t.anio}`}
            </p>
            <h1 className="ficha__titulo">{t.titulo}</h1>
            {t.tituloOriginal && t.tituloOriginal !== t.titulo && (
              <p className="ficha__original">
                “{t.tituloOriginal}” · en {nombreIdioma(t.idioma)}
              </p>
            )}

            <ul className="ficha__datos">
              {t.paises.slice(0, 3).map((p) => (
                <li key={p}>
                  <span aria-hidden="true">{bandera(p)}</span> {nombrePais(p)}
                </li>
              ))}
              {t.duracion && <li>{duracion(t.duracion)}{t.tipo === 'tv' && ' por episodio'}</li>}
              {t.temporadas && <li>{t.temporadas} temporada{t.temporadas > 1 && 's'}</li>}
              {t.generos.slice(0, 3).map((g) => <li key={g}>{g}</li>)}
            </ul>

            {t.direccion.length > 0 && (
              <p className="ficha__direccion">
                {t.tipo === 'movie' ? 'Dirigida por' : 'Creada por'} <strong>{t.direccion.slice(0, 2).join(' y ')}</strong>
              </p>
            )}

            <div className="ficha__acciones">
              {usuario ? (
                <button className="boton boton--grande boton--claro" onClick={() => setEditor(true)}>
                  {mia ? '✎ Editar mi reseña' : '★ Reseñar'}
                </button>
              ) : (
                <button className="boton boton--grande boton--claro" onClick={() => entrar().catch(() => {})}>
                  Entrá para reseñar
                </button>
              )}
              <button
                className={`boton boton--grande boton--contorno ${enLista ? 'activo' : ''}`}
                onClick={alternarLista}
                aria-pressed={enLista}
                disabled={!!mia}
                title={mia ? 'Ya la reseñaste' : undefined}
              >
                {mia ? '✓ Vista' : enLista ? '✓ En “Quiero ver”' : '+ Quiero ver'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="contenedor ficha__cuerpo">
        <section className="ficha__sinopsis">
          {t.lema && <p className="ficha__lema">{t.lema}</p>}
          <p>{t.resumen || 'Todavía no hay sinopsis en español para este título.'}</p>
        </section>

        <aside className="ficha__comunidad" aria-label="Puntajes">
          <div className="marcador">
            <span className="marcador__etiqueta">Pochoclo</span>
            {comunidad ? (
              <>
                <span className="marcador__valor">{comunidad.promedio.toFixed(1)}</span>
                <EstrellasFijas valor={Math.round(comunidad.promedio * 2) / 2} tamano={14} />
                <span className="marcador__nota">
                  {lista.length} reseña{lista.length > 1 && 's'} · {comunidad.gustos} ♥
                </span>
                <div className="histograma" aria-hidden="true">
                  {comunidad.barras.map((b, i) => (
                    <span key={i} style={{ height: `${comunidad.max ? (b / comunidad.max) * 100 : 0}%` }} />
                  ))}
                </div>
              </>
            ) : (
              <span className="marcador__nota">Sin reseñas todavía</span>
            )}
          </div>
          <div className="marcador marcador--tmdb">
            <span className="marcador__etiqueta">TMDB</span>
            <span className="marcador__valor">{(t.puntajeTmdb / 2).toFixed(1)}</span>
            <span className="marcador__nota">{t.votos.toLocaleString('es-AR')} votos</span>
          </div>
        </aside>
      </div>

      {t.reparto.length > 0 && (
        <section className="contenedor reparto">
          <h2 className="titulo-seccion">Reparto</h2>
          <ul className="reparto__lista">
            {t.reparto.map((p) => (
              <li key={p.id} className="persona">
                {p.foto ? (
                  <img src={imagen(p.foto, 'w185')} alt="" loading="lazy" />
                ) : (
                  <span className="persona__vacia" aria-hidden="true">🎭</span>
                )}
                <strong>{p.nombre}</strong>
                <span>{p.personaje}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="contenedor resenas">
        <h2 className="titulo-seccion">
          Reseñas <span className="contador">{lista.length}</span>
        </h2>
        {mia && <Ticket resena={mia} propia onEditar={() => setEditor(true)} />}
        {otros.map((r) => <Ticket key={r.id} resena={r} />)}
        {lista.length === 0 && (
          <Vacio icono="🎟️" titulo="Nadie la reseñó todavía">
            {usuario ? (
              <button className="boton" onClick={() => setEditor(true)}>Sé la primera persona</button>
            ) : (
              <Link to="#" onClick={(e) => { e.preventDefault(); entrar().catch(() => {}) }}>Entrá con Google y estrenala.</Link>
            )}
          </Vacio>
        )}
      </section>

      {t.recomendadas.length > 0 && (
        <div className="contenedor">
          <Carrusel titulo="Si te gustó, mirá…" items={t.recomendadas} />
        </div>
      )}

      {usuario && (
        <ResenaEditor
          abierto={editor}
          titulo={t}
          existente={mia}
          enQuieroVer={enLista}
          onCerrar={() => setEditor(false)}
        />
      )}
    </article>
  )
}
