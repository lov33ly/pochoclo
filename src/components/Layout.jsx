import { Link, Outlet } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { configCompleta } from '../firebase'

export default function Layout() {
  const { usuario, entrar, salir } = useAuth()

  return (
    <>
      <header className="nav">
        <Link to="/" className="nav__logo">Pochoclo</Link>
        {usuario ? (
          <span>
            <Link to={`/u/${usuario.uid}`}>{usuario.displayName}</Link>{' '}
            <button onClick={salir}>Salir</button>
          </span>
        ) : (
          <button onClick={entrar} disabled={!configCompleta}>Entrar con Google</button>
        )}
      </header>
      {!configCompleta && <p className="error">Faltan las variables de entorno de Firebase.</p>}
      <main className="contenido">
        <Outlet />
      </main>
    </>
  )
}
