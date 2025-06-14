import { Schema, model } from 'mongoose'

// Define the Attendance schema
const attendanceSchema = new Schema({
  userid: {
    type: Schema.Types.ObjectId,
    ref: 'user', // Reference to the User model
    required: true
  },
  date: {
    type: String,
    required: true
  },
  present: {
    type: Boolean,
    default: false
  },
  leaveType: {
    type: String,
    enum: ['sick leave', 'casual leave', 'emergency leave', 'null', 'Holiday'],
    default: 'null'
  },
  leaveReason: {
    type: String,
    default: 'null'
  },
  timeIn: {
    type: String,
    default: ''
  },
  timeOut: {
    type: String,
    default: ''
  },
  totalHours: {
    type: Number,
    default: 0
  }
})

const calculateTotalHours = (timeIn, timeOut) => {
  const today = new Date()
  const timeInDate = new Date(today.toDateString() + ' ' + timeIn)
  const timeOutDate = new Date(today.toDateString() + ' ' + timeOut)

  if (timeInDate >= timeOutDate) {
    return 0
  }

  return (timeOutDate - timeInDate) / (1000 * 60 * 60)
}

attendanceSchema.pre('findOneAndUpdate', async function (next) {
  try {
    const update = this.getUpdate()
    const query = this.getQuery()

    // Fetch the current document based on the query
    const dataid = query.userid
    const doc = await this.model.findOne({ userid: dataid })

    if (!doc) {
      console.error('No document found for the given ID:', query._id)
      return next(new Error('Document not found'))
    }

    const timeIn = update.timeIn || doc.timeIn
    const timeOut = update.timeOut || doc.timeOut

    if (timeIn && timeOut) {
      update.totalHours = calculateTotalHours(timeIn, timeOut)
    } else {
      update.totalHours = 0
    }
  } catch (error) {
    console.error('Error in pre-update hook:', error)
    return next(error)
  }

  next()
})

// Create the Attendance model
const attendanceModel = model('attendance', attendanceSchema)

export default attendanceModel
