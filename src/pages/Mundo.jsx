import { Link } from 'react-router'
import { REGIONES } from '../lib/mundo'
import { nombrePais } from '../lib/paises'
import TextoEscalado from '../components/TextoEscalado'
import Seccion from '../components/Seccion'

export default function Mundo() {
  return (
    <div className="contenedor pagina">
      <header className="portada">
        <p className="rotulo">Vuelta al mundo</p>
        <TextoEscalado como="h1" proporcion={0.3} maximo={360}>MUNDO</TextoEscalado>
        <p className="portada__bajada">
          El cine no habla un solo idioma. Elegí un país y descubrí sus películas y series: lo más visto, lo mejor
          puntuado y lo último que se estrenó.
        </p>
      </header>

      {REGIONES.map((r) => (
        <Seccion key={r.nombre} titulo={r.nombre}>
          <ul className="paises">
            {r.paises.map((p) => (
              <li key={p}>
                <Link to={`/mundo/${p}`} viewTransition className="pais">
                  <span className="pais__codigo">{p}</span>
                  <span className="pais__nombre">{nombrePais(p)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Seccion>
      ))}
    </div>
  )
}
