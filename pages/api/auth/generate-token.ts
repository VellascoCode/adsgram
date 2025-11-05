import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDB } from '@/lib/mongoose'
import Token from '@/models/Token'
import { User } from '@/models/User'

// Rate limit em memória (simples) por IP
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000 // 5 minutos
const RATE_LIMIT_MAX = 5 // máx. 5 solicitações/5min por IP
const ipHits = new Map<string, number[]>()

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const arr = ipHits.get(ip) || []
  const recent = arr.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  recent.push(now)
  ipHits.set(ip, recent)
  return recent.length <= RATE_LIMIT_MAX
}

/**
 * POST /api/auth/generate-token
 * Gera um token de 6 dígitos para autenticação web
 * - Público (com rate limit por IP)
 * - Token expira em 5 minutos
 * - Em produção, o código é enviado via Bot API se possível (chat privado já iniciado)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Rate limit por IP
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown'
    if (!rateLimit(String(ip))) {
      return res.status(429).json({ error: 'Muitas solicitações. Tente novamente em alguns minutos.' })
    }

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
      // Não geramos token para desconhecidos: o usuário deve primeiro iniciar o WebApp/bo t (cria o registro e mapeia username→chat_id)
      return res.status(400).json({ error: 'Conta não encontrada. Abra o app pelo Telegram ao menos uma vez para vincular seu usuário.' })
    }

    // Gerar código de 6 dígitos aleatório e garantir unicidade rapidamente
    let code = Math.floor(100000 + Math.random() * 900000).toString()
    // Em caso extremamente improvável, re-gerar uma vez
    if (await Token.findOne({ code }).lean()) {
      code = Math.floor(100000 + Math.random() * 900000).toString()
    }

    // Criar token no banco vinculado ao usuário e com auditoria
    const token = await Token.create({
      code,
      userId: userDoc._id,
      identifier: isNumericId ? raw : `@${normalizedUsername}`,
      requestedIp: String(ip),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutos
      used: false,
    })

    const masked = `${code.slice(0, 2)}****`
    console.log('[LOG] /api/auth/generate-token SUCCESS', { maskedCode: masked, userId: String(userDoc._id), identifier: token.identifier, ip })
    return respondWithSendAttempt(res, token.code, userDoc.telegramId)
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
