// Balde de pochoclos dibujado en SVG: rayas de los colores de la paleta.
export default function Logo({ tamano = 34 }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 40 40" aria-hidden="true" className="logo-icono">
      <g fill="#fff4e2" stroke="#17111f" strokeWidth="1.6">
        <circle cx="13" cy="12" r="5" />
        <circle cx="20" cy="9" r="5.5" />
        <circle cx="27" cy="12" r="5" />
        <circle cx="16.5" cy="15" r="4.5" />
        <circle cx="23.5" cy="15" r="4.5" />
      </g>
      <path d="M8 16h24l-3 21H11z" fill="#ff4b2b" stroke="#17111f" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M15.5 16l.8 21M24.5 16l-.8 21" stroke="#fff4e2" strokeWidth="3" />
      <path d="M8 16h24l-3 21H11z" fill="none" stroke="#17111f" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}
