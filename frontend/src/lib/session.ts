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
      // usa cliente http centralizado (já injeta headers e base URL)
      const s = await apiGet<Session>('/auth/session')
      return s
    },
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    retry: false,
  })
}


