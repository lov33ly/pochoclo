export const TIPOS = { movie: 'Película', tv: 'Serie' }

const fechaLarga = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
const mesAnio = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' })

export function fecha(valor) {
  if (!valor) return ''
  const d = typeof valor === 'string' ? new Date(valor + 'T12:00:00') : valor.toDate?.() || new Date(valor)
  return fechaLarga.format(d).replace('.', '')
}

export function mes(valor) {
  const d = new Date(valor + 'T12:00:00')
  return mesAnio.format(d)
}

export function duracion(min) {
  if (!min) return ''
  const h = Math.floor(min / 60)
  const m = min % 60
  return h ? `${h} h ${m ? m + ' min' : ''}`.trim() : `${m} min`
}

export const hoy = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

export const estrellasTexto = (p) => '★'.repeat(Math.floor(p)) + (p % 1 ? '½' : '')

// Duración en formato timecode de edición: 02:25:00
export function timecode(min) {
  if (!min) return '—'
  const h = String(Math.floor(min / 60)).padStart(2, '0')
  const m = String(min % 60).padStart(2, '0')
  return `${h}:${m}:00`
}
