import { useId, useState } from 'react'

const VALORES = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]

function Estrella({ relleno }) {
  // relleno: 0, 0.5 o 1
  const id = useId()
  return (
    <svg viewBox="0 0 24 24" className="estrella" aria-hidden="true">
      <defs>
        <linearGradient id={id}>
          <stop offset={relleno * 100 + '%'} stopColor="currentColor" />
          <stop offset={relleno * 100 + '%'} stopColor="var(--estrella-vacia)" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"
      />
    </svg>
  )
}

// Solo lectura
export function EstrellasFijas({ valor, tamano = 16 }) {
  return (
    <span className="estrellas" style={{ '--tam': tamano + 'px' }} aria-label={`${valor} de 5 estrellas`} role="img">
      {[1, 2, 3, 4, 5].map((n) => (
        <Estrella key={n} relleno={valor >= n ? 1 : valor >= n - 0.5 ? 0.5 : 0} />
      ))}
    </span>
  )
}

// Editable, con medias estrellas: la mitad izquierda de cada estrella vale ½.
// Con teclado se usa como un grupo de radios (flechas izquierda/derecha).
export default function Estrellas({ valor, onChange, tamano = 36 }) {
  const [hover, setHover] = useState(null)
  const mostrado = hover ?? valor ?? 0

  function teclado(e) {
    const i = VALORES.indexOf(valor ?? 0)
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      onChange(VALORES[Math.min(i + 1, VALORES.length - 1)])
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      onChange(VALORES[Math.max(i - 1, 0)])
    }
  }

  return (
    <div
      className="estrellas estrellas--editable"
      style={{ '--tam': tamano + 'px' }}
      role="slider"
      tabIndex={0}
      aria-label="Puntaje"
      aria-valuemin={0.5}
      aria-valuemax={5}
      aria-valuenow={valor || 0}
      aria-valuetext={valor ? `${valor} estrellas` : 'Sin puntaje'}
      onKeyDown={teclado}
      onMouseLeave={() => setHover(null)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className="estrellas__celda">
          <Estrella relleno={mostrado >= n ? 1 : mostrado >= n - 0.5 ? 0.5 : 0} />
          <button
            type="button"
            tabIndex={-1}
            className="estrellas__mitad estrellas__mitad--izq"
            aria-label={`${n - 0.5} estrellas`}
            onMouseEnter={() => setHover(n - 0.5)}
            onClick={() => onChange(n - 0.5)}
          />
          <button
            type="button"
            tabIndex={-1}
            className="estrellas__mitad estrellas__mitad--der"
            aria-label={`${n} estrellas`}
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange(n)}
          />
        </span>
      ))}
    </div>
  )
}
