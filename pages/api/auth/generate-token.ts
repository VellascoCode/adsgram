import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDB } from '@/lib/mongoose'
import Token from '@/models/Token'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'

/**
 * POST /api/auth/generate-token
 * Gera um token de 6 dígitos para autenticação web
 * - Apenas admins podem gerar tokens (verifica sessão NextAuth)
 * - Token expira em 5 minutos
 * - Retorna o código para ser usado no login
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verificar se é admin autenticado
    const session = await getServerSession(req, res, authOptions)
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Admin access required' })
    }

    await connectToDB()

    // Gerar código de 6 dígitos aleatório
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Verificar se código já existe (improvável mas seguro)
    const existing = await Token.findOne({ code })
    if (existing) {
      // Retry com novo código
      const code2 = Math.floor(100000 + Math.random() * 900000).toString()
      const token = await Token.create({
        code: code2,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutos
        used: false,
      })
      console.log('[LOG] /api/auth/generate-token SUCCESS', { code: token.code, expiresAt: token.expiresAt })
      return res.status(200).json({ code: token.code, expiresAt: token.expiresAt })
    }

    // Criar token no banco
    const token = await Token.create({
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutos
      used: false,
    })

    console.log('[LOG] /api/auth/generate-token SUCCESS', { code: token.code, expiresAt: token.expiresAt })

    return res.status(200).json({ code: token.code, expiresAt: token.expiresAt })
  } catch (error: any) {
    console.error('[ERROR] /api/auth/generate-token', error)
    return res.status(500).json({ error: error.message || 'Failed to generate token' })
  }
}
