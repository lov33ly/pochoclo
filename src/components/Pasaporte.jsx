import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { nombrePais } from '../lib/paises'
import { fecha } from '../lib/formato'
import { PAISES_DEL_MUNDO } from '../lib/mundo'
import { Vacio } from './Estados'
import { tmdb } from '../lib/tmdb'

// Total de películas + series de un país en el catálogo de TMDB.
async function totalDelPais(pais) {
  const params = { with_origin_country: pais, include_adult: 'false' }
  const [pelis, series] = await Promise.all([
    tmdb('discover/movie', params).catch(() => null),
    tmdb('discover/tv', params).catch(() => null),
  ])
  if (!pelis && !series) return null
  return (pelis?.total_results || 0) + (series?.total_results || 0)
}

function useTotales(paises) {
  const [totales, setTotales] = useState({})
  const clave = paises.join(',')
  useEffect(() => {
    let vigente = true
    paises.forEach((p) =>
      totalDelPais(p).then((n) => vigente && setTotales((t) => ({ ...t, [p]: n }))),
    )
    return () => {
      vigente = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave])
  return totales
}

const miles = new Intl.NumberFormat('es-AR')

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

  const totales = useTotales(sellos.map((s) => s.pais))

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
                <span className="sello__cuenta" title={`${s.cantidad} de ${totales[s.pais] ?? '…'} títulos de ${nombrePais(s.pais)} en el catálogo`}>
                  {s.cantidad}/{totales[s.pais] != null ? miles.format(totales[s.pais]) : '…'}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
