import type { NextApiRequest, NextApiResponse } from 'next'
import { getUserFromRequest } from '@/lib/auth'
import { connectToDB } from '@/lib/mongoose'
import { Task } from '@/models/Task'
import { TaskCompletion } from '@/models/TaskCompletion'
import { TaskStatus, TaskCompletionStatus } from '@/lib/codes'

/**
 * Submete conclusão de tarefa para revisão (status=pending).
 * Espera { taskId: string, proof?: string }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Método não permitido')
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).send('Não autenticado')

  const { taskId, proof } = req.body || {}
  if (!taskId || typeof taskId !== 'string') return res.status(400).send('taskId inválido')
  await connectToDB()
  const taskDoc: any = await Task.findById(taskId).lean()
  if (!taskDoc || taskDoc.statusCode !== TaskStatus.Active) return res.status(404).send('Tarefa não encontrada')

  await TaskCompletion.create({
    userId: user.id,
    taskId,
    statusCode: TaskCompletionStatus.Pending,
    proof: proof ? String(proof) : null,
  })

  console.log('[LOG] /api/tasks/submit', { userId: user.id, taskId, proof: proof ? String(proof).slice(0, 120) : null })

  return res.status(200).json({ ok: true })
}
