import mongoose from 'mongoose'
import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'

import DB_URL from '../DB_URL.js' // when hosting locally
import User from '../models/userModel.js'
import Asset from '../models/assetModel.js'
import Transaction from '../models/transactionModel.js'

mongoose.connect(DB_URL) // when hosting locally
// mongoose.connect(process.env.DB_URL) // when hosting on the web
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('GET to DATABASE')
    const users = await User.find({}).exec()
    res.status(200).json(users)
  } catch (error) {
    next(error)
  }
}

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('POST to DATABASE')
    let password = await bcrypt.hash(req.body.password, 10)
    const newUser = new User({
      username: req.body.username,
      password: password,
      email: req.body.email,
      kokans: 0,
      first_name: '',
      last_name: '',
      pictureURL: './profile_picture.png',
      created: new Date(),
    })
    await newUser.save()
    return res.status(201).json(newUser)
  } catch (error) {
    next(error)
  }
}

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('GET to DATABASE')
    const user = await User.findOne({ _id: req.body.user._id }).exec()
    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('PUT to DATABASE')
    const searchCriterion = { username: req.body.username }
    await User.updateOne(searchCriterion, req.body)
    const updatedUser = await User.find(searchCriterion).exec()
    return res.status(200).json(updatedUser)
  } catch (error) {
    next(error)
  }
}

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('DELETE to DATABASE')
    console.log(req.body)
    const deletedUser = await User.deleteOne({ username: req.body.username })
    return res.status(201).json(deletedUser) // QQ 201?
  } catch (error) {
    next(error)
  }
}

export const getUserAssets = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('GET to DATABASE')
    console.log(req.body)
    const asset = await Asset.find({ owners: req.body.owner }).exec()
    res.status(200).json(asset)
  } catch (error) {
    next(error)
  }
}

export const getUserRequests = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('GET to DATABASE')
    console.log(req.body)
    let asset: any;
    if (req.body.query === "requestee") {
      asset = await Transaction.find({
      requestee: req.body.user._id,
    }).exec()}
    else if (req.body.query === "requester") {
      asset = await Transaction.find({
        requester: req.body.user._id,
      }).exec()
    }
    console.log(asset)
    res.status(200).json(asset)
  } catch (error) {
    next(error)
  }
}
