import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { detalle, imagen } from '../lib/tmdb'
import { nombreIdioma, nombrePais } from '../lib/paises'
import { TIPOS, timecode } from '../lib/formato'
import { useAsync } from '../hooks/useAsync'
import { usePaleta } from '../hooks/usePaleta'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { escucharResenasDeTitulo, idResena } from '../services/resenas'
import { escucharQuieroVer, agregarQuieroVer, quitarQuieroVer } from '../services/quieroVer'
import { Cargador, ErrorCarga } from '../components/Estados'
import { EstrellasFijas } from '../components/Estrellas'
import Seccion from '../components/Seccion'
import Carrusel from '../components/Carrusel'
import Resena from '../components/Resena'
import ResenaForm from '../components/ResenaForm'
import PortadaColor from '../components/PortadaColor'
import { resenasTmdb, resenasEjemplo } from '../lib/resenasExtra'

// Cuanto más corto el título, más alto el titular (siempre ocupa todo el ancho).
const proporcionTitulo = (t) => Math.min(0.34, Math.max(0.13, 3.4 / t.length))

export default function Detalle() {
  const { tipo, id } = useParams()
  const valido = (tipo === 'movie' || tipo === 'tv') && /^\d+$/.test(id)
  const { usuario, entrar } = useAuth()
  const { avisar, avisarError } = useToast()
  const { datos: t, cargando, error } = useAsync(
    () => (valido ? detalle(tipo, id) : Promise.reject(new Error('Esa dirección no corresponde a ninguna película o serie.'))),
    [tipo, id],
  )
  const [resenas, setResenas] = useState({ clave: null, lista: [], error: null })
  const [quieroVer, setQuieroVer] = useState([])
  const [editando, setEditando] = useState(false)
  const clave = `${tipo}_${id}`
  const externas = useAsync(() => (valido ? resenasTmdb(tipo, id) : Promise.resolve([])), [tipo, id])
  const paleta = usePaleta(t?.fondo ? imagen(t.fondo, 'w300') : t?.poster ? imagen(t.poster, 'w185') : null)

  useEffect(() => {
    if (!valido) return
    return escucharResenasDeTitulo(
      tipo,
      id,
      (lista) => setResenas({ clave, lista, error: null }),
      (error) => setResenas({ clave, lista: [], error }),
    )
  }, [tipo, id, clave, valido])

  useEffect(() => {
    if (!usuario) return
    return escucharQuieroVer(usuario.uid, setQuieroVer, () => {})
  }, [usuario])

  const lista = useMemo(() => (resenas.clave === clave ? resenas.lista : []), [resenas, clave])
  const mia = usuario ? lista.find((r) => r.id === idResena(usuario.uid, tipo, Number(id))) : null
  const otras = lista.filter((r) => r.id !== mia?.id)
  const deTmdb = useMemo(() => externas.datos || [], [externas.datos])

  // Si entre Pochoclo y TMDB hay menos de 3 reseñas, se completan con reseñas de ejemplo.
  const ejemplos = useMemo(() => {
    if (!t || externas.cargando) return []
    const faltan = 3 - lista.length - deTmdb.length
    return faltan > 0 ? resenasEjemplo(t, faltan) : []
  }, [t, externas.cargando, lista.length, deTmdb.length])
  const todas = useMemo(() => [...lista, ...deTmdb, ...ejemplos], [lista, deTmdb, ejemplos])
  const enLista = quieroVer.some((q) => q.id === clave)

  const comunidad = useMemo(() => {
    const conNota = todas.filter((r) => r.puntaje)
    if (!conNota.length) return null
    const promedio = conNota.reduce((s, r) => s + r.puntaje, 0) / conNota.length
    const barras = [1, 2, 3, 4, 5].map((n) => conNota.filter((r) => Math.ceil(r.puntaje) === n).length)
    return { promedio, barras, max: Math.max(...barras), cantidad: conNota.length, gustos: todas.filter((r) => r.meGusta).length }
  }, [todas])

  async function alternarLista() {
    if (!usuario) return entrar()
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


  return (
    <article className="ficha">
      {/* ---------- Portada: afiche azul con el fotograma en duotono ---------- */}
      <PortadaColor
        color="azul"
        fondo={t.fondo ? imagen(t.fondo, 'w1280') : null}
        rotulo={`${TIPOS[t.tipo]} · ${t.anio || 'S/F'}`}
        rotuloDerecha={t.paises.length ? nombrePais(t.paises[0]) : null}
        titulo={t.titulo}
        proporcion={proporcionTitulo(t.titulo)}
        maximo={360}
        vertical={t.tituloOriginal}
      >
        <div className="ficha__cabecera">
          <figure className="ficha__poster-fig">
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
          </figure>
          <div className="ficha__datos-portada">
            {t.tituloOriginal && t.tituloOriginal !== t.titulo && (
              <p className="ficha__original">“{t.tituloOriginal}”</p>
            )}
            {t.direccion.length > 0 && (
              <p className="ficha__direccion">
                {t.tipo === 'movie' ? 'Dirigida por' : 'Creada por'} <strong>{t.direccion.slice(0, 2).join(' y ')}</strong>
              </p>
            )}
            <div className="ficha__acciones">
              <a href="#resenas" className="boton boton--rojo">{mia ? 'Ver mi reseña' : 'Reseñar'} ↓</a>
              <button
                className={`boton boton--contorno ${enLista ? 'activo' : ''}`}
                onClick={alternarLista}
                aria-pressed={enLista}
                disabled={!!mia}
                title={mia ? 'Ya la reseñaste' : undefined}
              >
                {mia ? '✓ Vista' : enLista ? '✓ En Quiero ver' : '+ Quiero ver'}
              </button>
            </div>
          </div>
        </div>
      </PortadaColor>

      <div className="contenedor ficha__columnas">
        <Seccion titulo="Sinopsis">
          {t.lema && <p className="ficha__lema">“{t.lema}”</p>}
          <p className="ficha__resumen">{t.resumen || 'Todavía no hay sinopsis en español para este título.'}</p>
        </Seccion>

        <Seccion titulo="Ficha técnica">
          <dl className="tabla">
            {t.direccion.length > 0 && (
              <div><dt>{t.tipo === 'movie' ? 'Dirección' : 'Creación'}</dt><dd>{t.direccion.slice(0, 3).join(', ')}</dd></div>
            )}
            <div><dt>País</dt><dd>{t.paises.length ? t.paises.slice(0, 3).map(nombrePais).join(', ') : '—'}</dd></div>
            <div><dt>Idioma original</dt><dd>{nombreIdioma(t.idioma)}</dd></div>
            <div><dt>Estreno</dt><dd>{t.anio || '—'}</dd></div>
            <div>
              <dt>{t.tipo === 'movie' ? 'Duración' : 'Episodio'}</dt>
              <dd className="mono">{timecode(t.duracion)}</dd>
            </div>
            {t.temporadas && <div><dt>Temporadas</dt><dd>{t.temporadas} · {t.episodios} episodios</dd></div>}
            <div><dt>Género</dt><dd>{t.generos.join(', ') || '—'}</dd></div>
            <div><dt>Puntaje TMDB</dt><dd className="mono">{(t.puntajeTmdb / 2).toFixed(1)} / 5 · {t.votos.toLocaleString('es-AR')} votos</dd></div>
          </dl>
        </Seccion>
      </div>

      {paleta?.length > 0 && (
        <div className="contenedor">
          <Seccion titulo="Colores de la película">
            <ul className="paleta">
              {paleta.map((c) => (
                <li key={c.hex} style={{ '--c': c.hex, flexGrow: Math.max(c.peso * 10, 1) }}>
                  <span className="paleta__muestra" />
                  <span className="paleta__dato">{c.hex}</span>
                  <span className="paleta__dato">RGB {c.rgb}</span>
                </li>
              ))}
            </ul>
          </Seccion>
        </div>
      )}

      {/* ---------- Reseñas ---------- */}
      <div className="contenedor" id="resenas">
        <Seccion
          titulo="Reseñas"
          extra={<span>{todas.length} {todas.length === 1 ? 'reseña' : 'reseñas'}</span>}
        >
          <div className="resenas">
            <aside className="resenas__lateral">
              <div className="marcador">
                <p className="marcador__etiqueta">Promedio de las reseñas</p>
                {comunidad ? (
                  <>
                    <p className="marcador__valor">{comunidad.promedio.toFixed(1).replace('.', ',')}</p>
                    <EstrellasFijas valor={Math.round(comunidad.promedio * 2) / 2} tamano={14} />
                    <div className="histograma" aria-hidden="true">
                      {comunidad.barras.map((b, i) => (
                        <span key={i} style={{ height: `${comunidad.max ? (b / comunidad.max) * 100 : 0}%` }} />
                      ))}
                    </div>
                    <p className="marcador__nota">
                      {comunidad.cantidad} puntajes · {comunidad.gustos} ♥
                    </p>
                  </>
                ) : (
                  <p className="marcador__vacio">Todavía no hay puntajes.</p>
                )}
              </div>

              {!usuario ? (
                <div className="invitacion">
                  <p>¿La viste? Entrá con tu cuenta de Google para dejar tu reseña.</p>
                  <button className="boton boton--negro" onClick={() => entrar()}>
                    Entrar con Google
                  </button>
                </div>
              ) : !mia || editando ? (
                <ResenaForm
                  key={mia?.id || 'nueva'}
                  titulo={t}
                  existente={mia}
                  enQuieroVer={enLista}
                  onListo={() => setEditando(false)}
                  onCancelar={mia ? () => setEditando(false) : undefined}
                />
              ) : null}
            </aside>

            <div className="resenas__lista">
              {resenas.error && resenas.clave === clave && (
                <p className="aviso aviso--error">No se pudieron cargar las reseñas: {resenas.error.message}</p>
              )}
              {mia && !editando && <Resena resena={mia} propia onEditar={() => setEditando(true)} />}
              {otras.map((r) => <Resena key={r.id} resena={r} />)}
              {deTmdb.map((r) => <Resena key={r.id} resena={r} />)}
              {ejemplos.map((r) => <Resena key={r.id} resena={r} />)}
            </div>
          </div>
        </Seccion>
      </div>

      {t.reparto.length > 0 && (
        <div className="contenedor">
          <Seccion titulo="Reparto">
            <ul className="reparto">
              {t.reparto.map((p) => (
                <li key={p.id} className="persona">
                  {p.foto ? <img src={imagen(p.foto, 'w185')} alt="" loading="lazy" /> : <span className="persona__vacia" />}
                  <strong>{p.nombre}</strong>
                  <span>{p.personaje}</span>
                </li>
              ))}
            </ul>
          </Seccion>
        </div>
      )}

      {t.recomendadas.length > 0 && (
        <div className="contenedor">
          <Carrusel titulo="Si te gustó" items={t.recomendadas} />
        </div>
      )}
    </article>
  )
}
