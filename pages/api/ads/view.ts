import type { NextApiRequest, NextApiResponse } from 'next'
import { getUserFromRequest } from '@/lib/auth'
import { connectToDB } from '@/lib/mongoose'
import { Ad } from '@/models/Ad'
import { AdView } from '@/models/AdView'
import { User } from '@/models/User'
import { UserDaily } from '@/models/UserDaily'
import { AdStatus } from '@/lib/codes'

/**
 * Marca visualização de anúncio e credita recompensa (MVP simplificado, sem validação de 10s).
 * Espera { adId: string } no body.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Método não permitido')
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).send('Não autenticado')

  const { adId } = req.body || {}
  if (!adId || typeof adId !== 'string') return res.status(400).send('adId inválido')
  await connectToDB()
  const adDoc: any = await Ad.findById(adId).lean()
  if (!adDoc || adDoc.statusCode !== AdStatus.Active) return res.status(404).send('Anúncio não encontrado')
  // Verifica orçamento disponível para +1 view
  const hasBudget = (adDoc.budgetCents ?? 0) >= (adDoc.rewardCents ?? 0) * (Number(adDoc.viewsCount ?? 0) + 1)
  if (!hasBudget) return res.status(400).send('Anúncio sem orçamento')

  // Controle diário: impede mais de 1 view por dia no mesmo anúncio
  const today = new Date()
  const y = today.getFullYear()
  const m = today.getMonth() + 1
  const d = today.getDate()
  const yyyymmdd = y * 10000 + m * 100 + d
  // Bloqueio: se já visto hoje, retorna 409
  const alreadyDoc = await UserDaily.findOne({ userId: user.id, yyyymmdd, adsSeenIds: adId }).lean()
  if (alreadyDoc) return res.status(409).send('Anúncio já visto hoje')

  await UserDaily.findOneAndUpdate(
    { userId: user.id, yyyymmdd },
    { $setOnInsert: { userId: user.id, yyyymmdd }, $set: { updatedAt: new Date() }, $addToSet: { adsSeenIds: adId } },
    { new: true, upsert: true }
  ).lean()

  // Logs e créditos
  console.log('[LOG] /api/ads/view', { userId: user.id, adId, yyyymmdd, rewardCents: adDoc.rewardCents })
  await AdView.create({ userId: user.id, adId, yyyymmdd })
  await Ad.updateOne({ _id: adId }, { $inc: { viewsCount: 1 } })
  await User.updateOne({ _id: user.id }, { $inc: { balanceCents: adDoc.rewardCents } })

  return res.status(200).json({ ok: true })
}
