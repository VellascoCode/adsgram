import mongoose, { Document, Schema, Model } from 'mongoose'

export interface IToken extends Document {
  code: string // 6 dígitos (único)
  userId?: mongoose.Types.ObjectId // Opcional: token pode ser gerado sem user vinculado (admin gera, qualquer um usa)
  identifier?: string // Ex: telegramId numérico ou @username (normalizado)
  requestedIp?: string // IP de quem solicitou o token (auditoria/rate-limit)
  expiresAt: Date
  used: boolean
  usedAt?: Date
  createdAt: Date
}

const tokenSchema = new Schema<IToken>({
  code: { type: String, required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  identifier: { type: String, default: null, index: true },
  requestedIp: { type: String, default: null },
  expiresAt: { type: Date, required: true, index: true },
  used: { type: Boolean, default: false },
  usedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
})

// TTL index para auto-expirar tokens após 1 hora de criados (segurança extra)
tokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 })

const Token: Model<IToken> = mongoose.models.Token || mongoose.model<IToken>('Token', tokenSchema)

export default Token
