/* The userModel defines the data structure for users */

import mongoose from 'mongoose'
const { Schema, model } = mongoose

const userSchema = new Schema(
  {
    username: String,
    password: String,
    email: String,
    first_name: String,
    last_name: String,
    pictureURL: String,
    kokans: Number,
    created: String,
  },
  { collection: 'Users' },
)

const User = model('User', userSchema)

export default User
