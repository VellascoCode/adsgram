import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDB } from '@/lib/mongoose'
import { User } from '@/models/User'

/**
 * POST /api/auth/generate-token
 * Gera um token de 6 dígitos para autenticação web
 * - Público
 * - Token expira em 5 minutos (armazenado no próprio usuário)
 * - O código é enviado via Bot API (requer chat iniciado). Não retornamos o código no response.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { identifier } = (req.body || {}) as { identifier?: string }
    if (!identifier || typeof identifier !== 'string' || identifier.trim().length < 2) {
      return res.status(400).json({ error: 'Identifier inválido. Informe seu @usuario ou ID.' })
    }
    await connectToDB()

    // Normalizar identifier e localizar usuário existente
    const raw = identifier.trim()
    const isNumericId = /^\d{5,}$/.test(raw)
    const normalizedUsername = raw.startsWith('@') ? raw.slice(1) : raw

    let userDoc: any = null
    if (isNumericId) {
      userDoc = await User.findOne({ telegramId: raw }).lean()
    } else {
      userDoc = await User.findOne({ telegramUsername: normalizedUsername }).lean()
    }

    if (!userDoc) {
      // O usuário precisa ter aberto o WebApp ao menos uma vez para existir no banco
      return res.status(400).json({ error: 'Conta não encontrada. Abra o app pelo Telegram ao menos uma vez para vincular seu usuário.' })
    }

    // Gerar código de 6 dígitos aleatório
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Gravar código e expiração no próprio usuário (token descartável)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
    await User.updateOne({ _id: userDoc._id }, { $set: { loginCode: code, loginCodeExpiresAt: expiresAt } })

    const masked = `${code.slice(0, 2)}****`
    console.log('[LOG] /api/auth/generate-token SUCCESS', { maskedCode: masked, userId: String(userDoc._id), identifier: isNumericId ? raw : `@${normalizedUsername}` })
    return respondWithSendAttempt(res, code, userDoc.telegramId)
  } catch (error: any) {
    console.error('[ERROR] /api/auth/generate-token', error)
    return res.status(500).json({ error: error.message || 'Failed to generate token' })
  }
}

async function respondWithSendAttempt(res: NextApiResponse, code: string, chatId: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  let sent = false
  let reason: string | undefined

  // Só é possível enviar mensagem para usuários que já iniciaram conversa com o bot.
  // Se o identifier for um número (provável telegramId), tentamos enviar.
  if (botToken && /^\d{5,}$/.test(chatId)) {
    try {
      const r = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `Seu código de acesso AdsGram: ${code}\n\nVálido por 5 minutos. Não compartilhe este código.`,
        }),
      })
      const j = await r.json().catch(() => ({}))
      if (r.ok && j?.ok) sent = true
      else reason = j?.description || 'Falha ao enviar via Bot API'
    } catch (e: any) {
      reason = e?.message || 'Erro de rede ao enviar via Bot API'
    }
  } else if (!botToken) {
    reason = 'TELEGRAM_BOT_TOKEN ausente'
  } else {
    reason = 'chat_id inválido'
  }

  if (sent) {
    return res.status(200).json({ sent: true, message: 'Token enviado no Telegram' })
  }
  // Se não foi possível enviar, NÃO retornamos o código. Orientamos o usuário a iniciar o bot.
  return res.status(400).json({ sent: false, error: reason || 'Não foi possível enviar o token. Inicie uma conversa com o bot no Telegram e tente novamente.' })
}
