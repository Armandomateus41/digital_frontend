export type Problem = {
  type?: string
  title?: string
  detail?: string
  status?: number
  instance?: string
  code?: string
  requestId?: string
}

export async function parseProblem(response: Response): Promise<Problem | null> {
  const contentType = response.headers.get('content-type') || ''
  try {
    if (contentType.includes('application/problem+json') || contentType.includes('application/json')) {
      const data = await response.json()
      // Mapeia tanto RFC7807 quanto payloads comuns do NestJS { statusCode, message, code, requestId }
      return {
        type: data.type,
        title: data.title || data.error,
        detail: data.detail || data.message,
        status: data.status ?? data.statusCode ?? response.status,
        instance: data.instance,
        code: data.code,
        requestId: data.requestId,
      }
    }
    return null
  } catch {
    return {
      title: 'Erro na resposta',
      detail: 'Não foi possível ler o erro do servidor.',
      status: response.status,
    }
  }
}


