import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDB } from '@/lib/mongoose'
import { User } from '@/models/User'
import { setUserSessionCookie } from '@/lib/auth'

/**
 * POST /api/auth/verify-token
 * Verifica token de 6 dígitos e cria sessão JWT
 * - Valida se existe um usuário com loginCode igual e não expirado
 * - Limpa o loginCode após uso (token descartável)
 * - Cria sessão para o usuário correto
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

    // Buscar usuário com esse loginCode válido
    const user = await User.findOne({ loginCode: code, loginCodeExpiresAt: { $gt: new Date() } })
    if (!user) {
      console.log('[LOG] /api/auth/verify-token FAILED - Código inválido/expirado')
      return res.status(401).json({ error: 'Token inválido ou expirado' })
    }

    // Limpar token descartável
    await User.updateOne({ _id: user._id }, { $set: { loginCode: null, loginCodeExpiresAt: null } })

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
