import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { connectToDB } from '@/lib/mongoose'
import { Withdrawal } from '@/models/Withdrawal'
import { User } from '@/models/User'
import { WithdrawalStatus } from '@/lib/codes'

/**
 * Marca uma solicitação de saque como paga e move saldo pendente.
 * Espera { id: string }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Método não permitido')
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).send('Admin não autenticado')

  const { id } = req.body || {}
  if (!id || typeof id !== 'string') return res.status(400).send('id inválido')

  await connectToDB()
  const wd: any = await Withdrawal.findById(id).lean()
  if (!wd || wd.statusCode !== WithdrawalStatus.Pending) return res.status(400).send('Saque inválido')

  await Withdrawal.updateOne({ _id: id }, { $set: { statusCode: WithdrawalStatus.Paid, paidAt: new Date(), paidBy: 'admin' } })
  await User.updateOne({ _id: wd.userId }, { $inc: { pendingBalanceCents: -wd.amountCents } })
  console.log('[LOG] /api/admin/markWithdrawPaid', { id, userId: String(wd.userId), amountCents: wd.amountCents })

  return res.status(200).json({ ok: true })
}
