import { Link } from 'react-router'
import { Vacio } from '../components/Estados'

export default function NoEncontrado() {
  return (
    <div className="contenedor pagina">
      <Vacio icono="🎞️" titulo="Esta escena fue cortada en la edición">
        <p>La página que buscás no existe.</p>
        <Link to="/" viewTransition className="boton">Volver al inicio</Link>
      </Vacio>
    </div>
  )
}
