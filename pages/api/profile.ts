import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { getUserFromRequest } from '@/lib/auth'
import { connectToDB } from '@/lib/mongoose'
import { User } from '@/models/User'

const profileSchema = z.object({
  name: z.string().min(1).max(80).optional().nullable(),
  email: z.string().email().optional().nullable(),
  walletAddress: z.string().min(16).max(120).optional().nullable(),
  pixKey: z.string().min(5).max(120).optional().nullable(),
  country: z.string().min(1).max(56).optional().nullable(),
  state: z.string().min(1).max(56).optional().nullable(),
  city: z.string().min(1).max(56).optional().nullable(),
  preferredCategories: z.union([z.array(z.string().min(1).max(32)), z.string()]).optional(),
  preferredTaskTypes: z.union([z.array(z.string().min(1).max(32)), z.string()]).optional(),
})

function normalizeStr(v: unknown): string | null | undefined {
  if (v === undefined) return undefined
  if (v === null) return null
  const s = String(v).trim()
  return s.length ? s : null
}

function normalizeArray(input: unknown): string[] | undefined {
  if (input === undefined) return undefined
  if (Array.isArray(input)) {
    return input.map(x => String(x).trim()).filter(Boolean).slice(0, 10)
  }
  const s = String(input)
  const arr = s.split(',').map(x => x.trim()).filter(Boolean)
  return arr.slice(0, 10)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).send('Não autenticado')

  await connectToDB()

  if (req.method === 'GET') {
    const doc: any = await User.findById(user.id).lean()
    if (!doc) return res.status(404).send('Usuário não encontrado')
    return res.status(200).json({
      user: {
        id: String(doc._id),
        name: doc.name ?? '',
        email: doc.email ?? '',
        walletAddress: doc.walletAddress ?? '',
        pixKey: doc.pixKey ?? '',
        country: doc.country ?? '',
        state: doc.state ?? '',
        city: doc.city ?? '',
        preferredCategories: doc.preferredCategories ?? [],
        preferredTaskTypes: doc.preferredTaskTypes ?? [],
      }
    })
  }

  if (req.method === 'POST') {
    const parsed = profileSchema.safeParse(req.body || {})
    if (!parsed.success) {
      console.log('[LOG] /api/profile INVALID', parsed.error.flatten())
      return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    }

    const data = parsed.data

    // Normaliza strings vazias para null e listas CSV para arrays
    const update: any = {}
    if ('name' in data) update.name = normalizeStr(data.name as any)
    if ('email' in data) update.email = normalizeStr(data.email as any)
    if ('walletAddress' in data) update.walletAddress = normalizeStr(data.walletAddress as any)
    if ('pixKey' in data) update.pixKey = normalizeStr(data.pixKey as any)
    if ('country' in data) update.country = normalizeStr(data.country as any)
    if ('state' in data) update.state = normalizeStr(data.state as any)
    if ('city' in data) update.city = normalizeStr(data.city as any)
    if ('preferredCategories' in data) update.preferredCategories = normalizeArray(data.preferredCategories)
    if ('preferredTaskTypes' in data) update.preferredTaskTypes = normalizeArray(data.preferredTaskTypes)

    await User.updateOne({ _id: user.id }, { $set: update })
    console.log('[LOG] /api/profile UPDATED', { userId: user.id, fields: Object.keys(update) })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).send('Método não permitido')
}
