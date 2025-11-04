import mongoose, { Document, Schema, Model } from 'mongoose'

export interface IToken extends Document {
  code: string // 6 dígitos (único)
  userId?: mongoose.Types.ObjectId // Opcional: token pode ser gerado sem user vinculado (admin gera, qualquer um usa)
  expiresAt: Date
  used: boolean
  createdAt: Date
}

const tokenSchema = new Schema<IToken>({
  code: { type: String, required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  expiresAt: { type: Date, required: true, index: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

// TTL index para auto-expirar tokens após 1 hora de criados (segurança extra)
tokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 })

const Token: Model<IToken> = mongoose.models.Token || mongoose.model<IToken>('Token', tokenSchema)

export default Token
