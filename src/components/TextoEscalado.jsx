import { useLayoutEffect, useRef, useState } from 'react'

// "Free scale": estira o comprime un texto para que ocupe exactamente el ancho
// disponible y la altura pedida, como los titulares de un manual de marca.
// La altura es una proporción del ancho (proporcion) con un tope en px (maximo).
export default function TextoEscalado({ children, proporcion = 0.22, maximo = Infinity, como: Etiqueta = 'p', className = '', ...resto }) {
  const caja = useRef(null)
  const texto = useRef(null)
  const [escala, setEscala] = useState(null)

  useLayoutEffect(() => {
    const medir = () => {
      const c = caja.current
      const t = texto.current
      if (!c || !t) return
      const ancho = c.clientWidth
      const objetivo = Math.min(ancho * proporcion, maximo)
      const w = t.offsetWidth
      const h = t.offsetHeight
      if (!w || !h) return
      setEscala((e) =>
        e && Math.abs(e.x - ancho / w) < 0.001 && Math.abs(e.alto - objetivo) < 0.5 ? e : { x: ancho / w, y: objetivo / h, alto: objetivo },
      )
    }
    medir()
    const obs = new ResizeObserver(medir)
    obs.observe(caja.current)
    document.fonts?.ready.then(medir)
    return () => obs.disconnect()
  }, [children, proporcion, maximo])

  return (
    <Etiqueta
      ref={caja}
      className={`escalado ${className}`}
      style={{ height: escala ? escala.alto : undefined }}
      {...resto}
    >
      <span
        ref={texto}
        className="escalado__texto"
        style={escala ? { transform: `scale(${escala.x}, ${escala.y})` } : { visibility: 'hidden' }}
      >
        {children}
      </span>
    </Etiqueta>
  )
}
