import { createBrowserRouter, Navigate } from 'react-router-dom'
import LoginUser from './pages/public/LoginUser'
import Document from './pages/public/Document'
import Success from './pages/public/Success'
import LoginAdmin from './pages/admin/LoginAdmin'
import UploadDocument from './pages/admin/UploadDocument'
import Signatures from './pages/admin/Signatures'
import RequireAuth from './guards/RequireAuth'
import RequireRole from './guards/RequireRole'
import { Role } from './lib/rbac'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginUser /> },
  { path: '/admin/login', element: <LoginAdmin /> },
  {
    path: '/document',
    element: (
      <RequireAuth>
        <RequireRole roles={[Role.USER]}>
          <Document />
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/success',
    element: (
      <RequireAuth>
        <RequireRole roles={[Role.USER]}>
          <Success />
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/admin/documents/new',
    element: (
      <RequireAuth>
        <RequireRole roles={[Role.ADMIN]}>
          <UploadDocument />
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/admin/signatures',
    element: (
      <RequireAuth>
        <RequireRole roles={[Role.ADMIN, Role.SUPPORT]}>
          <Signatures />
        </RequireRole>
      </RequireAuth>
    ),
  },
])


