import type { NextApiRequest, NextApiResponse } from 'next'
import { getUserFromRequest } from '@/lib/auth'
import { connectToDB } from '@/lib/mongoose'
import { User } from '@/models/User'
import { Withdrawal } from '@/models/Withdrawal'
import { WithdrawalMethod, WithdrawalStatus } from '@/lib/codes'

/**
 * Cria solicitação de saque (MVP: saca tudo do saldo disponível).
 * Espera { method: 0|1 } (0=USDT, 1=PIX) — aceita strings 'USDT'/'PIX' temporariamente
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Método não permitido')
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).send('Não autenticado')

  const { method } = req.body || {}
  let methodCode: 0 | 1
  if (method === 'USDT' || method === WithdrawalMethod.USDT) methodCode = WithdrawalMethod.USDT
  else if (method === 'PIX' || method === WithdrawalMethod.PIX) methodCode = WithdrawalMethod.PIX
  else return res.status(400).send('method inválido')

  await connectToDB()
  const freshUser: any = await User.findById(user.id).lean()
  const balanceCents = freshUser?.balanceCents ?? 0
  if (balanceCents <= 0) return res.status(400).send('Saldo insuficiente')

  // Mínimo 3 USDT -> 300 cents
  if (balanceCents < 300) return res.status(400).send('Mínimo de saque: 3 USDT')

  // Move saldo para pendente e cria solicitação (sequencial no MongoDB)
  await User.updateOne({ _id: user.id }, {
    $inc: { balanceCents: -balanceCents, pendingBalanceCents: balanceCents },
  })
  await Withdrawal.create({
    userId: user.id,
    amountCents: balanceCents,
    methodCode,
    pixKeySnapshot: methodCode === WithdrawalMethod.PIX ? (freshUser?.pixKey ?? null) : null,
    walletAddressSnapshot: methodCode === WithdrawalMethod.USDT ? (freshUser?.walletAddress ?? null) : null,
    statusCode: WithdrawalStatus.Pending
  })

  console.log('[LOG] /api/withdraw', { userId: user.id, methodCode, amountCents: balanceCents })

  return res.status(200).json({ ok: true })
}
