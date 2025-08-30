import { Request, Response, NextFunction } from 'express'

export function requestId(req: Request, res: Response, next: NextFunction) {
  let id = req.headers['x-request-id'] as string | undefined
  if (!id) id = crypto.randomUUID()
  res.setHeader('x-request-id', id)
  ;(req as any).requestId = id
  next()
}


