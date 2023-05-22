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
    console.log('GET USERS IN DATABASE')
    const users = await User.find({}).exec()
    return users
      ? res.status(200).json(users)
      : res.status(404).send('No users found.')
  } catch (err) {
    console.log(err)
    next(err)
  }
}

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('CREATE USER IN DATABASE')
    let password = await bcrypt.hash(req.body.password, 10)
    const newUser = new User({
      username: req.body.username,
      password: password,
      email: req.body.email,
      email_verified: req.body.email_verified,
      kokans: 0,
      first_name: '',
      last_name: '',
      pictureURL: req.body.pictureURL,
      created: new Date(),
    })
    const user = await newUser.save()
    return user
      ? res.status(201).json(user)
      : res.status(400).send('No user created.')
  } catch (err) {
    console.log(err)
    next(err)
  }
}

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('GET USER IN DATABASE')
    let user: any // TD typing
    // this logic changes the search criterion depending on whether a username or user id was provided
    // this is due to inconsistent provision of usernames/ids through frontend requests 
    // (e.g. login vs. user state updates)
    let criterion = req.body.username
      ? { username: req.body.username }
      : { _id: req.body.user._id }
    user = await User.findOne(criterion).exec()
    return user ? res.status(200).json(user) : res.status(404).json(user)
  } catch (err) {
    console.log(err)
    next(err)
  }
}

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('UPDATE USER IN DB:')
    let searchCriterion = req.body.user.username
      ? { username: req.body.user.username }
      : { _id: req.body.user._id }
    const result = await User.updateOne(
      searchCriterion,
      req.body.update.changes,
    )
    return result
      ? res.status(200).send('Update successful.')
      : res.status(400).send('Update failed.')
  } catch (err) {
    console.log(err)
    next(err)
  }
}

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('DELETE USER IN DATABASE:')
    /* delete corresponding transcations */
    console.log('– DELETE CORRESPONDING TRANSACTIONS')
    await Transaction.deleteMany({
      requestee: req.body.user._id,
    })
    await Transaction.deleteMany({
      requester: req.body.user._id,
    })

    /* delete/update corresponidng assets */
    console.log('– DELETE/UPDATE CORRESPONDING ASSETS')
    await Asset.deleteMany({
      owners: [req.body.user._id],
    })
    await Asset.updateMany(
      { owners: req.body.user._id },
      { $pull: { owners: req.body.user._id } },
    )

    /* delete user */
    console.log('– DELETE USER IN DATABASE')
    const deletedUser = await User.deleteOne({ _id: req.body.user._id })
    return deleteUser
      ? res.status(200).send('User deleted.')
      : res.status(400).send('No user deleted.')
  } catch (err) {
    console.log(err)
    next(err)
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
    return res.status(200).json(asset)
  } catch (err) {
    console.log(err)
    next(err)
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
  } catch (err) {
    console.log(err)
    next(err)
  }
}