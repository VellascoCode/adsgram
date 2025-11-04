import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { connectToDB } from '@/lib/mongoose'
import { TaskCompletion } from '@/models/TaskCompletion'
import { Withdrawal } from '@/models/Withdrawal'
import { TaskCompletionStatus, WithdrawalStatus } from '@/lib/codes'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).send('Admin não autenticado')
  await connectToDB()
  const tasks = await TaskCompletion.find({ statusCode: TaskCompletionStatus.Pending }).sort({ createdAt: 1 }).limit(10).lean()
  const withdrawals = await Withdrawal.find({ statusCode: WithdrawalStatus.Pending }).sort({ createdAt: 1 }).limit(10).lean()
  console.log('[LOG] /api/admin/pending', { tasks: tasks.length, withdrawals: withdrawals.length })
  return res.status(200).json({
    tasks: tasks.map(t => ({ id: String(t._id), userId: String(t.userId), taskId: String(t.taskId), createdAt: t.createdAt })),
    withdrawals: withdrawals.map(w => ({ id: String(w._id), userId: String(w.userId), amountCents: w.amountCents, methodCode: w.methodCode, createdAt: w.createdAt }))
  })
}
