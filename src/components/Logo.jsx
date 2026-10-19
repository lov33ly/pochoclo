// Pictograma de balde de pochoclos, monocromo como los íconos de un sistema de señalética.
export default function Logo({ tamano = 28 }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 40 40" aria-hidden="true" className="logo-icono">
      <g fill="currentColor">
        <circle cx="12.5" cy="12" r="5" />
        <circle cx="20" cy="9" r="5.5" />
        <circle cx="27.5" cy="12" r="5" />
      </g>
      <path d="M7 16h26l-3.2 22H10.2z" fill="currentColor" />
      <path d="M15.2 18l.9 18M24.8 18l-.9 18" stroke="var(--fondo, #fff)" strokeWidth="2.6" />
    </svg>
  )
}
