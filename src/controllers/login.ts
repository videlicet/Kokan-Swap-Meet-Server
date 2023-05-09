import mongoose from 'mongoose'
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import DB_URL from '../DB_URL.js' // when hosting locally
import SECRET_KEY from '../SECRET_KEY.js'
import User from '../models/userModel.js'
import { NONAME } from 'dns'

mongoose.connect(DB_URL) // when hosting locally
// mongoose.connect(process.env.DB_URL) // when hosting on the web
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('POST to DATABASE')
  // find user in db
  const user = await User.findOne({ username: req.body.username }).exec()
  
  if (!user) {
    return res.status(404).json({ message: 'User not found.' })
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
        secure: true,
        sameSite: 'none' as const, // as const necessary because sameSite is not included on the CookieOptions type
        expires: new Date(Date.now() + 11000), // TD change this
      }
      res.set('Access-Control-Allow-Origin', 'http://localhost:5173') // this is necessarry because it means that the server allows cookies to be included in cross-origin requests
      res.status(201).cookie('token', accessToken, options).send('success')
    } catch (error) {
      return res.status(500).json({ message: error.message, errors: error.errors })
    }
  } else return res.status(401).json({message: 'Password incorrect.'})
}


export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('GET to DATABASE')
  console.log(req.headers)
  res.status(200).send(req.headers)
  // find user in db
  // const user = await User.findOne({ username: req.body.username }).exec()
  
  // if (!user) {
  //   return res.status(404).json({ message: 'User not found.' })
  // }
  // // compare send password with stored password
  // const passwordCorrect = await bcrypt.compare(req.body.password, user.password)

  // if (user && passwordCorrect == true) {
  //   try {
  //     // create access token
  //     let accessToken = jwt.sign(
  //       { username: req.body.username, password: req.body.password },
  //       SECRET_KEY,
  //     )
  //     // create a response cookie
  //     const options = {
  //       httpOnly: true,
  //       secure: true,
  //       sameSite: 'none' as const, // as const necessary because sameSite is not included on the CookieOptions type
  //       expires: new Date(Date.now() + 11000), // TD change this
  //     }
  //     res.set('Access-Control-Allow-Origin', 'http://localhost:5173') // this is necessarry because it means that the server allows cookies to be included in cross-origin requests
  //     res.status(201).cookie('token', accessToken, options).send('success')
  //   } catch (error) {
  //     return res.status(500).json({ message: error.message, errors: error.errors })
  //   }
  // } else return res.status(401).json({message: 'Password incorrect.'})
}
