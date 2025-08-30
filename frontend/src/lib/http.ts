import { env } from './env'
import { parseProblem } from './problem'

function ensureRequestId(headers: Headers): string {
  let id = headers.get('x-request-id') || ''
  if (!id) {
    id = crypto.randomUUID()
    headers.set('x-request-id', id)
  }
  return id
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) {
      // Sem conteúdo → padroniza como null para evitar undefined no React Query
      return null as unknown as T
    }
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      return (await response.json()) as T
    }
    // Quando não houver corpo, retornamos undefined explicitamente tipado
    return undefined as unknown as T
  }
  const problem = await parseProblem(response)
  if (problem) {
    const error = new Error(problem.detail || problem.title || 'Erro na requisição') as Error & {
      problem?: typeof problem
      status?: number
      requestId?: string
    }
    error.problem = problem
    error.status = problem.status
    error.requestId = response.headers.get('x-request-id') || undefined
    throw error
  }
  const generic = new Error(`Erro HTTP ${response.status}`) as Error & { status?: number; requestId?: string }
  generic.status = response.status
  generic.requestId = response.headers.get('x-request-id') || undefined
  throw generic
}

export async function apiGet<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  ensureRequestId(headers)
  const token = localStorage.getItem('accessToken')
  if (token && !headers.has('authorization')) headers.set('authorization', `Bearer ${token}`)
  const res = await fetch(`${env.bffBase}${path}`, {
    method: 'GET',
    credentials: 'include',
    ...init,
    headers,
  })
  return handleResponse<T>(res)
}

export async function apiPost<T = unknown>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  ensureRequestId(headers)
  headers.set('content-type', 'application/json')
  const token = localStorage.getItem('accessToken')
  if (token && !headers.has('authorization')) headers.set('authorization', `Bearer ${token}`)
  const res = await fetch(`${env.bffBase}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
    ...init,
    headers,
  })
  return handleResponse<T>(res)
}

export async function apiPostForm<T = unknown>(path: string, form: FormData, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  ensureRequestId(headers)
  const token = localStorage.getItem('accessToken')
  if (token && !headers.has('authorization')) headers.set('authorization', `Bearer ${token}`)
  const res = await fetch(`${env.bffBase}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: form,
    ...init,
    headers,
  })
  return handleResponse<T>(res)
}


