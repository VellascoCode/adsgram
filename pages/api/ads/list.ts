import type { NextApiRequest, NextApiResponse } from 'next'
import { getUserFromRequest } from '@/lib/auth'
import { connectToDB } from '@/lib/mongoose'
import { Ad } from '@/models/Ad'
import { UserDaily } from '@/models/UserDaily'
import { AdStatus } from '@/lib/codes'

// Lista anúncios ativos; no MVP, retorna todos ativos por enquanto (pode filtrar por preferências depois)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(200).json({ ads: [] })

  await connectToDB()

  // Busca IDs já vistos hoje para filtrar
  const today = new Date()
  const y = today.getFullYear()
  const m = today.getMonth() + 1
  const d = today.getDate()
  const yyyymmdd = y * 10000 + m * 100 + d
  const daily = await UserDaily.findOne({ userId: user.id, yyyymmdd }).lean()
  const seenIds: any[] = ((daily as any)?.adsSeenIds as any[]) || []

  // Somente anúncios ativos e com orçamento para pelo menos +1 view
  const rows = await Ad.find({
    statusCode: AdStatus.Active,
    _id: { $nin: seenIds },
    $expr: {
      $gte: [
        '$budgetCents',
        { $multiply: ['$rewardCents', { $add: ['$viewsCount', 1] }] }
      ]
    }
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .select({ title: 1, rewardCents: 1 })
    .lean()

  const normalized = rows.map((a: any) => ({
    id: String(a._id),
    title: a.title,
    // Mantém a API simples; categoria textual opcional não é enviada.
    rewardCents: a.rewardCents ?? 0,
  }))
  return res.status(200).json({ ads: normalized })
}
