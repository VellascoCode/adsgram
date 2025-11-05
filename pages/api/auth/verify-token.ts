import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDB } from '@/lib/mongoose'
import Token from '@/models/Token'
import { User } from '@/models/User'
import { setUserSessionCookie } from '@/lib/auth'

/**
 * POST /api/auth/verify-token
 * Verifica token de 6 dígitos e cria sessão JWT
 * - Valida se token existe, não expirou e não foi usado
 * - Marca token como usado
 * - Usa userId vinculado ao token para criar sessão do usuário correto
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { code } = req.body

  if (!code || typeof code !== 'string' || code.length !== 6) {
    return res.status(400).json({ error: 'Token inválido (deve ter 6 dígitos)' })
  }

  try {
    await connectToDB()

  // Buscar token no banco
  const token = await Token.findOne({ code })

    if (!token) {
      console.log('[LOG] /api/auth/verify-token FAILED - Token not found', { code })
      return res.status(401).json({ error: 'Token inválido ou expirado' })
    }

    // Verificar se token já foi usado
    if (token.used) {
      console.log('[LOG] /api/auth/verify-token FAILED - Token already used', { code })
      return res.status(401).json({ error: 'Token já foi utilizado' })
    }

    // Verificar se token expirou
    if (new Date() > token.expiresAt) {
      console.log('[LOG] /api/auth/verify-token FAILED - Token expired', { code, expiresAt: token.expiresAt })
      return res.status(401).json({ error: 'Token expirado' })
    }

    // Token precisa estar vinculado a um usuário
    if (!token.userId) {
      console.log('[LOG] /api/auth/verify-token FAILED - Token sem userId vinculado')
      return res.status(401).json({ error: 'Token inválido para login' })
    }

    const user = await User.findById(token.userId)
    if (!user) {
      console.log('[LOG] /api/auth/verify-token FAILED - userId inexistente', { userId: String(token.userId) })
      return res.status(401).json({ error: 'Usuário não encontrado' })
    }

    // Marcar token como usado
    token.used = true
    token.usedAt = new Date()
    await token.save()

    // Setar cookie httpOnly da sessão do usuário correto
    setUserSessionCookie(res, String(user._id))

    const masked = `${code.slice(0, 2)}****`
    console.log('[LOG] /api/auth/verify-token SUCCESS', { maskedCode: masked, userId: String(user._id) })

    return res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('[ERROR] /api/auth/verify-token', error)
    return res.status(500).json({ error: error.message || 'Failed to verify token' })
  }
}
