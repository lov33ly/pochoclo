import { Link } from 'react-router'
import { REGIONES } from '../lib/mundo'
import { bandera, nombrePais } from '../lib/paises'
import { colorDe } from '../lib/color'

export default function Mundo() {
  return (
    <div className="contenedor pagina">
      <header className="pagina__cabecera">
        <p className="sobretitulo">Vuelta al mundo</p>
        <h1 className="titulo-pagina">¿A dónde viajamos hoy?</h1>
        <p className="bajada">
          Elegí un país y descubrí sus películas y series: lo más visto, lo mejor puntuado y lo último que se estrenó.
        </p>
      </header>

      {REGIONES.map((r) => (
        <section key={r.nombre} className="region">
          <h2 className="titulo-seccion">{r.nombre}</h2>
          <ul className="paises">
            {r.paises.map((p) => {
              const c = colorDe(p)
              return (
                <li key={p}>
                  <Link
                    to={`/mundo/${p}`}
                    viewTransition
                    className="pais"
                    style={{ '--acento': c.fondo, '--sobre-acento': c.texto }}
                  >
                    <span className="pais__bandera" aria-hidden="true">{bandera(p)}</span>
                    <span className="pais__nombre">{nombrePais(p)}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
