// Función serverless de Vercel: GET /api/tmdb?ruta=movie/550&...
import { consultarTmdb } from './_lib/tmdb.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método no permitido' })
    return
  }
  try {
    const { status, body } = await consultarTmdb(req.query.ruta, req.query, process.env.TMDB_TOKEN)
    // Caché en el CDN de Vercel: los datos de películas cambian poco.
    if (status === 200) res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    res.status(status).json(body)
  } catch {
    res.status(502).json({ error: 'No se pudo conectar con TMDB' })
  }
}
