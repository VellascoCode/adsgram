import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDB } from '@/lib/mongoose'
import { TaskCompletion } from '@/models/TaskCompletion'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await connectToDB()
    
    const taskCompletions = await TaskCompletion.find({})
      .populate('userId', 'telegramUsername name telegramId')
      .populate('taskId', 'title rewardCents typeCode')
      .sort({ submissionAt: -1 })
      .lean()

    return res.status(200).json({ taskCompletions })
  } catch (error: any) {
    console.error('Error fetching task completions:', error)
    return res.status(500).json({ error: error.message })
  }
}
