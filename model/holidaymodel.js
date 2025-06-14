import { Schema, model } from 'mongoose'

const holidaySchema = new Schema({
  leaveType: { type: String, default: 'Holiday' },
  leaveReason: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    default: 'approved'
  }
})

const holidayModel = model('holiday', holidaySchema)

export default holidayModel
