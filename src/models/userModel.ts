/* The userModel defines the data structure for users */

import mongoose from 'mongoose'
const { Schema, model } = mongoose

const userSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    username: String,
    password: String,
    email: String,
    email_verified: Boolean,
    first_name: String,
    last_name: String,
    pictureURL: String,
    kokans: Number,
    kokans_pending: Number,
    created: String,
  },
  { collection: 'Users' },
)

const User = model('User', userSchema)

export default User
