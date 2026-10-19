import { Link, useRouteError } from 'react-router'
import Logo from '../components/Logo'

// Pantalla de error general: se muestra si una página falla al renderizarse.
export default function ErrorRuta() {
  const error = useRouteError()
  return (
    <div className="contenedor pagina error-ruta">
      <Link to="/" className="nav__marca error-ruta__marca">
        <Logo /> <span>pochoclo</span>
      </Link>
      <div className="vacio vacio--error">
        <span className="vacio__numero" aria-hidden="true">!</span>
        <p className="vacio__titulo">Se cortó la proyección</p>
        <p className="vacio__texto">{error?.message || error?.statusText || 'Ocurrió un error inesperado.'}</p>
        <div className="chips">
          <button className="boton" onClick={() => window.location.reload()}>Recargar</button>
          <Link to="/" className="boton boton--primario">Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}
