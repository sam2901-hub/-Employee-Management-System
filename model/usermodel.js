import { Schema, model } from 'mongoose'

const userSchema = new Schema({
  firstname: String,
  lastname: String,
  mobile: Number,
  email: String,
  designation : String,
  role: {
    type: String,
    default: 'user'
  },
  password: {
    type: String,
    default: 0
  },
  tokenotp: {
    type: Number,
    default: 0
  },
  profileStatus: {
    type: String,
    default: 'pending'
  },
  userdeleted :{
    type: Boolean,
    default: false
  }
})

const userModel = model('user', userSchema)

export default userModel
