import { Schema, model } from 'mongoose'

const taskSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  taskno: {
    type: Number,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'delayed'],
    default: 'pending'
  },
  assignedTo: [{
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  duedate: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  delayedby: {
    type: Number,
    default: 0
  }
})

const taskModel = model('task', taskSchema)

export default taskModel


