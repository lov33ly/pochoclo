// Cada título recibe un color de la paleta según su id: siempre el mismo,
// así una película "es" violeta o mostaza en toda la app (ficha, entradas, perfil).
export const PALETA = [
  { fondo: '#ff4b2b', texto: '#fff4e2' }, // tomate
  { fondo: '#ffc22e', texto: '#17111f' }, // mostaza
  { fondo: '#2f4cff', texto: '#fff4e2' }, // cobalto
  { fondo: '#ff8ec6', texto: '#17111f' }, // rosa
  { fondo: '#2bc48a', texto: '#17111f' }, // menta
  { fondo: '#7a3cff', texto: '#fff4e2' }, // violeta
]

export function colorDe(id) {
  const n = Math.abs(Number(id) || String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0))
  return PALETA[n % PALETA.length]
}

export function estiloColor(id) {
  const c = colorDe(id)
  return { '--acento': c.fondo, '--sobre-acento': c.texto }
}
