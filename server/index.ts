import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'
import { apiRouter } from './apiRouter'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { requestId } from './middlewares/requestId'
import { errorHandler } from './middlewares/error'

const BFF_PORT = Number(process.env.BFF_PORT || 8787)
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || 'http://localhost:5173'

const app = express()

app.use(
  cors({
    origin: ALLOW_ORIGIN,
    credentials: true,
  }),
)
app.use(cookieParser())
app.use(requestId)

// Proxy pass-through ESPECÍFICO para upload antes de qualquer body parser
const proxyTarget = process.env.BACKEND_BASE_URL || 'http://localhost:3000'
app.use(
  '/api/admin/documents',
  createProxyMiddleware({
    target: proxyTarget,
    changeOrigin: false,
    xfwd: true,
    logLevel: 'silent',
    pathRewrite: { '^/api': '' },
    onProxyReq: (proxyReq, req) => {
      const rid = req.headers['x-request-id'] as string | undefined
      if (rid) proxyReq.setHeader('x-request-id', rid)
      const token = (req as any).cookies?.auth
      if (token) proxyReq.setHeader('authorization', `Bearer ${token}`)
      // NÃO setar content-type/content-length aqui – deixar o Node definir o boundary
    },
  }) as any,
)

// Body parser apenas após o proxy de upload
app.use(express.json({ limit: '2mb' }))

// Rotas específicas (session, login/logout) DEVEM vir antes do proxy genérico
app.use('/api', apiRouter)

// Proxy transparente para as demais rotas
app.use(
  '/api',
  createProxyMiddleware({
    target: proxyTarget,
    changeOrigin: false,
    xfwd: true,
    logLevel: 'silent',
    pathRewrite: { '^/api': '' },
    pathFilter: (path) => {
      // não proxiar as rotas de auth/session que o BFF trata
      if (/^\/api\/auth\//.test(path) || path === '/api/auth' || path === '/api/auth/session') return false
      // upload já foi tratado acima
      if (path === '/api/admin/documents') return false
      return true
    },
    onProxyReq: (proxyReq, req) => {
      const rid = req.headers['x-request-id'] as string | undefined
      if (rid) proxyReq.setHeader('x-request-id', rid)
      const token = (req as any).cookies?.auth
      if (token) proxyReq.setHeader('authorization', `Bearer ${token}`)
    },
  }) as any,
)

// Produção: servir SPA buildado
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, '../frontend/dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.use(errorHandler)

app.listen(BFF_PORT, () => {
  console.log(`[bff] listening on http://localhost:${BFF_PORT}`)
})


