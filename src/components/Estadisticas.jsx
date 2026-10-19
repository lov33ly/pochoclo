import { useMemo } from 'react'
import { Vacio } from './Estados'

const PUNTAJES = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]

function Barras({ titulo, datos, horizontal }) {
  const max = Math.max(1, ...datos.map((d) => d.valor))
  return (
    <section className="grafico">
      <h3 className="grafico__titulo">{titulo}</h3>
      <ul className={horizontal ? 'barras barras--h' : 'barras'}>
        {datos.map((d) => (
          <li key={d.etiqueta} title={`${d.etiqueta}: ${d.valor}`}>
            <span className="barras__barra" style={{ '--v': d.valor / max }}>
              {horizontal && <span className="barras__valor">{d.valor}</span>}
            </span>
            <span className="barras__etiqueta">{d.etiqueta}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Estadisticas({ resenas }) {
  const datos = useMemo(() => {
    const generos = new Map()
    const decadas = new Map()
    resenas.forEach((r) => {
      ;(r.generos || []).forEach((g) => generos.set(g, (generos.get(g) || 0) + 1))
      if (r.anio) {
        const d = Math.floor(r.anio / 10) * 10
        decadas.set(d, (decadas.get(d) || 0) + 1)
      }
    })
    return {
      puntajes: PUNTAJES.map((p) => ({
        etiqueta: p % 1 ? '½' : String(p),
        valor: resenas.filter((r) => r.puntaje === p).length,
      })),
      generos: [...generos]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([etiqueta, valor]) => ({ etiqueta, valor })),
      decadas: [...decadas].sort((a, b) => a[0] - b[0]).map(([d, valor]) => ({ etiqueta: `${String(d).slice(2)}s`, valor })),
      gustos: resenas.filter((r) => r.meGusta).length,
    }
  }, [resenas])

  if (!resenas.length) return <Vacio titulo="Sin datos para graficar todavía" />

  return (
    <div className="estadisticas">
      <Barras titulo="Cómo puntúa" datos={datos.puntajes} />
      {datos.generos.length > 0 && <Barras titulo="Géneros favoritos" datos={datos.generos} horizontal />}
      {datos.decadas.length > 0 && <Barras titulo="Por década de estreno" datos={datos.decadas} />}
      <section className="grafico grafico--dato">
        <h3 className="grafico__titulo">Le gustaron</h3>
        <p className="grafico__grande">
          {datos.gustos}
          <span>♥</span>
        </p>
        <p>de {resenas.length} títulos reseñados</p>
      </section>
    </div>
  )
}
