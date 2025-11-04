import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDB } from '@/lib/mongoose'
import { User } from '@/models/User'
import { verifyToken, signToken } from '@/lib/jwt'

/**
 * Lê o usuário autenticado a partir do cookie de sessão `adsgram_token`.
 * Retorna o registro do usuário (ou null, se não autenticado/inválido).
 */
export async function getUserFromRequest(req: NextApiRequest) {
  const cookie = parseCookie(req.headers.cookie || '')
  const token = cookie['adsgram_token']
  if (!token) return null
  const secret = process.env.JWT_SECRET || 'secret'
  const payload = verifyToken(token, secret)
  if (!payload?.sub) return null
  await connectToDB()
  const userDoc: any = await User.findById(payload.sub).lean()
  if (!userDoc) return null
  // Anexar campos esperados pelo restante do app
  return {
    ...userDoc,
    id: String(userDoc._id),
  } as any
}

/**
 * Define cookie httpOnly com JWT de sessão do usuário.
 */
export function setUserSessionCookie(res: NextApiResponse, userId: string) {
  const secret = process.env.JWT_SECRET || 'secret'
  const token = signToken({ sub: userId }, 60 * 60 * 24 * 30, secret) // 30 dias
  const isProd = process.env.NODE_ENV === 'production'
  res.setHeader('Set-Cookie', `adsgram_token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax; ${isProd ? 'Secure;' : ''}`)
}

function parseCookie(str: string) {
  return Object.fromEntries(
    str.split(';').map(v => v.trim()).filter(Boolean).map(v => {
      const idx = v.indexOf('=')
      if (idx === -1) return [v, '']
      return [decodeURIComponent(v.slice(0, idx)), decodeURIComponent(v.slice(idx + 1))]
    })
  ) as Record<string, string>
}
