// Países destacados en la sección "Vuelta al mundo", agrupados por región.
// Cualquier otro país igual se puede visitar desde /mundo/XX (código ISO).
export const REGIONES = [
  { nombre: 'América Latina', paises: ['AR', 'MX', 'BR', 'CL', 'CO', 'UY', 'PE', 'CU', 'VE', 'BO'] },
  { nombre: 'Europa', paises: ['ES', 'FR', 'IT', 'DE', 'GB', 'SE', 'DK', 'NO', 'PL', 'PT', 'IE', 'BE', 'GR', 'RO'] },
  { nombre: 'Asia', paises: ['JP', 'KR', 'CN', 'IN', 'TW', 'HK', 'TH', 'PH', 'ID', 'IR', 'TR'] },
  { nombre: 'África y Medio Oriente', paises: ['NG', 'EG', 'ZA', 'SN', 'MA', 'TN', 'IL', 'LB'] },
  { nombre: 'Norteamérica y Oceanía', paises: ['US', 'CA', 'AU', 'NZ'] },
]

export const TODOS_LOS_PAISES = REGIONES.flatMap((r) => r.paises)

// Cantidad aproximada de países del mundo, para la barra del pasaporte.
export const PAISES_DEL_MUNDO = 195
