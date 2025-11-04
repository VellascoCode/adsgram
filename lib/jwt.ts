import crypto from 'crypto'

// Implementação mínima de JWT HS256 para cookie de sessão do usuário final.
// NOTA: Para produção, considere usar uma biblioteca consolidada (ex.: jose) e rotação de chaves.

function base64url(input: Buffer | string) {
  return (input instanceof Buffer ? input : Buffer.from(input))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

export type UserTokenPayload = {
  sub: string // userId
  iat: number
  exp: number
}

export function signToken(payload: Omit<UserTokenPayload, 'iat' | 'exp'>, ttlSeconds: number, secret: string) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + ttlSeconds
  const full = { ...payload, iat, exp }
  const headerB64 = base64url(JSON.stringify(header))
  const payloadB64 = base64url(JSON.stringify(full))
  const data = `${headerB64}.${payloadB64}`
  const sig = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest()
  const sigB64 = base64url(sig)
  return `${data}.${sigB64}`
}

export function verifyToken(token: string, secret: string): UserTokenPayload | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [headerB64, payloadB64, sigB64] = parts
  const data = `${headerB64}.${payloadB64}`
  const expected = base64url(crypto.createHmac('sha256', secret).update(data).digest())
  if (expected !== sigB64) return null
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8')) as UserTokenPayload
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && now > payload.exp) return null
    return payload
  } catch {
    return null
  }
}
