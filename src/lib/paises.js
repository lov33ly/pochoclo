// Nombres de países en español y banderas a partir del código ISO (AR, JP, KR…),
// sin depender de una lista: usa Intl.DisplayNames del navegador.
const nombres = new Intl.DisplayNames(['es'], { type: 'region' })
const idiomas = new Intl.DisplayNames(['es'], { type: 'language' })

export function nombrePais(codigo) {
  try {
    return nombres.of(codigo) || codigo
  } catch {
    return codigo
  }
}

export function nombreIdioma(codigo) {
  try {
    return idiomas.of(codigo) || codigo
  } catch {
    return codigo
  }
}

export function bandera(codigo) {
  if (!/^[A-Z]{2}$/.test(codigo || '')) return '🏳️'
  return String.fromCodePoint(...[...codigo].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
}
