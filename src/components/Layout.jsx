import { useState } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration, useNavigate, useNavigation } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { configCompleta } from '../firebase'
import Logo from './Logo'
import Avatar from './Avatar'
import Ruleta from './Ruleta'
import TextoEscalado from './TextoEscalado'

const SECCIONES = [
  { to: '/', etiqueta: 'Inicio', end: true },
  { to: '/buscar', etiqueta: 'Buscar' },
  { to: '/mundo', etiqueta: 'Mundo' },
]

export default function Layout() {
  const { usuario, perfil, listo, entrar, salir } = useAuth()
  const nombre = perfil?.nombre || usuario?.displayName || '?'
  const foto = perfil ? perfil.foto : usuario?.photoURL
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
          <Logo tamano={22} />
          <span>Pochoclo</span>
        </Link>

        <nav className="nav__links" aria-label="Principal">
          {SECCIONES.map((s) => (
            <NavLink key={s.to} to={s.to} end={s.end} viewTransition className="nav__link">
              {s.etiqueta}
            </NavLink>
          ))}
          <button className="nav__link" onClick={() => setRuleta(true)}>
            Ruleta
          </button>
        </nav>

        <form className="nav__buscar" onSubmit={buscar} role="search">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar película o serie"
            aria-label="Buscar películas y series"
          />
        </form>

        <div className="nav__usuario">
          {!listo ? null : usuario ? (
            <div className="menu">
              <button className="menu__boton" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label="Menú de usuario">
                <Avatar nombre={nombre} foto={foto} tamano={32} />
              </button>
              {menu && (
                <div className="menu__lista" onClick={() => setMenu(false)}>
                  <Link to={`/u/${usuario.uid}`} viewTransition>Mi perfil</Link>
                  <button onClick={salir}>Cerrar sesión</button>
                </div>
              )}
            </div>
          ) : (
            <button className="boton boton--chico" onClick={() => entrar()} disabled={!configCompleta}>
              Entrar
            </button>
          )}
        </div>
      </header>

      {!configCompleta && (
        <p className="aviso aviso--error aviso--barra">
          Faltan las variables de entorno de Firebase: las reseñas y los perfiles no van a funcionar.
        </p>
      )}

      <main id="contenido" className="principal">
        <Outlet context={{ abrirRuleta: () => setRuleta(true) }} />
      </main>

      <footer className="pie">
        <div className="contenedor">
          <TextoEscalado proporcion={0.24} maximo={320} className="pie__marca">POCHOCLO</TextoEscalado>
          <div className="pie__grilla">
            <p className="pie__lema">Todas las películas y series del mundo, reseñadas por la gente que las ve.</p>
            <nav className="pie__columna" aria-label="Explorar">
              <span className="pie__titulo">Explorar</span>
              <Link to="/" viewTransition>Inicio</Link>
              <Link to="/buscar" viewTransition>Buscar</Link>
              <Link to="/mundo" viewTransition>Vuelta al mundo</Link>
              <button onClick={() => setRuleta(true)}>Ruleta</button>
            </nav>
            <div className="pie__columna">
              <span className="pie__titulo">Contacto</span>
              <a href="mailto:hola@pochoclo.club">hola@pochoclo.club</a>
              <a href="mailto:prensa@pochoclo.club">prensa@pochoclo.club</a>
            </div>
            <div className="pie__columna">
              <span className="pie__titulo">Seguinos</span>
              <span>Instagram — @pochoclo.cine</span>
              <span>Letterboxd — pochoclo</span>
            </div>
          </div>
          <p className="pie__legal">
            <span>© 2026 Pochoclo</span>
            <span>
              Imágenes y datos de{' '}
              <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">TMDB</a>
            </span>
          </p>
        </div>
      </footer>

      {/* Barra inferior estilo app en el celular */}
      <nav className="tabbar" aria-label="Navegación móvil">
        {SECCIONES.map((s) => (
          <NavLink key={s.to} to={s.to} end={s.end} viewTransition className="tabbar__item">
            {s.etiqueta}
          </NavLink>
        ))}
        <button className="tabbar__item" onClick={() => setRuleta(true)}>
          Ruleta
        </button>
        {usuario ? (
          <NavLink to={`/u/${usuario.uid}`} viewTransition className="tabbar__item">
            Perfil
          </NavLink>
        ) : (
          <button className="tabbar__item" onClick={() => entrar()} disabled={!configCompleta}>
            Entrar
          </button>
        )}
      </nav>

      {/* Filtro SVG de "tinta corrida": bordes irregulares para sellos y titulares impresos */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="tinta">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="ruido" />
          <feDisplacementMap in="SourceGraphic" in2="ruido" scale="3" />
        </filter>
      </svg>

      <Ruleta abierto={ruleta} onCerrar={() => setRuleta(false)} />
      <ScrollRestoration />
    </div>
  )
}
