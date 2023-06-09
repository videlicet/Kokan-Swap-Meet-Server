import mongoose from 'mongoose'
import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'

/* import utils */
import { logger } from '../utils/Winston.js'

/* import models */
import User from '../models/userModel.js'
import Asset from '../models/assetModel.js'
import Transaction from '../models/transactionModel.js'

/* import aggregations */
import { aggregateUser } from '../aggregations/usersAggregations.js'

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
    logger.verbose('getUsers: GET USERS IN DATABASE')
    const users = await User.find({}).exec()
    return users
      ? res.status(200).json(users)
      : res.status(404).send('No users found.')
  } catch (err) {
    logger.error(`getUsers: ${err}`)
    next(err)
  }
}

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    logger.verbose('createUser: CREATE USER IN DATABASE')
    const password = await bcrypt.hash(req.body.password, 10)
    const newUser = new User({
      _id: new mongoose.Types.ObjectId(),
      username: req.body.username,
      password: password,
      email: req.body.email,
      email_verified: false,
      kokans: req.body.kokans,
      first_name: '',
      last_name: '',
      pictureURL: req.body.pictureURL,
      created: new Date().toISOString(),
    })
    const user = await newUser.save()
    return user
      ? res.status(201).json(user)
      : res.status(400).json({ message: 'No user created.' })
  } catch (err) {
    logger.error(`createUser: ${err}`)
    next(err)
  }
}

export const updateUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    logger.verbose('updateUsers: UPDATE USERS IN DB')
    const searchCriterion = req.body.users
    const changes = req.body.update.changes
    const result = await User.updateMany(searchCriterion, changes)
    return Object.keys(result).length !== 0
      ? res.status(200).send('Update successful.')
      : res.status(400).send('Update failed.')
  } catch (err) {
    logger.error(`updateUsers: ${err}`)
    next(err)
  }
}

export const checkUserExists = async (req: Request, res: Response) => {
  logger.verbose('checkUserExists: GET USER FROM DATABASE')
  try {
    const user = await User.findOne(
      { username: req.params.id },
      '-_id username',
    ).exec()
    if (user === null)
      return res.status(404).json({ message: 'No user found.' })
    return user != null || Object.keys(user).length !== 0
      ? res.status(200).json({ message: 'User found.' })
      : res.status(404).json({ message: 'No user found.' })
  } catch (err) {
    logger.error(`checkUserExists: ${err}`)
  }
}

export const getUser = async (
  req: Request & any, // TODO typing
  res: Response,
  next: NextFunction,
) => {
  logger.verbose('getUser: GET USER FROM DATABASE')
  try {
    /* search criterion depends on whether a username, a user id,
    or authData from the JWT authentication middleware (default) is present on the req */
    const searchCriterion = req.body.username
      ? ['$username', req.body.username]
      : req.body._id
      ? ['$_id', { $toObjectId: req.body.user._id }]
      : ['$username', req.authData.username]
    const user = await aggregateUser(searchCriterion)
    return Object.keys(user).length !== 0
      ? res.status(200).json(user)
      : res.status(404).json(user)
  } catch (err) {
    logger.error(`getUser: ${err}`)
    next(err)
  }
}

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    logger.verbose('updateUser: UPDATE USER IN DB')
    const searchCriterion = req.body.user.username
      ? { username: req.body.user.username }
      : { _id: req.body.user._id }
    let changes = req.body.update.changes
    if (req.body.update.changes.password) {
      const passwordCrypted = await bcrypt.hash(req.body.password, 10)
      changes = { password: passwordCrypted }
    }
    const result = await User.updateOne(searchCriterion, changes)
    return Object.keys(result).length !== 0
      ? res.status(200).send('Update successful.')
      : res.status(400).send('Update failed.')
  } catch (err) {
    logger.error(`updateUser: ${err}`)
    next(err)
  }
}

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    logger.verbose('deleteUser: DELETE USER IN DATABASE:')
    /* refund pending incoming transactions */
    logger.verbose('deleteUser: REFUND PENDING INCOMING TRANSACTIONS')
    const pendingIncomingTransactions = await Transaction.find({
      requestee: {
        $size: 1,
        $all: [req.body.user._id],
      },
      status: 'pending',
    }).exec()
    pendingIncomingTransactions.map(
      async (transaction) =>
        await User.updateOne(
          { _id: transaction.requester },
          {
            $inc: {
              kokans: transaction.kokans,
              kokans_pending: -transaction.kokans,
            },
          },
        ),
    )

    /* delete corresponding transcations */
    logger.verbose('deleteUser: – DELETE CORRESPONDING TRANSACTIONS')
    await Transaction.deleteMany({
      requestee: req.body.user._id,
    }).exec()
    await Transaction.deleteMany({
      requester: req.body.user._id,
    }).exec()

    /* delete/update corresponidng assets */
    logger.verbose('deleteUser: – DELETE/UPDATE CORRESPONDING ASSETS')
    await Asset.deleteMany({
      owners: [req.body.user._id],
    }).exec()
    await Asset.updateMany(
      { owners: req.body.user._id },
      { $pull: { owners: req.body.user._id } },
    ).exec()

    /* delete user */
    logger.verbose('deleteUser: – DELETE USER IN DATABASE')
    const deletedUser = await User.deleteOne({ _id: req.body.user._id })
    return deletedUser
      ? res.status(200).send('User deleted.')
      : res.status(400).send('No user deleted.')
  } catch (err) {
    logger.error(`deleteUser: ${err}`)
    next(err)
  }
}

export const getUserAssets = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    logger.verbose('getUserAssets: GET USER ASSETS FROM DATABASE:')
    /* find user's id in database */
    logger.verbose('getUserAssets: – GET USER FROM DATABASE')
    const [user] = await User.find({ username: req.body.owner }).exec()
    const { id } = user
    /* find assets owned by user in database */
    logger.verbose('getUserAssets: – GET ASSETS FROM DATABASE')
    const asset = await Asset.find({ owners: id }).sort({ created: -1 }).exec()
    return asset
      ? res.status(200).json(asset)
      : res.status(404).send('No user assets found.')
  } catch (err) {
    logger.error(`getUserAssets: ${err}`)
    next(err)
  }
}

export const getUserRequests = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    logger.verbose(`getUserRequests: GET USER REQUESTS FROM DATABASE`)
    let requests: any
    if (req.body.query === 'requestee') {
      requests = await Transaction.find({
        requestee: req.body.user._id,
      })
        .sort({ created: -1 })
        .exec()
    } else if (req.body.query === 'requester') {
      requests = await Transaction.find({
        requester: req.body.user._id,
      })
        .sort({ created: -1 })
        .exec()
    }
    return res.status(200).json(requests)
  } catch (err) {
    logger.error(`getUserRequests: ${err}`)
    next(err)
  }
}
