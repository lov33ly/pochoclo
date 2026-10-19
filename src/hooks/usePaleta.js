import { useEffect, useState } from 'react'

const cache = new Map()

const hex = (r, g, b) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()
const distancia = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

// Extrae los colores dominantes de un fotograma: reduce la imagen a 80×45 px,
// agrupa los píxeles en "cubetas" de color y se queda con las más frecuentes
// que sean suficientemente distintas entre sí.
function extraer(img, cantidad) {
  const canvas = document.createElement('canvas')
  canvas.width = 80
  canvas.height = 45
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, 80, 45)
  const { data } = ctx.getImageData(0, 0, 80, 45)

  const cubetas = new Map()
  for (let i = 0; i < data.length; i += 4) {
    const k = ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4)
    const c = cubetas.get(k) || { n: 0, r: 0, g: 0, b: 0 }
    c.n++
    c.r += data[i]
    c.g += data[i + 1]
    c.b += data[i + 2]
    cubetas.set(k, c)
  }

  const ordenadas = [...cubetas.values()]
    .sort((a, b) => b.n - a.n)
    .map((c) => [Math.round(c.r / c.n), Math.round(c.g / c.n), Math.round(c.b / c.n), c.n])

  const total = data.length / 4
  const elegidos = []
  for (const c of ordenadas) {
    if (elegidos.every((e) => distancia(e, c) > 60)) elegidos.push(c)
    if (elegidos.length === cantidad) break
  }
  return elegidos.map(([r, g, b, n]) => ({ hex: hex(r, g, b), rgb: `${r}, ${g}, ${b}`, peso: n / total }))
}

export function usePaleta(url, cantidad = 5) {
  const [resultado, setResultado] = useState({ url: null, colores: null })

  useEffect(() => {
    if (!url) return
    let vigente = true
    const listo = (colores) => vigente && setResultado({ url, colores })
    if (cache.has(url)) {
      cache.get(url).then(listo)
      return () => (vigente = false)
    }
    const promesa = new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous' // TMDB permite leer sus imágenes desde otro dominio (CORS)
      img.onload = () => {
        try {
          resolve(extraer(img, cantidad))
        } catch {
          resolve([])
        }
      }
      img.onerror = () => resolve([])
      img.src = url
    })
    cache.set(url, promesa)
    promesa.then(listo)
    return () => (vigente = false)
  }, [url, cantidad])

  return resultado.url === url ? resultado.colores : null
}
