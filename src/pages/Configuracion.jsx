import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { descargarMisDatos, eliminarCuenta } from '../services/cuenta'
import PortadaColor from '../components/PortadaColor'
import Seccion from '../components/Seccion'
import Avatar from '../components/Avatar'
import EditarPerfil from '../components/EditarPerfil'
import { Vacio } from '../components/Estados'

const fechaHora = new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeStyle: 'short' })
const formatear = (texto) => (texto ? fechaHora.format(new Date(texto)) : '—')

const METODOS = { 'google.com': 'Google', password: 'Correo y contraseña' }
const PALABRA_CONFIRMACION = 'ELIMINAR'

export default function Configuracion() {
  const { usuario, perfil, entrar, salir } = useAuth()
  const { avisar, avisarError } = useToast()
  const navigate = useNavigate()
  const [editando, setEditando] = useState(false)
  const [descargando, setDescargando] = useState(false)
  const [confirmacion, setConfirmacion] = useState('')
  const [eliminando, setEliminando] = useState(false)

  if (!usuario) {
    return (
      <div className="contenedor pagina">
        <Vacio titulo="Entrá para ver la configuración de tu cuenta">
          <button className="boton boton--negro" onClick={() => entrar()}>Entrar con Google</button>
        </Vacio>
      </div>
    )
  }

  const metodo = METODOS[usuario.providerData?.[0]?.providerId] || 'Google'

  async function descargar() {
    setDescargando(true)
    try {
      await descargarMisDatos(usuario.uid)
      avisar('Descargaste tus datos.')
    } catch (e) {
      avisarError('No se pudieron descargar tus datos', e)
    } finally {
      setDescargando(false)
    }
  }

  async function eliminar(e) {
    e.preventDefault()
    if (confirmacion !== PALABRA_CONFIRMACION) return
    setEliminando(true)
    try {
      await eliminarCuenta()
      avisar('Tu cuenta y todos tus datos se eliminaron.')
      navigate('/', { viewTransition: true })
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') avisar('Cancelaste la confirmación. No se borró nada.', 'error')
      else avisarError('No se pudo eliminar la cuenta', err)
    } finally {
      setEliminando(false)
    }
  }

  async function cerrarSesion() {
    await salir()
    navigate('/', { viewTransition: true })
  }

  return (
    <>
      <PortadaColor color="negro" titulo="AJUSTES" proporcion={0.26} maximo={340} />

      <div className="contenedor pagina configuracion">
        <Seccion titulo="Cuenta">
          <dl className="tabla">
            <div><dt>Correo electrónico</dt><dd>{usuario.email || '—'}</dd></div>
            <div><dt>Inicio de sesión</dt><dd>Con tu cuenta de {metodo}</dd></div>
            <div><dt>Cuenta creada</dt><dd>{formatear(usuario.metadata?.creationTime)}</dd></div>
            <div><dt>Último acceso</dt><dd>{formatear(usuario.metadata?.lastSignInTime)}</dd></div>
          </dl>
        </Seccion>

        <Seccion titulo="Contraseña y seguridad">
          <p className="configuracion__texto">
            Pochoclo no guarda contraseñas: entrás con tu cuenta de {metodo}, que se encarga de la contraseña y de la
            verificación en dos pasos. Para cambiarla, hacelo desde la configuración de seguridad de tu cuenta.
          </p>
          <a className="boton" href="https://myaccount.google.com/security" target="_blank" rel="noreferrer">
            Seguridad de mi cuenta de Google ↗
          </a>
        </Seccion>

        <Seccion titulo="Perfil">
          <div className="configuracion__perfil">
            <Avatar nombre={perfil?.nombre || '?'} foto={perfil?.foto} tamano={64} />
            <div>
              <p className="configuracion__nombre">{perfil?.nombre}</p>
              <Link to={`/u/${usuario.uid}`} viewTransition className="enlace">Ver mi perfil público</Link>
            </div>
            <button className="boton boton--negro" onClick={() => setEditando(true)} disabled={!perfil}>
              Editar foto, nombre y bio
            </button>
          </div>
        </Seccion>

        <Seccion titulo="Tus datos">
          <p className="configuracion__texto">
            Descargá un archivo con todo lo que guardaste en Pochoclo: tu perfil, tus reseñas y tu lista “Quiero ver”.
          </p>
          <button className="boton" onClick={descargar} disabled={descargando}>
            {descargando ? 'Preparando…' : 'Descargar mis datos'}
          </button>
        </Seccion>

        <Seccion titulo="Sesión">
          <p className="configuracion__texto">Cerrá la sesión en este navegador. Tus datos quedan guardados.</p>
          <button className="boton" onClick={cerrarSesion}>Cerrar sesión</button>
        </Seccion>

        <Seccion titulo="Eliminar cuenta" className="configuracion__peligro">
          <p className="configuracion__texto">
            Se borran para siempre tu perfil, todas tus reseñas y tu lista “Quiero ver”. No se puede deshacer. Te vamos
            a pedir que confirmes con Google.
          </p>
          <form className="configuracion__eliminar" onSubmit={eliminar}>
            <label className="campo">
              <span className="etiqueta">Escribí {PALABRA_CONFIRMACION} para confirmar</span>
              <input type="text" value={confirmacion} onChange={(e) => setConfirmacion(e.target.value.toUpperCase())} autoComplete="off" />
            </label>
            <button className="boton boton--peligro" disabled={confirmacion !== PALABRA_CONFIRMACION || eliminando}>
              {eliminando ? 'Eliminando…' : 'Eliminar mi cuenta'}
            </button>
          </form>
        </Seccion>
      </div>

      <EditarPerfil abierto={editando} perfil={perfil} onCerrar={() => setEditando(false)} />
    </>
  )
}
