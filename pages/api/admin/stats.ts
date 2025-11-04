import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDB } from '@/lib/mongoose'
import { User } from '@/models/User'
import { Ad } from '@/models/Ad'
import { Task } from '@/models/Task'
import { AdView } from '@/models/AdView'
import { TaskCompletion } from '@/models/TaskCompletion'
import { Withdrawal } from '@/models/Withdrawal'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await connectToDB()
    
    const [
      usersCount,
      adsCount,
      tasksCount,
      adViewsCount,
      taskCompletionsCount,
      allTaskCompletionsCount,
      withdrawalsCount,
      allWithdrawalsCount
    ] = await Promise.all([
      User.countDocuments({}),
      Ad.countDocuments({}),
      Task.countDocuments({}),
      AdView.countDocuments({}),
      TaskCompletion.countDocuments({ statusCode: 0 }), // pending
      TaskCompletion.countDocuments({}), // all
      Withdrawal.countDocuments({ statusCode: 0 }), // pending
      Withdrawal.countDocuments({}) // all
    ])

    return res.status(200).json({
      users: usersCount,
      ads: adsCount,
      tasks: tasksCount,
      adViews: adViewsCount,
      pendingTaskCompletions: taskCompletionsCount,
      allTaskCompletions: allTaskCompletionsCount,
      pendingWithdrawals: withdrawalsCount,
      allWithdrawals: allWithdrawalsCount
    })
  } catch (error: any) {
    console.error('Error fetching stats:', error)
    return res.status(500).json({ error: error.message })
  }
}
