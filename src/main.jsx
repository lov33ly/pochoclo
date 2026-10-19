import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Layout from './components/Layout'
import Inicio from './pages/Inicio'
import Buscar from './pages/Buscar'
import Detalle from './pages/Detalle'
import Perfil from './pages/Perfil'
import Mundo from './pages/Mundo'
import Pais from './pages/Pais'
import NoEncontrado from './pages/NoEncontrado'
import ErrorRuta from './pages/ErrorRuta'
import './styles/index.css'

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    ErrorBoundary: ErrorRuta,
    children: [
      {
        ErrorBoundary: ErrorRuta,
        children: [
          { index: true, Component: Inicio },
          { path: 'buscar', Component: Buscar },
          { path: 'mundo', Component: Mundo },
          { path: 'mundo/:codigo', Component: Pais },
          { path: ':tipo/:id', Component: Detalle },
          { path: 'u/:uid', Component: Perfil },
          { path: '*', Component: NoEncontrado },
        ],
      },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ToastProvider>
  </StrictMode>,
)
