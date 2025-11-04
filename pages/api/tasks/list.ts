import type { NextApiRequest, NextApiResponse } from 'next'
import { getUserFromRequest } from '@/lib/auth'
import { connectToDB } from '@/lib/mongoose'
import { Task } from '@/models/Task'
import { TaskStatus, TaskType } from '@/lib/codes'

// Lista tarefas ativas; MVP: sem filtro por preferências ainda
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(200).json({ tasks: [] })

  await connectToDB()
  const rows = await Task.find({ statusCode: TaskStatus.Active })
    .sort({ createdAt: -1 })
    .limit(20)
    .select({ title: 1, typeCode: 1, rewardCents: 1 })
    .lean()
  const normalized = rows.map((t: any) => ({
    id: String(t._id),
    title: t.title,
    // Mapeamento simples de label para o front
    type: t.typeCode === TaskType.JoinTelegram ? 'join_telegram' : t.typeCode === TaskType.VisitSite ? 'visit_site' : t.typeCode === TaskType.SignupApp ? 'signup_app' : 'task',
    typeCode: t.typeCode,
    rewardCents: t.rewardCents ?? 0,
  }))
  return res.status(200).json({ tasks: normalized })
}
