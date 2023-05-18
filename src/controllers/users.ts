import mongoose from 'mongoose'
import { Request, Response, NextFunction } from 'express'

import bcrypt from 'bcrypt'

import User from '../models/userModel.js'
import Asset from '../models/assetModel.js'
import Transaction from '../models/transactionModel.js'

/* mongoose */
mongoose.connect(process.env.DB_URL)
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
    if (user) {
      return res.status(200).json(user)
    } else {
      return res.status(404).json(user)
    }
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
    console.log('UPDATE USER in DB')
    const searchCriterion = { _id: req.body.user._id }
    const result = await User.updateOne(
      searchCriterion,
      req.body.update.changes,
    ) // this should be the res status reason!
    if (!result) return res.status(400).send('update failed')
    const updatedUser = await User.find(searchCriterion).exec()
    return res.status(200).json(updatedUser) // TD this just sends a 200 if it finds the user, it should send a 200 if the update was successfull
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
    /* delete corresponding transcations */
    const deletedTransactionsRequestee = await Transaction.deleteMany({
      requestee: req.body.user._id,
    })
    const deletedTransactionsRequester = await Transaction.deleteMany({
      requester: req.body.user._id,
    })

    /* delete/update corresponidng assets */
    const deletedAssets = await Asset.deleteMany({
      owners: [req.body.user._id],
    })
    const updatedAssets = await Asset.updateMany(
      { owners: req.body.user._id },
      { $pull: { owners: req.body.user._id } },
    )

    /* delete user */
    const deletedUser = await User.deleteOne({ _id: req.body.user._id })
    return res.status(200).json(deletedUser)
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
    let asset: any
    if (req.body.query === 'requestee') {
      asset = await Transaction.find({
        requestee: req.body.user._id,
      }).exec()
    } else if (req.body.query === 'requester') {
      asset = await Transaction.find({
        requester: req.body.user._id,
      }).exec()
    }
    res.status(200).json(asset)
  } catch (error) {
    next(error)
  }
}

