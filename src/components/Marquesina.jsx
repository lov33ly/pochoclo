// Cinta de texto que corre sin fin, como la marquesina de un cine.
export default function Marquesina({ items, color = 'rojo', invertida = false }) {
  const linea = items.filter(Boolean)
  if (!linea.length) return null
  // El contenido se duplica para que el desplazamiento no tenga saltos.
  const bloque = (
    <span className="marquesina__bloque">
      {linea.map((t, i) => (
        <span key={i} className="marquesina__item">
          {t}
          <span className="marquesina__separador" aria-hidden="true">✶</span>
        </span>
      ))}
    </span>
  )
  return (
    <div className={`marquesina marquesina--${color} ${invertida ? 'marquesina--invertida' : ''}`} aria-hidden="true">
      <div className="marquesina__pista">
        {bloque}
        {bloque}
      </div>
    </div>
  )
}
