import { Schema, model, models, Types } from 'mongoose'

const UserSchema = new Schema({
  telegramId: { type: String, unique: true, required: true },
  telegramUsername: { type: String, default: null },
  name: { type: String, default: null },
  avatarUrl: { type: String, default: null },
  email: { type: String, default: null },
  walletAddress: { type: String, default: null },
  pixKey: { type: String, default: null },
  country: { type: String, default: null },
  state: { type: String, default: null },
  city: { type: String, default: null },
  preferredCategories: { type: [String], default: undefined },
  preferredTaskTypes: { type: [String], default: undefined },
  balanceCents: { type: Number, default: 0 },
  pendingBalanceCents: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
  referralCode: { type: String, unique: true, sparse: true, default: null },
  xpPoints: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  // Token descartável de login (gerado e enviado via bot; apagado após uso)
  loginCode: { type: String, default: null, index: true },
  loginCodeExpiresAt: { type: Date, default: null, index: true },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

export type UserDoc = {
  _id: Types.ObjectId
  telegramId: string
  telegramUsername?: string | null
  name?: string | null
  avatarUrl?: string | null
  email?: string | null
  walletAddress?: string | null
  pixKey?: string | null
  country?: string | null
  state?: string | null
  city?: string | null
  preferredCategories?: string[]
  preferredTaskTypes?: string[]
  balanceCents: number
  pendingBalanceCents: number
  isAdmin: boolean
  referralCode?: string | null
  xpPoints: number
  level: number
  loginCode?: string | null
  loginCodeExpiresAt?: Date | null
}

export const User = models.User || model('User', UserSchema)
