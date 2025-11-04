import type { NextApiRequest, NextApiResponse } from 'next'
import { setUserSessionCookie } from '@/lib/auth'
import { connectToDB } from '@/lib/mongoose'
import { User } from '@/models/User'

/**
 * Apenas para desenvolvimento/testes fora do Telegram.
 * Cria (se necessário) e loga um usuário pelo telegramId fornecido.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Método não permitido')
  const { telegramId } = req.body || {}
  const tid = String(telegramId ?? '0')

  await connectToDB()
  
  // Primeiro tentar buscar usuário existente
  let doc = await User.findOne({ telegramId: tid }).lean()
  
  // Se não existir, criar novo com referralCode único
  if (!doc) {
    const newUser = await User.create({
      telegramId: tid,
      name: tid === 'dev_user_test' ? 'Usuário de Teste DEV' : `User ${tid}`,
      telegramUsername: tid === 'dev_user_test' ? 'dev_tester' : null,
      referralCode: `DEV${Date.now()}`, // Referral code único
      balanceCents: 0,
      brlBalanceCents: 0,
      goldAds: 0,
    })
    doc = newUser.toObject()
  }

  const userId = String((doc as any)._id)
  setUserSessionCookie(res, userId)
  console.log('[LOG] /api/auth/dev-login - Usuário DEV logado:', userId)
  return res.status(200).json({ ok: true, userId })
}
