import { Schema, model, models, Types } from 'mongoose'

// statusCode: 0=inativa, 1=ativa, 2=finalizada
// typeCode: 0=join_telegram, 1=visit_site, 2=signup_app, ... (códigos livres)
// categoryCode: código numérico de categoria
const TaskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  typeCode: { type: Number, required: true },
  categoryCode: { type: Number, default: null },
  rewardCents: { type: Number, required: true },
  maxCompletions: { type: Number, required: true },
  completionsCount: { type: Number, default: 0 },
  statusCode: { type: Number, default: 1 },
  link: { type: String, default: null },
  code: { type: String, default: null },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } })

export type TaskDoc = {
  _id: Types.ObjectId
  title: string
  description: string
  typeCode: number
  categoryCode?: number | null
  rewardCents: number
  maxCompletions: number
  completionsCount: number
  statusCode: number
  link?: string | null
  code?: string | null
}

export const Task = models.Task || model('Task', TaskSchema)
