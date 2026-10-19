// Reseñas que no vienen de Firestore, para que ninguna ficha quede vacía:
// 1. Reseñas reales publicadas en TMDB (primero en español, si no hay, en inglés).
// 2. Reseñas de ejemplo, inventadas a partir de los datos de la película y
//    firmadas por perfiles ficticios. Se muestran con la etiqueta "Ejemplo".
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

// ---------- Reseñas de ejemplo ----------

const PERFILES = [
  'Lucía Ferreyra', 'Tomás Aguirre', 'Camila Duarte', 'Joaquín Ríos', 'Martina Sosa', 'Bruno Medina',
  'Sofía Paredes', 'Nicolás Vera', 'Julieta Campos', 'Mateo Ibarra', 'Valeria Luna', 'Ignacio Bravo',
]

const APERTURAS = [
  'La vi un domingo a la noche y todavía la sigo pensando.',
  'Llegué sin muchas expectativas y me sorprendió.',
  'Hacía rato que no veía algo así.',
  'La vi por recomendación de una amiga y no me arrepiento.',
  'Segunda vez que la veo y encontré cosas nuevas.',
  'Tenía ganas de verla desde que salió.',
]

const MEDIOS = {
  alta: [
    'Cada plano está pensado y el ritmo no decae nunca.',
    'Las actuaciones sostienen todo y la música hace el resto.',
    'Tiene escenas que se te quedan grabadas, sobre todo hacia el final.',
    'Es de esas historias que funcionan igual de bien la segunda vez.',
  ],
  media: [
    'Tiene momentos muy buenos, aunque en el medio se estira un poco.',
    'La idea es mejor que la ejecución, pero se disfruta.',
    'Visualmente es muy linda; el guion no siempre acompaña.',
    'Entretiene, aunque esperaba un poco más del final.',
  ],
  baja: [
    'No terminé de engancharme con los personajes.',
    'Se hace larga y el final se ve venir.',
    'Tiene una buena premisa que no termina de aprovechar.',
  ],
}

// Generador pseudoaleatorio con semilla: el mismo título siempre muestra las mismas reseñas.
function azar(semilla) {
  let s = semilla % 2147483647 || 1
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

export function resenasEjemplo(t, cantidad) {
  const r = azar(t.id * 31 + (t.tipo === 'tv' ? 7 : 3))
  const base = t.puntajeTmdb ? t.puntajeTmdb / 2 : 3.5
  const elegir = (lista) => lista[Math.floor(r() * lista.length)]
  const usados = new Set()

  return Array.from({ length: cantidad }, (_, i) => {
    let nombre = elegir(PERFILES)
    while (usados.has(nombre)) nombre = elegir(PERFILES)
    usados.add(nombre)

    const puntaje = Math.min(5, Math.max(1, Math.round((base + (r() - 0.5) * 2) * 2) / 2))
    const tono = puntaje >= 4 ? 'alta' : puntaje >= 3 ? 'media' : 'baja'
    const detalle =
      t.direccion?.length && r() > 0.4
        ? ` ${t.tipo === 'movie' ? 'Lo que hace' : 'Lo que logra'} ${t.direccion[0]} con ${t.generos?.[0]?.toLowerCase() || 'el género'} es muy personal.`
        : ''
    const dias = Math.floor(r() * 300) + 3
    const fecha = new Date(Date.UTC(2026, 9, 15) - dias * 864e5).toISOString().slice(0, 10)

    return {
      id: `ejemplo_${t.id}_${i}`,
      origen: 'ejemplo',
      autorNombre: nombre,
      autorFoto: '',
      puntaje,
      texto: `${elegir(APERTURAS)} ${elegir(MEDIOS[tono])}${detalle}`,
      vista: fecha,
      meGusta: puntaje >= 4,
      spoiler: false,
    }
  })
}
