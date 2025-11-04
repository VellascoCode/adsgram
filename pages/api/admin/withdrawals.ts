import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDB } from '@/lib/mongoose'
import { Withdrawal } from '@/models/Withdrawal'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await connectToDB()
    
    const withdrawals = await Withdrawal.find({})
      .populate('userId', 'telegramUsername name telegramId')
      .sort({ requestDate: -1 })
      .lean()

    return res.status(200).json({ withdrawals })
  } catch (error: any) {
    console.error('Error fetching withdrawals:', error)
    return res.status(500).json({ error: error.message })
  }
}
