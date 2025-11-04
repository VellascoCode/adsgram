import { Schema, model, models, Types } from 'mongoose'

// statusCode: 0=pending, 1=approved, 2=rejected
const TaskCompletionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  submissionAt: { type: Date, default: Date.now },
  statusCode: { type: Number, default: 0 },
  proof: { type: String, default: null },
  approvedAt: { type: Date, default: null },
  approvedBy: { type: String, default: null },
})

TaskCompletionSchema.index({ userId: 1, taskId: 1 })

export type TaskCompletionDoc = {
  _id: Types.ObjectId
  userId: Types.ObjectId
  taskId: Types.ObjectId
  submissionAt: Date
  statusCode: 0 | 1 | 2
  proof?: string | null
  approvedAt?: Date | null
  approvedBy?: string | null
}

export const TaskCompletion = models.TaskCompletion || model('TaskCompletion', TaskCompletionSchema)
