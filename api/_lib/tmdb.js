// Proxy hacia la API de TMDB.
// El token se guarda como variable de entorno del servidor (TMDB_TOKEN, sin prefijo VITE_),
// así nunca llega al navegador. Lo usan la función serverless de Vercel (api/tmdb.js)
// y el servidor de desarrollo de Vite (vite.config.js).

const BASE = 'https://api.themoviedb.org/3'

// Solo se permiten rutas de lectura que usa la app.
const PERMITIDAS = [
  /^trending\/(all|movie|tv)\/(day|week)$/,
  /^(movie|tv)\/(popular|top_rated|now_playing|on_the_air|airing_today)$/,
  /^(movie|tv)\/\d+$/,
  /^(movie|tv)\/\d+\/(credits|recommendations|similar|reviews|watch\/providers)$/,
  /^discover\/(movie|tv)$/,
  /^search\/(multi|movie|tv)$/,
  /^genre\/(movie|tv)\/list$/,
]

export async function consultarTmdb(ruta, params, token) {
  const limpia = String(ruta || '').replace(/^\/+|\/+$/g, '')
  if (!PERMITIDAS.some((r) => r.test(limpia))) {
    return { status: 400, body: { error: 'Ruta no permitida' } }
  }
  if (!token) {
    return { status: 500, body: { error: 'Falta TMDB_TOKEN en las variables de entorno' } }
  }

  const qs = new URLSearchParams(params)
  qs.delete('ruta')
  if (!qs.has('language')) qs.set('language', 'es-MX')

  const res = await fetch(`${BASE}/${limpia}?${qs}`, {
    headers: { Authorization: `Bearer ${token}`, accept: 'application/json' },
  })
  const body = await res.json().catch(() => ({ error: 'Respuesta inválida de TMDB' }))
  return { status: res.status, body }
}
