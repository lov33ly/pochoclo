import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import Inicio from './pages/Inicio'
import Detalle from './pages/Detalle'
import Perfil from './pages/Perfil'
import './styles/index.css'

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Inicio },
      { path: ':tipo/:id', Component: Detalle },
      { path: 'u/:uid', Component: Perfil },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
