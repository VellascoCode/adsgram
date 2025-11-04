import { Schema, model, models, Types } from 'mongoose'

const AdViewSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  adId: { type: Schema.Types.ObjectId, ref: 'Ad', required: true },
  viewedAt: { type: Date, default: Date.now },
  yyyymmdd: { type: Number, required: true },
  credited: { type: Boolean, default: true },
})

AdViewSchema.index({ userId: 1, adId: 1 })
AdViewSchema.index({ userId: 1, yyyymmdd: 1 })

export type AdViewDoc = {
  _id: Types.ObjectId
  userId: Types.ObjectId
  adId: Types.ObjectId
  viewedAt: Date
  yyyymmdd: number
  credited: boolean
}

export const AdView = models.AdView || model('AdView', AdViewSchema)
