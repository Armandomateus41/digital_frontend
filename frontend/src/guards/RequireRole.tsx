import { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { Role, hasRole } from '../lib/rbac'
import { useSession } from '../lib/session'

export default function RequireRole({ roles, children }: PropsWithChildren<{ roles: Role[] }>) {
  const { data, isLoading } = useSession()
  if (isLoading) return <div className="p-6">Carregando...</div>
  if (!hasRole(data?.role, roles)) return <Navigate to="/login" replace />
  return children
}


