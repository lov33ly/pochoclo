// Banda sonora con la API de búsqueda de iTunes (Apple): gratis, sin clave y con CORS habilitado.
// https://performance-partners.apple.com/search-api

const BASE = 'https://itunes.apple.com'
const cache = new Map()

// Palabras que indican que un disco es la música de una película o serie.
const ES_BANDA_SONORA = /soundtrack|motion picture|original score|banda sonora|music from|series|ost\b/i

const normalizar = (t) =>
  t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

async function pedir(ruta, params) {
  const res = await fetch(`${BASE}/${ruta}?${new URLSearchParams(params)}`)
  if (!res.ok) throw new Error(`iTunes respondió ${res.status}`)
  return res.json()
}

// Busca el disco cuyo nombre contenga el título y diga "soundtrack" (o similar).
async function buscarDisco(titulos, anio) {
  for (const titulo of titulos) {
    if (!titulo) continue
    const datos = await pedir('search', { term: `${titulo} soundtrack`, entity: 'album', media: 'music', limit: 15 })
    const buscado = normalizar(titulo)
    const candidatos = (datos.results || []).filter((a) => {
      const nombre = normalizar(a.collectionName || '')
      return nombre.includes(buscado) && ES_BANDA_SONORA.test(a.collectionName)
    })
    if (candidatos.length) {
      // Si hay varios, el más cercano al año de estreno.
      const año = (a) => Number((a.releaseDate || '').slice(0, 4)) || 0
      candidatos.sort((a, b) => Math.abs(año(a) - (anio || año(a))) - Math.abs(año(b) - (anio || año(b))))
      return candidatos[0]
    }
  }
  return null
}

export function bandaSonora({ titulo, tituloOriginal, tituloIngles, anio }) {
  const clave = `${tituloIngles}|${tituloOriginal}|${titulo}|${anio}`
  if (cache.has(clave)) return cache.get(clave)

  const promesa = (async () => {
    // Los discos suelen estar cargados en inglés: primero el título en inglés, después el original y el traducido.
    const disco = await buscarDisco([...new Set([tituloIngles, tituloOriginal, titulo])], anio)
    if (!disco) return null
    const datos = await pedir('lookup', { id: disco.collectionId, entity: 'song', limit: 40 })
    const temas = (datos.results || [])
      .filter((r) => r.wrapperType === 'track' && r.previewUrl)
      .map((r) => ({
        id: r.trackId,
        nombre: r.trackName,
        artista: r.artistName,
        duracion: r.trackTimeMillis,
        muestra: r.previewUrl,
      }))
    if (!temas.length) return null
    return {
      nombre: disco.collectionName,
      artista: disco.artistName,
      tapa: (disco.artworkUrl100 || '').replace('100x100', '400x400'),
      anio: (disco.releaseDate || '').slice(0, 4),
      enlace: disco.collectionViewUrl,
      temas,
    }
  })()

  cache.set(clave, promesa)
  promesa.catch(() => cache.delete(clave))
  return promesa
}
