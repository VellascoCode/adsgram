import { Schema, model, models, Types } from 'mongoose'

// Códigos numéricos (mais leves no banco)
// statusCode: 0=inativo, 1=ativo, 2=finalizado, 3=pausado
// mediaTypeCode: 0=image, 1=video, 2=html
// currencyCode: 0=USD, 1=BRL
const AdSchema = new Schema({
  title: { type: String, required: true },
  categoryCode: { type: Number, default: null },
  mediaTypeCode: { type: Number, required: true },
  mediaUrl: { type: String, required: true },
  targetUrl: { type: String, default: null },
  duration: { type: Number, default: 10 },
  rewardCents: { type: Number, required: true },
  budgetCents: { type: Number, required: true },
  viewsCount: { type: Number, default: 0 },
  statusCode: { type: Number, default: 1 },
  currencyCode: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } })

export type AdDoc = {
  _id: Types.ObjectId
  title: string
  categoryCode?: number | null
  mediaTypeCode: number
  mediaUrl: string
  targetUrl?: string | null
  duration: number
  rewardCents: number
  budgetCents: number
  viewsCount: number
  statusCode: number
  currencyCode: number
}

export const Ad = models.Ad || model('Ad', AdSchema)
