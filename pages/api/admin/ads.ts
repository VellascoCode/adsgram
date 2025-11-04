import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDB } from '@/lib/mongoose'
import { Ad } from '@/models/Ad'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await connectToDB()
    
    const ads = await Ad.find({})
      .sort({ createdAt: -1 })
      .lean()

    return res.status(200).json({ ads })
  } catch (error: any) {
    console.error('Error fetching ads:', error)
    return res.status(500).json({ error: error.message })
  }
}
