// Estados de carga, vacío y error con guiños de cine.

// "Cola de proyección": la cuenta regresiva que aparecía al principio de los rollos de película.
export function Cargador({ texto = 'Cargando' }) {
  return (
    <div className="cargador" role="status" aria-live="polite">
      <div className="cargador__leader" aria-hidden="true">
        <span className="cargador__barrido" />
        <span className="cargador__num">
          <i>3</i>
          <i>2</i>
          <i>1</i>
        </span>
      </div>
      <p>{texto}…</p>
    </div>
  )
}

export function SkeletonFila({ cantidad = 7 }) {
  return (
    <div className="carrusel__pista" aria-hidden="true">
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className="poster">
          <div className="poster__marco skeleton" />
          <span className="skeleton skeleton--linea" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonGrilla({ cantidad = 12 }) {
  return (
    <div className="grilla" aria-hidden="true">
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className="poster">
          <div className="poster__marco skeleton" />
          <span className="skeleton skeleton--linea" />
        </div>
      ))}
    </div>
  )
}

export function Vacio({ icono = '🎞️', titulo, children }) {
  return (
    <div className="vacio">
      <span className="vacio__icono" aria-hidden="true">{icono}</span>
      <p className="vacio__titulo">{titulo}</p>
      {children && <div className="vacio__texto">{children}</div>}
    </div>
  )
}

export function ErrorCarga({ error, onReintentar }) {
  return (
    <div className="vacio vacio--error">
      <span className="vacio__icono" aria-hidden="true">📼</span>
      <p className="vacio__titulo">Se cortó la proyección</p>
      <p className="vacio__texto">{error?.message || 'Ocurrió un error inesperado.'}</p>
      {onReintentar && (
        <button className="boton" onClick={onReintentar}>Reintentar</button>
      )}
    </div>
  )
}
