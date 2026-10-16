import { useState } from 'react'
import { colorDe } from '../lib/color'

export default function Avatar({ nombre = '?', foto, tamano = 36 }) {
  const [fallo, setFallo] = useState(false)
  const c = colorDe(nombre)
  const iniciales = nombre
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

  return foto && !fallo ? (
    <img
      className="avatar"
      src={foto}
      alt=""
      width={tamano}
      height={tamano}
      referrerPolicy="no-referrer"
      onError={() => setFallo(true)}
    />
  ) : (
    <span
      className="avatar avatar--iniciales"
      style={{ width: tamano, height: tamano, background: c.fondo, color: c.texto, fontSize: tamano * 0.4 }}
      aria-hidden="true"
    >
      {iniciales}
    </span>
  )
}
