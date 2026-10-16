import { useRef } from 'react'
import Poster from './Poster'
import { SkeletonFila } from './Estados'

// Fila horizontal de pósters con scroll-snap y flechas en escritorio.
export default function Carrusel({ titulo, bajada, items, cargando, error, mostrarTipo, accion }) {
  const pista = useRef(null)
  const mover = (dir) => pista.current?.scrollBy({ left: dir * pista.current.clientWidth * 0.8, behavior: 'smooth' })

  return (
    <section className="carrusel">
      <header className="carrusel__cabecera">
        <div>
          <h2 className="titulo-seccion">{titulo}</h2>
          {bajada && <p className="carrusel__bajada">{bajada}</p>}
        </div>
        <div className="carrusel__controles">
          {accion}
          <button className="flecha" onClick={() => mover(-1)} aria-label="Anterior">←</button>
          <button className="flecha" onClick={() => mover(1)} aria-label="Siguiente">→</button>
        </div>
      </header>
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
    </section>
  )
}
