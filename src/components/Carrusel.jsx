import { useRef } from 'react'
import Poster from './Poster'
import Seccion from './Seccion'
import { SkeletonFila } from './Estados'

// Fila horizontal de pósters numerados, con scroll-snap y flechas en escritorio.
export default function Carrusel({ titulo, bajada, items, cargando, error, mostrarTipo }) {
  const pista = useRef(null)
  const mover = (dir) => pista.current?.scrollBy({ left: dir * pista.current.clientWidth * 0.8, behavior: 'smooth' })

  return (
    <Seccion
      titulo={titulo}
      className="carrusel"
      extra={
        <div className="carrusel__controles">
          {bajada && <span className="carrusel__bajada">{bajada}</span>}
          <button className="flecha" onClick={() => mover(-1)} aria-label="Anterior">←</button>
          <button className="flecha" onClick={() => mover(1)} aria-label="Siguiente">→</button>
        </div>
      }
    >
      {error ? (
        <p className="aviso aviso--error">No se pudo cargar esta sección: {error.message}</p>
      ) : cargando ? (
        <SkeletonFila />
      ) : (
        <div className="carrusel__pista" ref={pista}>
          {items.map((t, i) => (
            <Poster key={t.tipo + t.id} titulo={t} mostrarTipo={mostrarTipo} prioridad={i < 4} />
          ))}
        </div>
      )}
    </Seccion>
  )
}
