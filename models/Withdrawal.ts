import { Schema, model, models, Types } from 'mongoose'

// methodCode: 0=USDT, 1=PIX
// statusCode: 0=pending, 1=paid, 2=cancelled
const WithdrawalSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  requestDate: { type: Date, default: Date.now },
  amountCents: { type: Number, required: true },
  methodCode: { type: Number, required: true },
  pixKeySnapshot: { type: String, default: null },
  walletAddressSnapshot: { type: String, default: null },
  statusCode: { type: Number, default: 0 },
  paidAt: { type: Date, default: null },
  paidBy: { type: String, default: null },
  txId: { type: String, default: null },
})

export type WithdrawalDoc = {
  _id: Types.ObjectId
  userId: Types.ObjectId
  requestDate: Date
  amountCents: number
  methodCode: 0 | 1
  pixKeySnapshot?: string | null
  walletAddressSnapshot?: string | null
  statusCode: 0 | 1 | 2
  paidAt?: Date | null
  paidBy?: string | null
  txId?: string | null
}

export const Withdrawal = models.Withdrawal || model('Withdrawal', WithdrawalSchema)
