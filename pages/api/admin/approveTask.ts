import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { connectToDB } from '@/lib/mongoose'
import { TaskCompletion } from '@/models/TaskCompletion'
import { Task } from '@/models/Task'
import { User } from '@/models/User'
import { TaskCompletionStatus } from '@/lib/codes'

/**
 * Aprova ou rejeita uma submissão de tarefa.
 * Espera { id: string, approve: boolean }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Método não permitido')
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).send('Admin não autenticado')

  const { id, approve } = req.body || {}
  if (!id || typeof id !== 'string') return res.status(400).send('id inválido')

  await connectToDB()
  const tc: any = await TaskCompletion.findById(id).lean()
  if (!tc || tc.statusCode !== TaskCompletionStatus.Pending) return res.status(400).send('Submissão inválida')

  if (approve) {
    const task: any = await Task.findById(tc.taskId).lean()
    await TaskCompletion.updateOne({ _id: id }, { $set: { statusCode: TaskCompletionStatus.Approved, approvedAt: new Date(), approvedBy: 'admin' } })
    await Task.updateOne({ _id: tc.taskId }, { $inc: { completionsCount: 1 } })
    await User.updateOne({ _id: tc.userId }, { $inc: { balanceCents: task?.rewardCents ?? 0, xpPoints: 10 } })
    console.log('[LOG] /api/admin/approveTask APPROVED', { id, taskId: String(tc.taskId), userId: String(tc.userId), rewardCents: task?.rewardCents ?? 0 })
  } else {
    await TaskCompletion.updateOne({ _id: id }, { $set: { statusCode: TaskCompletionStatus.Rejected, approvedAt: new Date(), approvedBy: 'admin' } })
    console.log('[LOG] /api/admin/approveTask REJECTED', { id })
  }

  return res.status(200).json({ ok: true })
}
