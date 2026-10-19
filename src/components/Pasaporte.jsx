import { useMemo } from 'react'
import { Link } from 'react-router'
import { nombrePais } from '../lib/paises'
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
      <Vacio titulo="Pasaporte sin sellos">
        {propio ? 'Cada película o serie que reseñes le suma el sello de su país.' : 'Todavía no viajó con el cine.'}
      </Vacio>
    )

  const porcentaje = (sellos.length / PAISES_DEL_MUNDO) * 100

  return (
    <div className="pasaporte">
      <div className="pasaporte__progreso">
        <p className="pasaporte__cifra">
          {sellos.length}<span>/{PAISES_DEL_MUNDO}</span>
        </p>
        <p className="mono">países recorridos</p>
        <div className="barra" role="progressbar" aria-valuenow={Math.round(porcentaje)} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${Math.max(porcentaje, 1)}%` }} />
        </div>
      </div>
      <ul className="sellos">
        {sellos.map((s, i) => {
          const giro = ((s.pais.charCodeAt(0) * 7 + s.pais.charCodeAt(1) * 13) % 13) - 6
          return (
            <li key={s.pais} style={{ '--giro': `${giro}deg`, '--demora': `${i * 40}ms` }}>
              <Link to={`/mundo/${s.pais}`} viewTransition className="sello">
                <span className="sello__dato">Entrada · {s.primera ? fecha(s.primera) : ''}</span>
                <strong className="sello__codigo">{s.pais}</strong>
                <span className="sello__pais">{nombrePais(s.pais)}</span>
                <span className="sello__dato">{s.cantidad} título{s.cantidad > 1 && 's'}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
