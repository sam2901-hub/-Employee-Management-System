import { Schema, model } from 'mongoose'

const compProfileSchema = new Schema({
  name: String,
  registrationNo: Number,
  gstNo: Number,
  address: String,
  email: String,
  contactNo: Number,
  fyStart: String,
  fyEnd: String
})

const compProfileModel = model('compProfile', compProfileSchema)

export default compProfileModel
