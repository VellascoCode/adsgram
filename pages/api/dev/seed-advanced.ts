import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDB } from '@/lib/mongoose'
import { User } from '@/models/User'
import { Ad } from '@/models/Ad'
import { Task } from '@/models/Task'
import { AdView } from '@/models/AdView'
import { TaskCompletion } from '@/models/TaskCompletion'
import { Withdrawal } from '@/models/Withdrawal'
import { UserDaily } from '@/models/UserDaily'

/**
 * SEED AVANÇADO (DEV ONLY)
 * Popula banco com dados realistas para testar painel admin:
 * - 10 usuários
 * - 15 anúncios (mix de status)
 * - 20 tarefas (mix de status)
 * - Views e completions variadas
 * - 8 saques (pending/paid)
 * - UserDaily entries
 * 
 * POST /api/dev/seed-advanced
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Bloquear em produção
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Seed bloqueado em produção' })
  }

  await connectToDB()

  try {
    console.log('[LOG] /api/dev/seed-advanced START')

    // Limpar dados anteriores (opcional - comente se quiser acumular)
    // await Promise.all([
    //   User.deleteMany({}),
    //   Ad.deleteMany({}),
    //   Task.deleteMany({}),
    //   AdView.deleteMany({}),
    //   TaskCompletion.deleteMany({}),
    //   Withdrawal.deleteMany({}),
    //   UserDaily.deleteMany({})
    // ])

    const now = Date.now()
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')

    // 1. CRIAR USUÁRIOS
    const userNames = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy']
    const users = []
    for (let i = 0; i < userNames.length; i++) {
      const u = await User.create({
        telegramId: `seed_user_${Date.now()}_${i + 1}`,
        telegramUsername: userNames[i].toLowerCase(),
        name: userNames[i],
        balanceCents: Math.floor(Math.random() * 50000), // 0 a $500
        pixKey: i % 3 === 0 ? `pix${i}_${Date.now()}@example.com` : undefined,
        walletAddress: i % 3 === 1 ? `0xSEED${i}${Date.now().toString(36)}abcdef` : undefined,
        preferredCategories: ['0', '1', '2'],
        preferredTaskTypes: ['0', '1', '2'],
        referralCode: `REF${Date.now()}${i}`,
        xpPoints: Math.floor(Math.random() * 5000),
        level: Math.floor(Math.random() * 10) + 1,
        createdAt: new Date(now - Math.random() * 30 * 24 * 60 * 60 * 1000) // últimos 30 dias
      })
      users.push(u)
    }

    // 2. CRIAR ANÚNCIOS (variados status)
    const adCategories = [0, 1, 2, 3, 4]
    const adTitles = [
      'Compre Cripto Agora',
      'NFT Exclusivo à Venda',
      'App de Finanças Grátis',
      'Game Play-to-Earn',
      'Curso Web3 Completo',
      'Token Launch Hoje',
      'Staking com 20% APY',
      'Metaverse Land Sale',
      'DAO Governance Token',
      'DeFi Yield Farm',
      'Airdrop Grátis',
      'Wallet Segura',
      'Exchange Nova',
      'Mining Pool',
      'Smart Contract Audit'
    ]
    const ads = []
    for (let i = 0; i < adTitles.length; i++) {
      const statusCode = i < 8 ? 1 : (i < 12 ? 0 : (i < 14 ? 2 : 3)) // mix: ativo, inativo, finalizado, pausado
      const ad = await Ad.create({
        title: adTitles[i],
        mediaUrl: `https://via.placeholder.com/600x400?text=Ad${i + 1}`,
        mediaTypeCode: i % 3 === 0 ? 1 : 0, // video ou image
        categoryCode: adCategories[i % adCategories.length],
        targetUrl: `https://example.com/ad${i + 1}`,
        duration: 10,
        rewardCents: 50 + Math.floor(Math.random() * 200), // $0.50 a $2.50
        budgetCents: statusCode === 1 ? 10000 + Math.floor(Math.random() * 50000) : 0,
        viewsCount: Math.floor(Math.random() * 500),
        statusCode,
        currencyCode: 0
      })
      ads.push(ad)
    }

    // 3. CRIAR TAREFAS (variados status)
    const taskTitles = [
      'Siga no Twitter',
      'Entre no Telegram',
      'Visite Website',
      'Cadastre-se no App',
      'Compartilhe Post',
      'Assista Vídeo',
      'Comente no Blog',
      'Baixe Whitepaper',
      'Conecte Wallet',
      'Vote na Proposta',
      'Faça Quiz',
      'Convide Amigo',
      'Complete Tutorial',
      'Faça Depósito',
      'Staking Mínimo',
      'KYC Verification',
      'Join Discord',
      'Reddit Upvote',
      'LinkedIn Follow',
      'YouTube Subscribe'
    ]
    const tasks = []
    for (let i = 0; i < taskTitles.length; i++) {
      const statusCode = i < 12 ? 1 : (i < 17 ? 0 : 2) // mix: ativa, inativa, finalizada
      const task = await Task.create({
        title: taskTitles[i],
        description: `Complete a tarefa "${taskTitles[i]}" e ganhe recompensa!`,
        typeCode: i % 5,
        categoryCode: (i % 4) + 1,
        rewardCents: 100 + Math.floor(Math.random() * 400), // $1 a $5
        maxCompletions: 100 + Math.floor(Math.random() * 900), // 100 a 1000
        completionsCount: statusCode === 2 ? Math.floor(Math.random() * 50) : 0,
        statusCode,
        link: `https://example.com/task${i + 1}`,
        code: i % 4 === 0 ? `CODE${i}${Date.now()}` : null
      })
      tasks.push(task)
    }

    // 4. CRIAR AD VIEWS (alguns usuários viram alguns ads)
    const adViews = []
    for (let i = 0; i < 30; i++) {
      const user = users[Math.floor(Math.random() * users.length)]
      const ad = ads[Math.floor(Math.random() * Math.min(8, ads.length))] // apenas ads ativos
      if (ad.statusCode === 1) {
        const daysAgo = Math.floor(Math.random() * 7)
        const viewDate = new Date(now - daysAgo * 24 * 60 * 60 * 1000)
        const yyyymmdd = parseInt(viewDate.toISOString().slice(0, 10).replace(/-/g, ''))
        const view = await AdView.create({
          userId: user._id,
          adId: ad._id,
          yyyymmdd,
          viewedAt: viewDate,
          credited: true
        })
        adViews.push(view)
      }
    }

    // 5. CRIAR TASK COMPLETIONS (pending, approved, rejected)
    const completions = []
    for (let i = 0; i < 25; i++) {
      const user = users[Math.floor(Math.random() * users.length)]
      const task = tasks[Math.floor(Math.random() * Math.min(12, tasks.length))] // apenas tasks ativas
      if (task.statusCode === 1) {
        const statusCode = i < 8 ? 0 : (i < 20 ? 1 : 2) // mix: pending, approved, rejected
        const submissionDate = new Date(now - Math.random() * 10 * 24 * 60 * 60 * 1000)
        const completion = await TaskCompletion.create({
          userId: user._id,
          taskId: task._id,
          proof: `Prova da tarefa ${task.title} - screenshot_${i + 1}.png`,
          statusCode,
          submissionAt: submissionDate,
          approvedAt: statusCode > 0 ? new Date(submissionDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000) : null,
          approvedBy: statusCode > 0 ? 'admin' : null
        })
        completions.push(completion)
      }
    }

    // 6. CRIAR WITHDRAWALS (pending e paid)
    const withdrawals = []
    for (let i = 0; i < 8; i++) {
      const user = users[Math.floor(Math.random() * users.length)]
      const methodCode = i % 2 // 0=USDT, 1=PIX
      const amountCents = methodCode === 0 ? 1000 + Math.floor(Math.random() * 9000) : 2000 + Math.floor(Math.random() * 18000)
      const statusCode = i < 3 ? 0 : 1 // 3 pending, 5 paid
      const withdrawal = await Withdrawal.create({
        userId: user._id,
        methodCode,
        amountCents,
        pixKeySnapshot: methodCode === 1 ? `pix_${i}@example.com` : null,
        walletAddressSnapshot: methodCode === 0 ? `0xWITHDRAW${i}abc` : null,
        statusCode,
        requestDate: new Date(now - Math.random() * 15 * 24 * 60 * 60 * 1000),
        paidAt: statusCode === 1 ? new Date(now - Math.random() * 10 * 24 * 60 * 60 * 1000) : null,
        paidBy: statusCode === 1 ? 'admin' : null,
        txId: statusCode === 1 ? `TX${Date.now()}${i}` : null
      })
      withdrawals.push(withdrawal)
    }

    // 7. CRIAR ALGUNS USER DAILY (para simular uso) - usando updateOne com upsert para evitar duplicatas
    const userDailyPairs = new Set<string>()
    for (let i = 0; i < 15; i++) {
      const user = users[Math.floor(Math.random() * users.length)]
      const dayOffset = Math.floor(Math.random() * 7)
      const date = new Date(now - dayOffset * 24 * 60 * 60 * 1000)
      const yyyymmdd = parseInt(date.toISOString().slice(0, 10).replace(/-/g, ''))
      
      const pairKey = `${user._id.toString()}_${yyyymmdd}`
      if (userDailyPairs.has(pairKey)) continue // pula se já criamos esse par
      userDailyPairs.add(pairKey)
      
      // Pegar alguns ads e tasks aleatórios dos que criamos
      const randomAds = ads.filter(() => Math.random() > 0.7).slice(0, 3).map(a => a._id)
      const randomTasks = tasks.filter(() => Math.random() > 0.7).slice(0, 2).map(t => t._id)
      
      await UserDaily.updateOne(
        { userId: user._id, yyyymmdd },
        { 
          $setOnInsert: { userId: user._id, yyyymmdd },
          $addToSet: { 
            adsSeenIds: { $each: randomAds },
            tasksDoneIds: { $each: randomTasks }
          }
        },
        { upsert: true }
      )
    }

    const stats = {
      users: users.length,
      ads: ads.length,
      tasks: tasks.length,
      adViews: adViews.length,
      taskCompletions: completions.length,
      withdrawals: withdrawals.length,
      pendingTasks: completions.filter(c => c.statusCode === 0).length,
      pendingWithdrawals: withdrawals.filter(w => w.statusCode === 0).length
    }

    console.log('[LOG] /api/dev/seed-advanced DONE', stats)

    res.json({ 
      success: true, 
      message: 'Banco populado com sucesso!',
      stats
    })
  } catch (err: any) {
    console.error('[LOG] /api/dev/seed-advanced ERROR', err)
    res.status(500).json({ error: err.message })
  }
}
