import { Request, Response, NextFunction } from 'express'

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const status = Number(err?.status || 500)
  const requestId = (req as any).requestId || req.headers['x-request-id']
  const problem = {
    type: err?.problem?.type || 'about:blank',
    title: err?.problem?.title || err?.name || 'Erro interno',
    status,
    detail: err?.problem?.detail || err?.message || 'Ocorreu um erro no servidor',
    instance: req.originalUrl,
    requestId,
    timestamp: new Date().toISOString(),
  }
  res.setHeader('content-type', 'application/problem+json')
  res.status(status).send(JSON.stringify(problem))
}


