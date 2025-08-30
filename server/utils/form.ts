import Busboy from 'busboy'
import type { Request } from 'express'

export async function parseMultipart(req: Request): Promise<{ fields: Record<string, string>; file?: { filename: string; data: Buffer; mimeType: string } }> {
  return new Promise((resolve, reject) => {
    const bb = Busboy({ headers: req.headers })
    const fields: Record<string, string> = {}
    let fileBuffer: Buffer | undefined
    let filename = ''
    let mimeType = ''

    bb.on('file', (_name, stream, info) => {
      filename = info.filename
      mimeType = info.mimeType
      const chunks: Buffer[] = []
      stream.on('data', (d: Buffer) => chunks.push(d))
      stream.on('end', () => {
        fileBuffer = Buffer.concat(chunks)
      })
    })

    bb.on('field', (name, val) => {
      fields[name] = val
    })

    bb.on('error', reject)
    bb.on('finish', () => {
      const file = fileBuffer ? { filename, data: fileBuffer, mimeType } : undefined
      resolve({ fields, file })
    })

    req.pipe(bb)
  })
}


