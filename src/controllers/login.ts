import mongoose from 'mongoose'
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import DB_URL from '../DB_URL.js' // when hosting locally
import SECRET_KEY from '../SECRET_KEY.js'
import User from '../models/userModel.js'

mongoose.connect(DB_URL) // when hosting locally
// mongoose.connect(process.env.DB_URL) // when hosting on the web
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('GET to DATABASE')
  // find user in db
  const user = await User.findOne({ username: req.body.username }).exec()
  
  if (!user) {
    return res.status(400).json({ message: 'No such user.' })
  }
  // compare send password with stored password
  const passwordCorrect = await bcrypt.compare(req.body.password, user.password)

  if (user && passwordCorrect == true) {
    try {
      // create access token
      let accessToken = jwt.sign(
        { username: req.body.username, password: req.body.password },
        SECRET_KEY,
      )
      // create a response cookie
      const options = {
        httpOnly: true,
        expires: new Date(Date.now() + 9000000), // change this
      }
      return res.status(201).cookie('token', accessToken, options).send('Cookie created')
    } catch (error) {
      return res.status(500).json({ message: error.message, errors: error.errors })
    }
  } else return
}
