import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const cerrar = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const avisar = useCallback(
    (texto, tipo = 'ok') => {
      const id = crypto.randomUUID()
      setToasts((t) => [...t.slice(-2), { id, texto, tipo }])
      setTimeout(() => cerrar(id), tipo === 'error' ? 6000 : 3200)
    },
    [cerrar],
  )

  // Convierte un error de Firebase en un mensaje entendible.
  const avisarError = useCallback(
    (prefijo, e) => {
      const motivo =
        e?.code === 'permission-denied'
          ? 'no tenés permiso para hacer esto'
          : e?.code === 'unavailable'
            ? 'sin conexión, probá de nuevo'
            : e?.message || 'error desconocido'
      avisar(`${prefijo}: ${motivo}`, 'error')
    },
    [avisar],
  )

  return (
    <ToastContext.Provider value={{ avisar, avisarError }}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <button key={t.id} className={`toast toast--${t.tipo}`} onClick={() => cerrar(t.id)}>
            <span className="toast__icono" aria-hidden="true">{t.tipo === 'error' ? '✕' : '🍿'}</span>
            {t.texto}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext)
