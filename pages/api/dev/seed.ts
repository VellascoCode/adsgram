import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDB } from '@/lib/mongoose'
import { Ad } from '@/models/Ad'
import { Task } from '@/models/Task'
import { AdStatus, Currency, MediaType, TaskStatus, TaskType } from '@/lib/codes'

/**
 * Seed de dados para DEV: cria 1 Ad e 1 Task caso não existam.
 * Somente disponível fora de produção.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV === 'production') return res.status(403).send('Forbidden')
  if (req.method !== 'POST') return res.status(405).send('Método não permitido')

  await connectToDB()
  const ad = await Ad.findOne().lean()
  const task = await Task.findOne().lean()

  let createdAd = ad
  let createdTask = task

  if (!ad) {
    createdAd = await Ad.create({
      title: 'Banner de Exemplo',
      categoryCode: 0,
      mediaTypeCode: MediaType.Image,
      mediaUrl: 'https://via.placeholder.com/600x300.png?text=AdsGram+Ad',
      targetUrl: 'https://example.com',
      duration: 10,
      rewardCents: 1, // $0.01
      budgetCents: 1000, // $10.00
      statusCode: AdStatus.Active,
      currencyCode: Currency.USD,
    })
  }

  if (!task) {
    createdTask = await Task.create({
      title: 'Entre no grupo Telegram XYZ',
      description: 'Clique no link e entre no grupo. Depois volte e conclua.',
      typeCode: TaskType.JoinTelegram,
      categoryCode: 0,
      rewardCents: 50, // $0.50
      maxCompletions: 100,
      statusCode: TaskStatus.Active,
      link: 'https://t.me/telegram',
    })
  }

  return res.status(200).json({ ok: true, ad: createdAd, task: createdTask })
}
