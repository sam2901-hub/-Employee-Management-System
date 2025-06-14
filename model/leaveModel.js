import { Schema, model } from 'mongoose'

const leaveSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  leaveType: { type: String, required: true },
  leaveReason: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
})

const leaveModel = model('leave', leaveSchema)

export default leaveModel
