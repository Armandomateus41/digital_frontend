import { useQuery } from '@tanstack/react-query'
import { apiGet } from './http'

export type Session = {
  authenticated: boolean
  role?: string
  cpf?: string
  email?: string
  exp?: number
}

export function useSession() {
  return useQuery<Session>({
    queryKey: ['session'],
    queryFn: async () => {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await fetch('/api/auth/session', { credentials: 'include', headers, cache: 'no-store' })
      return (await res.json()) as Session
    },
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    retry: false,
  })
}


