import { Schema, model } from 'mongoose'

const commentSchema = new Schema({
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  taskid: {
    type: Schema.Types.ObjectId,
    ref: 'task',
    required: true
  },
  comment: String,
  date: Date
})

const commentModel = model('comments', commentSchema)

export default commentModel
