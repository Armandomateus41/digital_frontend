import { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../lib/session'

export default function RequireAuth({ children }: PropsWithChildren) {
  const { data, isLoading } = useSession()
  const location = useLocation()

  if (isLoading) return <div className="p-6">Carregando...</div>
  if (!data?.authenticated) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}


