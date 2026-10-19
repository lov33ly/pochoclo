// Pedazo de cinta de embalar plateada (100% CSS), para "pegar" pósters y fotos.
export default function Cinta({ arriba, abajo, izquierda, derecha, giro = -8, ancho = 110 }) {
  return (
    <span
      className="cinta"
      aria-hidden="true"
      style={{ top: arriba, bottom: abajo, left: izquierda, right: derecha, width: ancho, '--giro': `${giro}deg` }}
    />
  )
}
