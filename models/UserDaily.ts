import { Schema, model, models, Types } from 'mongoose'

// Registro diário por usuário para saber o que já foi executado no dia.
// yyyymmdd: número no formato AAAAMMDD
const UserDailySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  yyyymmdd: { type: Number, required: true },
  adsSeenIds: { type: [Schema.Types.ObjectId], default: [] },
  tasksDoneIds: { type: [Schema.Types.ObjectId], default: [] },
  updatedAt: { type: Date, default: Date.now },
})

UserDailySchema.index({ userId: 1, yyyymmdd: 1 }, { unique: true })

export type UserDailyDoc = {
  _id: Types.ObjectId
  userId: Types.ObjectId
  yyyymmdd: number
  adsSeenIds: Types.ObjectId[]
  tasksDoneIds: Types.ObjectId[]
  updatedAt: Date
}

export const UserDaily = models.UserDaily || model('UserDaily', UserDailySchema)
