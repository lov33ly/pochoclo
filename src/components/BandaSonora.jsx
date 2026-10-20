import { useEffect, useRef, useState } from 'react'
import { bandaSonora } from '../lib/itunes'
import { useAsync } from '../hooks/useAsync'
import Seccion from './Seccion'

const minutos = (ms) => {
  const s = Math.round(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// Disco de la película con fragmentos de 30 segundos para escuchar (API de iTunes).
export default function BandaSonora({ titulo }) {
  const { datos: disco, cargando } = useAsync(() => bandaSonora(titulo).catch(() => null), [titulo.id, titulo.tipo])
  const audio = useRef(null)
  const [sonando, setSonando] = useState(null)
  const [progreso, setProgreso] = useState(0)

  // Al salir de la ficha, se corta la música.
  useEffect(() => () => audio.current?.pause(), [])

  function reproducir(tema) {
    const a = audio.current
    if (sonando === tema.id) {
      a.pause()
      setSonando(null)
      return
    }
    a.src = tema.muestra
    a.play().then(() => setSonando(tema.id)).catch(() => setSonando(null))
  }

  if (cargando || !disco) return null

  return (
    <Seccion titulo="Banda sonora" extra={<span>Fragmentos de 30 s · iTunes</span>}>
      <div className="banda">
        <a className="banda__disco" href={disco.enlace} target="_blank" rel="noreferrer">
          {disco.tapa && <img src={disco.tapa} alt={`Tapa de ${disco.nombre}`} loading="lazy" />}
          <span className="banda__nombre">{disco.nombre}</span>
          <span className="banda__artista">{disco.artista}{disco.anio && ` · ${disco.anio}`}</span>
        </a>

        <ol className="banda__temas">
          {disco.temas.slice(0, 12).map((t, i) => {
            const activo = sonando === t.id
            return (
              <li key={t.id} className={activo ? 'activo' : ''}>
                <button
                  className="banda__tema"
                  onClick={() => reproducir(t)}
                  aria-pressed={activo}
                  aria-label={`${activo ? 'Pausar' : 'Escuchar'} ${t.nombre}`}
                >
                  <span className="banda__icono" aria-hidden="true">{activo ? '❚❚' : '▶'}</span>
                  <span className="banda__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="banda__titulo">
                    {t.nombre}
                    <em>{t.artista}</em>
                  </span>
                  <span className="banda__duracion">{minutos(t.duracion || 0)}</span>
                  {activo && <span className="banda__progreso" style={{ width: `${progreso * 100}%` }} />}
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      <audio
        ref={audio}
        onTimeUpdate={(e) => setProgreso(e.currentTarget.duration ? e.currentTarget.currentTime / e.currentTarget.duration : 0)}
        onEnded={() => {
          setSonando(null)
          setProgreso(0)
        }}
        preload="none"
      />
    </Seccion>
  )
}
