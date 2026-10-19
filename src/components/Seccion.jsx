// Encabezado de sección al estilo de un manual de marca: filete, título y dato a la derecha.
export default function Seccion({ titulo, extra, children, className = '', oscura = false, id }) {
  return (
    <section className={`seccion ${oscura ? 'seccion--oscura' : ''} ${className}`} id={id}>
      <header className="seccion__cabecera">
        <h2 className="seccion__titulo">
          {titulo}
        </h2>
        {extra && <div className="seccion__extra">{extra}</div>}
      </header>
      {children}
    </section>
  )
}
