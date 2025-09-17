import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema({
  login: String,
  type: String,
  age: Number,
})

export default mongoose.models.User || mongoose.model('User', userSchema)
