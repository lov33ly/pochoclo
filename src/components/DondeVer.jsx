import { imagen } from '../lib/tmdb'
import Seccion from './Seccion'

const GRUPOS = [
  ['suscripcion', 'Suscripción'],
  ['gratis', 'Gratis'],
  ['alquiler', 'Alquiler'],
  ['compra', 'Compra'],
]

// Plataformas donde se puede ver el título en Argentina (datos de JustWatch, vía TMDB).
export default function DondeVer({ dondeVer }) {
  return (
    <Seccion titulo="Dónde verla" extra={<span>En Argentina</span>}>
      {!dondeVer ? (
        <p className="nota-vacia">Por ahora no figura en ninguna plataforma de Argentina.</p>
      ) : (
        <div className="donde">
          {GRUPOS.filter(([clave]) => dondeVer[clave].length).map(([clave, etiqueta]) => (
            <div key={clave} className="donde__grupo">
              <p className="donde__etiqueta">{etiqueta}</p>
              <ul className="donde__lista">
                {dondeVer[clave].map((p) => (
                  <li key={p.id} title={p.nombre}>
                    <a href={dondeVer.enlace} target="_blank" rel="noreferrer" className="donde__plataforma">
                      <img src={imagen(p.logo, 'w92')} alt="" loading="lazy" />
                      <span>{p.nombre}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="donde__fuente">
            Disponibilidad según{' '}
            <a href="https://www.justwatch.com/ar" target="_blank" rel="noreferrer">JustWatch</a>. Puede cambiar.
          </p>
        </div>
      )}
    </Seccion>
  )
}
