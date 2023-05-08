import mongoose from 'mongoose'
import { Request, Response, NextFunction } from 'express'
import DB_URL from '../DB_URL.js' // when hosting locally
import User from '../models/userModel.ts'

mongoose.connect(DB_URL) // when hosting locally
// mongoose.connect(process.env.DB_URL) // when hosting on the web
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('GET to DATABASE')
    const users = await User.find({}).exec()
    res.status(200).json(users)
  } catch (error) {
    next(error)
  }
}

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('POST to DATABASE')
    const newUser = new User(req.body)
    await newUser.save()
    return res.status(201).json(newUser)
  } catch (error) {
    next(error)
  }
}

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('GET to DATABASE')
    const user = await User.find({}).exec() //specify what to search fo
    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('PUT to DATABASE')
    await User.updateMany() // not update Many, how to decide what to update? just all of it?
    const updatedUser = await User.find({}).exec()
    return res.status(200).json(updatedUser)
  } catch (error) {
    next(error)
  }
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('DELETE to DATABSE')
    console.log(req.body)
    const deletedUser = await User.deleteMany({}) // delete ONE
    return res.status(201).json(deletedUser) // QQ 201?
  } catch (error) {
    next(error)
  }
}
