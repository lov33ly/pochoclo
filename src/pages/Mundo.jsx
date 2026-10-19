import { Link } from 'react-router'
import { REGIONES } from '../lib/mundo'
import { nombrePais } from '../lib/paises'
import PortadaColor from '../components/PortadaColor'
import Seccion from '../components/Seccion'

export default function Mundo() {
  return (
    <>
      <PortadaColor
        color="rojo"
        rotulo="Vuelta al mundo"
        rotuloDerecha="Cine de 50 países"
        titulo="MUNDO"
        proporcion={0.34}
        maximo={460}
        vertical="El cine no habla un solo idioma"
        contorno="CINE"
      >
        <p className="portada-color__bajada">
          Elegí un país y descubrí sus películas y series: lo más visto, lo mejor puntuado y lo último que se estrenó.
        </p>
      </PortadaColor>
      <div className="contenedor pagina">

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
    </>
  )
}
