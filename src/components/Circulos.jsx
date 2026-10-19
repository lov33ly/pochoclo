// Círculos superpuestos que se mezclan entre sí (multiplicar o trama),
// como en los afiches de la escuela suiza. La ubicación sale de una semilla,
// así cada página tiene siempre la misma composición.
function generador(semilla) {
  let s = (Math.abs(Math.floor(semilla)) % 2147483646) + 1
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

export default function Circulos({ colores, semilla = 1, cantidad = 4, modo = 'multiply', className = '' }) {
  const azar = generador(semilla)
  const circulos = Array.from({ length: cantidad }, (_, i) => {
    // Repartidos en una grilla de 2 columnas, con un leve desorden.
    const col = i % 2
    const fila = Math.floor(i / 2)
    return {
      color: colores[i % colores.length],
      tamano: 34 + azar() * 16, // % del ancho del contenedor
      x: col * 46 + azar() * 12 - 4,
      y: fila * 42 + azar() * 16 - 8,
    }
  })

  return (
    <div className={`circulos ${className}`} aria-hidden="true" style={{ '--modo': modo }}>
      {circulos.map((c, i) => (
        <span
          key={i}
          className="circulos__item"
          style={{
            '--c': c.color,
            width: `${c.tamano}%`,
            left: `${c.x}%`,
            top: `${c.y}%`,
            animationDelay: `${i * 90}ms`,
          }}
        />
      ))}
    </div>
  )
}
