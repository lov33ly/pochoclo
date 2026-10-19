import TextoEscalado from './TextoEscalado'

// Portada de página como un afiche: plano de color, fotograma en duotono,
// trama de semitono, titular gigante en escala libre y un texto vertical al costado.
// color: 'azul' | 'rojo' | 'negro'
export default function PortadaColor({
  color = 'azul',
  fondo,
  rotulo,
  rotuloDerecha,
  titulo,
  proporcion = 0.22,
  maximo = 360,
  vertical,
  contorno,
  children,
}) {
  return (
    <section className={`portada-color portada-color--${color}`}>
      {fondo && <img className="portada-color__fondo" src={fondo} alt="" aria-hidden="true" />}
      <span className="portada-color__trama" aria-hidden="true" />
      {contorno && (
        <span className="portada-color__contorno" aria-hidden="true">
          {contorno}
        </span>
      )}

      <div className="contenedor portada-color__interior">
        {(rotulo || rotuloDerecha) && (
          <p className="portada-color__barra">
            <span>{rotulo}</span>
            {rotuloDerecha && <span>{rotuloDerecha}</span>}
          </p>
        )}

        {titulo.length > 34 ? (
          <h1 className="portada-color__titulo titular-largo">{titulo}</h1>
        ) : (
          <TextoEscalado como="h1" proporcion={proporcion} maximo={maximo} className="portada-color__titulo">
            {titulo.toUpperCase()}
          </TextoEscalado>
        )}

        {children && <div className="portada-color__pie">{children}</div>}
      </div>

      {vertical && (
        <p className="portada-color__vertical" aria-hidden="true">
          {vertical}
        </p>
      )}
    </section>
  )
}
