// Cliente de TMDB. Nunca llama a TMDB directo: pasa por /api/tmdb (nuestro proxy),
// que agrega el token del lado del servidor.

const cache = new Map()

export async function tmdb(ruta, params = {}) {
  const qs = new URLSearchParams({ ruta, ...params })
  const url = `/api/tmdb?${qs}`
  if (cache.has(url)) return cache.get(url)

  const promesa = fetch(url).then(async (res) => {
    const datos = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(datos.status_message || datos.error || `Error ${res.status}`)
    return datos
  })
  cache.set(url, promesa)
  promesa.catch(() => cache.delete(url)) // si falla, se puede reintentar
  return promesa
}

export function imagen(ruta, tamano = 'w342') {
  return ruta ? `https://image.tmdb.org/t/p/${tamano}${ruta}` : null
}

// Unifica películas y series en una misma forma.
export function normalizar(item, tipoForzado) {
  const tipo = tipoForzado || item.media_type
  const esPeli = tipo === 'movie'
  const fecha = esPeli ? item.release_date : item.first_air_date
  return {
    id: item.id,
    tipo,
    titulo: esPeli ? item.title : item.name,
    tituloOriginal: esPeli ? item.original_title : item.original_name,
    idioma: item.original_language,
    anio: fecha ? Number(fecha.slice(0, 4)) : null,
    poster: item.poster_path || null,
    fondo: item.backdrop_path || null,
    resumen: item.overview || '',
    puntajeTmdb: item.vote_average || 0,
    votos: item.vote_count || 0,
    paises: item.origin_country?.length
      ? item.origin_country
      : (item.production_countries || []).map((p) => p.iso_3166_1),
  }
}

export const listar = (datos, tipo) =>
  (datos.results || [])
    .filter((r) => (tipo || r.media_type === 'movie' || r.media_type === 'tv'))
    .map((r) => normalizar(r, tipo))

export async function detalle(tipo, id) {
  const d = await tmdb(`${tipo}/${id}`, {
    append_to_response: 'credits,recommendations,videos,watch/providers,translations',
    include_video_language: 'es,en',
  })
  const base = normalizar(d, tipo)
  const equipo = d.credits?.crew || []
  return {
    ...base,
    generos: (d.genres || []).map((g) => g.name),
    duracion: tipo === 'movie' ? d.runtime || null : d.episode_run_time?.[0] || null,
    temporadas: d.number_of_seasons || null,
    episodios: d.number_of_episodes || null,
    lema: d.tagline || '',
    direccion:
      tipo === 'movie'
        ? equipo.filter((p) => p.job === 'Director').map((p) => p.name)
        : (d.created_by || []).map((p) => p.name),
    reparto: (d.credits?.cast || []).slice(0, 12).map((p) => ({
      id: p.id,
      nombre: p.name,
      personaje: p.character,
      foto: p.profile_path,
    })),
    recomendadas: listar(d.recommendations || {}, tipo).slice(0, 12),
    tituloIngles: tituloEnIngles(d.translations?.translations || [], tipo),
    trailer: elegirTrailer(d.videos?.results || []),
    dondeVer: plataformas(d['watch/providers']?.results?.AR),
  }
}

function tituloEnIngles(traducciones, tipo) {
  const en = traducciones.find((t) => t.iso_639_1 === 'en' && t.iso_3166_1 === 'US') || traducciones.find((t) => t.iso_639_1 === 'en')
  return (tipo === 'movie' ? en?.data?.title : en?.data?.name) || null
}

// El mejor video de YouTube: tráiler en español, si no en inglés, si no un teaser.
function elegirTrailer(videos) {
  const yt = videos.filter((v) => v.site === 'YouTube')
  const orden = [
    (v) => v.type === 'Trailer' && v.iso_639_1 === 'es',
    (v) => v.type === 'Trailer' && v.official,
    (v) => v.type === 'Trailer',
    (v) => v.type === 'Teaser',
  ]
  for (const criterio of orden) {
    const v = yt.find(criterio)
    if (v) return { clave: v.key, nombre: v.name, idioma: v.iso_639_1 }
  }
  return null
}

// Plataformas donde se puede ver en Argentina (datos de JustWatch vía TMDB).
function plataformas(ar) {
  if (!ar) return null
  const mapear = (lista = []) =>
    lista.map((p) => ({ id: p.provider_id, nombre: p.provider_name, logo: p.logo_path }))
  const grupos = {
    suscripcion: mapear(ar.flatrate),
    gratis: mapear([...(ar.free || []), ...(ar.ads || [])]),
    alquiler: mapear(ar.rent),
    compra: mapear(ar.buy),
  }
  const hay = Object.values(grupos).some((g) => g.length)
  return hay ? { ...grupos, enlace: ar.link } : null
}
