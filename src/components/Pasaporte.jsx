import { useMemo } from 'react'
import { Link } from 'react-router'
import { bandera, nombrePais } from '../lib/paises'
import { colorDe } from '../lib/color'
import { fecha } from '../lib/formato'
import { PAISES_DEL_MUNDO } from '../lib/mundo'
import { Vacio } from './Estados'

// Un sello por cada país de origen de las películas y series reseñadas.
export default function Pasaporte({ resenas, propio }) {
  const sellos = useMemo(() => {
    const m = new Map()
    resenas.forEach((r) =>
      (r.paises || []).forEach((p) => {
        const s = m.get(p) || { pais: p, cantidad: 0, primera: r.vista }
        s.cantidad++
        if (r.vista && r.vista < s.primera) s.primera = r.vista
        m.set(p, s)
      }),
    )
    return [...m.values()].sort((a, b) => b.cantidad - a.cantidad)
  }, [resenas])

  if (!sellos.length)
    return (
      <Vacio icono="🛂" titulo="Pasaporte sin sellos">
        {propio ? 'Cada película o serie que reseñes le suma el sello de su país.' : 'Todavía no viajó con el cine.'}
      </Vacio>
    )

  const porcentaje = Math.round((sellos.length / PAISES_DEL_MUNDO) * 100)

  return (
    <div className="pasaporte">
      <div className="pasaporte__progreso">
        <p>
          <strong>{sellos.length}</strong> de {PAISES_DEL_MUNDO} países recorridos
        </p>
        <div className="barra" role="progressbar" aria-valuenow={porcentaje} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${Math.max(porcentaje, 2)}%` }} />
        </div>
      </div>
      <ul className="sellos">
        {sellos.map((s, i) => {
          const c = colorDe(s.pais)
          const giro = ((s.pais.charCodeAt(0) * 7 + s.pais.charCodeAt(1) * 13) % 17) - 8
          return (
            <li key={s.pais} style={{ '--giro': `${giro}deg`, '--sello': c.fondo, '--demora': `${i * 40}ms` }}>
              <Link to={`/mundo/${s.pais}`} viewTransition className="sello">
                <span className="sello__bandera" aria-hidden="true">{bandera(s.pais)}</span>
                <span className="sello__pais">{nombrePais(s.pais)}</span>
                <span className="sello__dato">
                  {s.cantidad} título{s.cantidad > 1 && 's'}
                </span>
                {s.primera && <span className="sello__fecha">{fecha(s.primera)}</span>}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
