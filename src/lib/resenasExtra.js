// Reseñas reales publicadas por usuarios de TMDB (primero en español; si no hay, en inglés).
// Se muestran junto a las de Pochoclo, con un enlace a la reseña original.
import { tmdb } from './tmdb'

export async function resenasTmdb(tipo, id) {
  let d = await tmdb(`${tipo}/${id}/reviews`, { language: 'es-MX' }).catch(() => null)
  if (!d?.results?.length) d = await tmdb(`${tipo}/${id}/reviews`, { language: 'en-US' }).catch(() => null)
  return (d?.results || []).slice(0, 6).map((r) => {
    const nota = r.author_details?.rating
    return {
      id: `tmdb_${r.id}`,
      origen: 'tmdb',
      autorNombre: r.author_details?.name || r.author,
      autorFoto: r.author_details?.avatar_path?.startsWith('/') ? `https://image.tmdb.org/t/p/w45${r.author_details.avatar_path}` : '',
      puntaje: nota ? Math.min(5, Math.max(0.5, Math.round(nota) / 2)) : null,
      texto: limpiar(r.content),
      vista: (r.created_at || '').slice(0, 10),
      meGusta: nota >= 8,
      spoiler: false,
      url: r.url,
    }
  })
}

// Quita el formato Markdown/HTML que a veces traen las reseñas de TMDB.
function limpiar(texto = '') {
  return texto
    .replace(/<[^>]+>/g, '')
    .replace(/\*\*|__|\*|_/g, '')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
