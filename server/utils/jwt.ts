type Payload = {
  role?: string
  cpf?: string
  email?: string
  exp?: number
}

export function decodeJwtPayload(token: string | undefined | null): Payload {
  if (!token) return {}
  const parts = token.split('.')
  if (parts.length < 2) return {}
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = Buffer.from(base64, 'base64').toString('utf8')
    const data = JSON.parse(json)
    return { role: data.role, cpf: data.cpf, email: data.email, exp: data.exp }
  } catch {
    return {}
  }
}


