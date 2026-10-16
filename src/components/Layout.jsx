import { useState } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration, useNavigate, useNavigation } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { configCompleta } from '../firebase'
import Logo from './Logo'
import Avatar from './Avatar'
import Ruleta from './Ruleta'

const SECCIONES = [
  { to: '/', etiqueta: 'Inicio', icono: '🏠', end: true },
  { to: '/buscar', etiqueta: 'Buscar', icono: '🔎' },
  { to: '/mundo', etiqueta: 'Mundo', icono: '🌎' },
]

export default function Layout() {
  const { usuario, listo, entrar, salir } = useAuth()
  const navigate = useNavigate()
  const navegando = useNavigation().state === 'loading'
  const [q, setQ] = useState('')
  const [menu, setMenu] = useState(false)
  const [ruleta, setRuleta] = useState(false)

  function buscar(e) {
    e.preventDefault()
    if (q.trim()) navigate(`/buscar?q=${encodeURIComponent(q.trim())}`, { viewTransition: true })
  }

  return (
    <div className="app">
      <a href="#contenido" className="saltar">Saltar al contenido</a>
      {navegando && <div className="barra-carga" aria-hidden="true" />}

      <header className="nav">
        <Link to="/" viewTransition className="nav__marca" aria-label="Pochoclo, inicio">
          <Logo />
          <span>pochoclo</span>
        </Link>

        <nav className="nav__links" aria-label="Principal">
          {SECCIONES.map((s) => (
            <NavLink key={s.to} to={s.to} end={s.end} viewTransition className="nav__link">
              {s.etiqueta}
            </NavLink>
          ))}
          <button className="nav__link nav__ruleta" onClick={() => setRuleta(true)}>
            🎰 Ruleta
          </button>
        </nav>

        <form className="nav__buscar" onSubmit={buscar} role="search">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar entre un millón de títulos"
            aria-label="Buscar películas y series"
          />
        </form>

        <div className="nav__usuario">
          {!listo ? null : usuario ? (
            <div className="menu">
              <button className="menu__boton" onClick={() => setMenu((m) => !m)} aria-expanded={menu}>
                <Avatar nombre={usuario.displayName || '?'} foto={usuario.photoURL} tamano={34} />
              </button>
              {menu && (
                <div className="menu__lista" onClick={() => setMenu(false)}>
                  <Link to={`/u/${usuario.uid}`} viewTransition>Mi perfil</Link>
                  <button onClick={salir}>Cerrar sesión</button>
                </div>
              )}
            </div>
          ) : (
            <button className="boton boton--chico" onClick={() => entrar().catch(() => {})} disabled={!configCompleta}>
              Entrar con Google
            </button>
          )}
        </div>
      </header>

      {!configCompleta && (
        <p className="aviso aviso--error contenedor">
          Faltan las variables de entorno de Firebase: copiá <code>.env.example</code> como <code>.env</code> y completalo.
        </p>
      )}

      <main id="contenido" className="principal">
        <Outlet context={{ abrirRuleta: () => setRuleta(true) }} />
      </main>

      <footer className="pie">
        <div className="contenedor pie__interior">
          <p className="pie__marca">
            <Logo tamano={28} /> pochoclo
          </p>
          <p>Reseñas de cine y series de todo el mundo. TP2 · Desarrollo Frontend II.</p>
          <p className="pie__tmdb">
            Datos e imágenes de{' '}
            <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">TMDB</a>. Este producto usa la API de
            TMDB pero no está avalado ni certificado por TMDB.
          </p>
        </div>
      </footer>

      {/* Barra inferior estilo app en el celular */}
      <nav className="tabbar" aria-label="Navegación móvil">
        {SECCIONES.map((s) => (
          <NavLink key={s.to} to={s.to} end={s.end} viewTransition className="tabbar__item">
            <span aria-hidden="true">{s.icono}</span>
            {s.etiqueta}
          </NavLink>
        ))}
        <button className="tabbar__item" onClick={() => setRuleta(true)}>
          <span aria-hidden="true">🎰</span>
          Ruleta
        </button>
        {usuario ? (
          <NavLink to={`/u/${usuario.uid}`} viewTransition className="tabbar__item">
            <Avatar nombre={usuario.displayName || '?'} foto={usuario.photoURL} tamano={22} />
            Perfil
          </NavLink>
        ) : (
          <button className="tabbar__item" onClick={() => entrar().catch(() => {})} disabled={!configCompleta}>
            <span aria-hidden="true">👤</span>
            Entrar
          </button>
        )}
      </nav>

      <Ruleta abierto={ruleta} onCerrar={() => setRuleta(false)} />
      <ScrollRestoration />
    </div>
  )
}
