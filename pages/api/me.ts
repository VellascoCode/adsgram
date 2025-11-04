import type { NextApiRequest, NextApiResponse } from 'next'
import { getUserFromRequest } from '@/lib/auth'

// Retorna dados básicos do usuário autenticado (para header/saldo)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Headers para NUNCA cachear esta resposta
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  
  const user = await getUserFromRequest(req)
  
  // CRÍTICO: Se não tem usuário, retornar 401 (não autorizado), não 200
  if (!user) {
    console.log('[LOG] /api/me - Sem sessão válida (401)')
    return res.status(401).json({ error: 'Não autorizado' })
  }
  
  console.log('[LOG] /api/me - Sessão válida para usuário:', user.id)
  return res.status(200).json({
    user: {
      id: user.id,
      name: user.name,
      telegramId: String(user.telegramId),
      balance: (user.balanceCents ?? 0) / 100,
      balanceCents: user.balanceCents ?? 0,
      brlBalanceCents: user.brlBalanceCents ?? 0,
      goldAds: user.goldAds ?? 0,
    }
  })
}
