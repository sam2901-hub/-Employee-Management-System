import { Schema, model } from 'mongoose'

const bankDetailsSchema = new Schema(
  {
    branchName: { type: String, required: true },
    accountNumber: { type: Number, required: true },
    IFSC_code: { type: String, required: true }
  },
  { _id: false }
)

const educationDetailsSchema = new Schema(
  {
    degree: { type: String, required: true },
    stream: { type: String, required: true },
    passout_year: { type: String, required: true }
  },
  { _id: false }
)

const profileSchema = new Schema({
  userid: {
    type:Schema.Types.ObjectId,
    ref:"user"
  },
  firstname: String,
  lastname: String,
  mobile: Number,
  email: String,
  doj: Date,
  adhar: Number,
  pan: String,
  bankDetails: { type: bankDetailsSchema, required: true },
  education:  { type: educationDetailsSchema, required: true },
  address: String,
  city: String,
  state: String,
  country: String,
  blood_group: String,
  emmergency_no: String,
  images: {
    adhar: String,
    pan: String,
    photo: String,
    edu_certificate: String
  }
})

const profileModel = model('profile', profileSchema)

export default profileModel
