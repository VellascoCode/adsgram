import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDB } from '@/lib/mongoose'
import { AdView } from '@/models/AdView'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await connectToDB()
    
    const adViews = await AdView.find({})
      .populate('userId', 'telegramUsername name telegramId')
      .populate('adId', 'title mediaUrl rewardCents')
      .sort({ viewedAt: -1 })
      .lean()

    return res.status(200).json({ adViews })
  } catch (error: any) {
    console.error('Error fetching ad views:', error)
    return res.status(500).json({ error: error.message })
  }
}
