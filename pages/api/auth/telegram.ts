import type { NextApiRequest, NextApiResponse } from 'next'
import { setUserSessionCookie } from '@/lib/auth'
import { verifyTelegramInitData } from '@/lib/telegram'
import { connectToDB } from '@/lib/mongoose'
import { User } from '@/models/User'

/**
 * Autentica/cria usuário via Telegram initData (WebApp).
 * Espera { initData: string } no body.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Método não permitido')

  const { initData } = req.body || {}
  if (!initData || typeof initData !== 'string') {
    return res.status(400).send('initData inválido')
  }
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return res.status(500).send('BOT_TOKEN não configurado')

  const result = verifyTelegramInitData(initData, token)
  if (!result.ok || !result.user) {
    return res.status(401).send(result.error || 'Falha na verificação Telegram')
  }

  const tgUser = result.user as { id: number | string; username?: string; first_name?: string; last_name?: string; photo_url?: string }

  await connectToDB()
  const nowName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || null
  const userDoc: any = await User.findOneAndUpdate(
    { telegramId: String(tgUser.id) },
    {
      $set: {
        telegramUsername: tgUser.username || null,
        name: nowName,
        avatarUrl: tgUser.photo_url || null,
      },
      $setOnInsert: {
        telegramId: String(tgUser.id),
      }
    },
    { new: true, upsert: true }
  ).lean()

  // Define cookie de sessão do usuário
  setUserSessionCookie(res, String(userDoc?._id))

  return res.status(200).json({ ok: true })
}
