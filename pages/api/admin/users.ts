import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDB } from '@/lib/mongoose'
import { User } from '@/models/User'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await connectToDB()
    
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .lean()

    return res.status(200).json({ users })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return res.status(500).json({ error: error.message })
  }
}
