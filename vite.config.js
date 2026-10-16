import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { consultarTmdb } from './api/_lib/tmdb.js'

// En desarrollo, Vite responde /api/tmdb con la misma lógica que la función de Vercel.
function proxyTmdbLocal(token) {
  return {
    name: 'proxy-tmdb-local',
    configureServer(server) {
      server.middlewares.use('/api/tmdb', async (req, res) => {
        const params = Object.fromEntries(new URL(req.url, 'http://x').searchParams)
        try {
          const { status, body } = await consultarTmdb(params.ruta, params, token)
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        } catch {
          res.statusCode = 502
          res.end(JSON.stringify({ error: 'No se pudo conectar con TMDB' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), proxyTmdbLocal(env.TMDB_TOKEN)],
  }
})
