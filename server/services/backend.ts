const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'https://digisign-flow-backend-42cn.onrender.com'
const API_VERSION = process.env.BACKEND_API_VERSION || 'v1'
const AUTH_PREFIX = process.env.BACKEND_AUTH_PREFIX || ''

function withRequestId(headers: Headers, requestId?: string) {
  if (requestId) headers.set('x-request-id', requestId)
  return headers
}

export async function login(identifier: string, password: string, requestId?: string): Promise<{ accessToken: string }> {
  const url = `${BACKEND_BASE_URL}${AUTH_PREFIX}/auth/login`
  const headers = withRequestId(new Headers({ 'content-type': 'application/json' }), requestId)
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ identifier, password }) })
  if (!res.ok) {
    const problem = await res.text()
    console.error('[bff] login failed', {
      status: res.status,
      url,
      requestId,
      body: { identifier: maskIdentifier(identifier) },
      problem,
    })
    const err: any = new Error('Login failed')
    err.status = res.status
    err.problem = safeParse(problem)
    throw err
  }
  return (await res.json()) as { accessToken: string }
}

export async function userNextDoc(jwt: string | undefined, requestId?: string): Promise<Response> {
  const url = `${BACKEND_BASE_URL}/${API_VERSION}/user/documents/next`
  const headers = withRequestId(new Headers({ Authorization: `Bearer ${jwt}` }), requestId)
  return fetch(url, { method: 'GET', headers })
}

export async function userSign(jwt: string | undefined, body: any, idempotencyKey: string, requestId?: string): Promise<Response> {
  const url = `${BACKEND_BASE_URL}/${API_VERSION}/user/sign`
  const headers = withRequestId(
    new Headers({
      Authorization: `Bearer ${jwt}`,
      'content-type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    }),
    requestId,
  )
  return fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })
}

export async function adminUpload(req: any, jwt: string | undefined, requestId?: string): Promise<Response> {
  const headers = withRequestId(new Headers({ Authorization: `Bearer ${jwt}` }), requestId)
  // reconstruir FormData
  const { parseMultipart } = await import('../utils/form')
  const { fields, file } = await parseMultipart(req)
  const form = new FormData()
  form.set('title', fields.title)
  if (file) {
    form.set('file', new Blob([file.data], { type: file.mimeType }), file.filename)
  }
  // Log de diagnóstico do payload e boundary
  try {
    const probe = new Request('http://localhost/', { method: 'POST', body: form })
    const contentType = probe.headers.get('content-type') || ''
    console.log('[bff] adminUpload payload', {
      requestId,
      title: fields.title,
      file: file ? { filename: file.filename, mimeType: file.mimeType, size: file.data.length } : null,
      contentType,
    })
  } catch (e) {
    console.warn('[bff] adminUpload probe failed', e)
  }
  // tenta com versão primeiro
  let res = await fetch(`${BACKEND_BASE_URL}/${API_VERSION}/admin/documents`, { method: 'POST', headers, body: form })
  if (res.status === 404) {
    // fallback sem versão
    res = await fetch(`${BACKEND_BASE_URL}/admin/documents`, { method: 'POST', headers, body: form })
  }
  if (!res.ok) {
    try {
      const t = await res.clone().text()
      console.error('[bff] adminUpload backend error', { requestId, status: res.status, body: t })
    } catch {}
  }
  return res
}

export async function adminSignatures(jwt: string | undefined, requestId?: string): Promise<Response> {
  const headers = withRequestId(new Headers({ Authorization: `Bearer ${jwt}` }), requestId)
  let res = await fetch(`${BACKEND_BASE_URL}/${API_VERSION}/admin/signatures`, { method: 'GET', headers })
  if (res.status === 404) {
    res = await fetch(`${BACKEND_BASE_URL}/admin/signatures`, { method: 'GET', headers })
  }
  return res
}

function safeParse(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return { title: 'Erro', detail: text }
  }
}

function maskIdentifier(id: string) {
  if (!id) return ''
  if (/^\d+$/.test(id)) {
    return id.slice(0, 3) + '******' + id.slice(-2)
  }
  const [name, domain] = id.split('@')
  if (!domain) return '****'
  return (name?.slice(0, 2) || '') + '****@' + domain
}


