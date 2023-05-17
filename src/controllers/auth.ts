import mongoose from 'mongoose'
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import User from '../models/userModel.js'

mongoose.connect(process.env.DB_URL)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('POST to DATABASE')
  /*  find user in db */
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
        { username: req.body.username },
        process.env.SECRET_KEY,
      )
      // create a response cookie
      const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const, // as const necessary because sameSite is not included on the CookieOptions type
        maxAge: 10000000,
      }
      res.status(200).cookie('token', accessToken, options).json(user)
    } catch (error) {
      return res
        .status(500)
        .json({ message: error.message, errors: error.errors })
    }
  } else return res.status(401).json({ message: 'Password incorrect.' })
}

/* type for authData in jwt.verify() */

interface JwtPayload {
  username: string
  password: string
}

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(req.headers.cookie)
  if (req.headers.cookie) {
    console.log('JWT verification')
    const key = req.headers.cookie.split(' ')[0].slice(6)
    jwt.verify(
      key,
      process.env.SECRET_KEY,
      async (err, authData: JwtPayload) => {
        if (err) {
          res.status(403).json({
            success: false,
            message: 'JWT authentication failed',
          })
        }
        console.log('GET to DATABASE')
        // find user in db
        const user = await User.findOne({ username: authData.username }).exec()
        if (!user) {
          return res.status(404).json({ message: 'User not found.' })
        }
        res.status(200).json(user)
      },
    )
  } else {
    res.status(403).json({
      success: false,
      message: 'Authentication failed',
    })
  }
}

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('CLEAR COOKIE')
  try {
    res
      .clearCookie('token', { path: '/', sameSite: 'none', secure: true })
      .sendStatus(200)
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message, errors: error.errors })
  }
}
