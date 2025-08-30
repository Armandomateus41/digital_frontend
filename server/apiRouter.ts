import { Router } from 'express'
import { decodeJwtPayload } from './utils/jwt'
import { setAuthCookie, clearAuthCookies } from './utils/cookies'
import * as backend from './services/backend'

export const apiRouter = Router()
apiRouter.use((req, _res, next) => {
  // garantir que possamos ler JSON também nas rotas que não sejam multipart
  // o index.ts já usa express.json, aqui somente seguimos
  next()
})

apiRouter.post('/auth/login', async (req, res, next) => {
  try {
    const { identifier, password } = req.body || {}
    const { accessToken } = await backend.login(identifier, password, req.headers['x-request-id'] as string | undefined)
    setAuthCookie(res, accessToken)
    const payload = decodeJwtPayload(accessToken)
    res.cookie('role', payload.role || '', { httpOnly: false, sameSite: 'Lax' })
    return res.json({ ok: true, role: payload.role, exp: payload.exp })
  } catch (err) {
    next(err)
  }
})

apiRouter.post('/auth/logout', async (_req, res) => {
  clearAuthCookies(res)
  return res.json({ ok: true })
})

apiRouter.get('/auth/session', (req, res) => {
  const token = req.cookies?.auth
  if (!token) return res.json({ authenticated: false })
  const payload = decodeJwtPayload(token)
  return res.json({ authenticated: true, role: payload.role, cpf: payload.cpf, email: payload.email, exp: payload.exp })
})

apiRouter.get('/user/documents/next', async (req, res, next) => {
  try {
    const token = req.cookies?.auth
    const response = await backend.userNextDoc(token, req.headers['x-request-id'] as string | undefined)
    if (response.status === 200) {
      return res.status(200).json(await response.json())
    }
    // Alguns ambientes podem responder 404 quando não há próximo documento.
    if (response.status === 404) {
      return res.sendStatus(204)
    }
    return res.sendStatus(response.status)
  } catch (err) {
    next(err)
  }
})

apiRouter.post('/user/sign', async (req, res, next) => {
  try {
    const token = req.cookies?.auth
    const idempotencyKey = (req.headers['idempotency-key'] as string) || crypto.randomUUID()
    const response = await backend.userSign(token, req.body, idempotencyKey, req.headers['x-request-id'] as string | undefined)
    res.status(response.status)
    const ct = response.headers.get('content-type') || ''
    if (ct.includes('application/json')) return res.json(await response.json())
    return res.end()
  } catch (err) {
    next(err)
  }
})

apiRouter.post('/admin/documents', async (req, res, next) => {
  try {
    const token = req.cookies?.auth
    const requestId = req.headers['x-request-id'] as string | undefined
    const response = await backend.adminUpload(req, token, requestId)
    const ct = response.headers.get('content-type') || ''
    const location = response.headers.get('location') || undefined
    const etag = response.headers.get('etag') || undefined
    console.log('[bff] /admin/documents backend', {
      requestId,
      status: response.status,
      contentType: ct,
      location,
      etag,
    })
    if (!response.ok) {
      const bodyText = await response.text().catch(() => '')
      console.error('[bff] /admin/documents error body', { requestId, bodyText })
      res.status(response.status)
      if (ct.includes('application/json')) return res.send(bodyText)
      return res.end()
    }
    if (location) res.setHeader('location', location)
    if (etag) res.setHeader('etag', etag)
    res.status(response.status)
    if (ct.includes('application/json')) return res.json(await response.json())
    return res.end()
  } catch (err) {
    next(err)
  }
})

apiRouter.get('/admin/signatures', async (req, res, next) => {
  try {
    const token = req.cookies?.auth
    const response = await backend.adminSignatures(token, req.headers['x-request-id'] as string | undefined)
    res.status(response.status)
    const ct = response.headers.get('content-type') || ''
    if (ct.includes('application/json')) return res.json(await response.json())
    return res.end()
  } catch (err) {
    next(err)
  }
})


