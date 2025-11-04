import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDB } from '@/lib/mongoose'
import Token from '@/models/Token'
import { User } from '@/models/User'
import { signToken } from '@/lib/jwt'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

/**
 * POST /api/auth/verify-token
 * Verifica token de 6 dígitos e cria sessão JWT
 * - Valida se token existe, não expirou e não foi usado
 * - Marca token como usado
 * - Cria/busca usuário guest (sem telegramId)
 * - Cria sessão JWT e seta cookie
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

    // Marcar token como usado
    token.used = true
    await token.save()

    // Buscar ou criar usuário guest (sem telegramId)
    // Para simplificar: cada token gera um usuário temporário OU usa um user guest fixo
    // Vamos usar approach: user guest fixo com telegramId especial (ex: 0)
    let user = await User.findOne({ telegramId: '0' })
    if (!user) {
      // Criar user guest
      user = await User.create({
        telegramId: '0',
        telegramUsername: 'guest',
        name: 'Guest User',
        email: '',
        walletAddress: '',
        pixKey: '',
        country: '',
        state: '',
        city: '',
        preferredCategories: [],
        preferredTaskTypes: [],
        balanceCents: 0,
        brlBalanceCents: 0,
        goldAds: 0,
        level: 1,
        xpPoints: 0,
        referralCode: 'GUEST',
        isAdmin: false,
      })
    }

    // Criar JWT usando lib interna
    const jwtToken = signToken({ sub: user._id.toString() }, 7 * 24 * 60 * 60, JWT_SECRET)

    // Setar cookie httpOnly
    res.setHeader('Set-Cookie', `adsgram_token=${jwtToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`)

    console.log('[LOG] /api/auth/verify-token SUCCESS', { code, userId: user._id })

    return res.status(200).json({ success: true, user: { id: user._id, name: user.name } })
  } catch (error: any) {
    console.error('[ERROR] /api/auth/verify-token', error)
    return res.status(500).json({ error: error.message || 'Failed to verify token' })
  }
}
