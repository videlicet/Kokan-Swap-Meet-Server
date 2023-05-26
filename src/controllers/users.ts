import mongoose, { ObjectId } from 'mongoose'
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
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
      email_verified: false,
      kokans: req.body.kokans,
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

/* type for authData in jwt.verify() */
interface JwtPayload {
  username: string
  password: string
}

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("GET AGGREGATED USER FROM DATABASE:")
  try {
    /* this logic changes the search criterion depending on whether a username or a user id was provided in the body;
    this is necessary due to inconsistent provision of usernames/ids through frontend requests to this controller
    (e.g. login -> username vs. user state updates -> id) */


    let criterion = req.body.username
      ? ['$username', req.body.username]
      : ['$_id', { $toObjectId: req.body.user._id }]

      console.log("req.headers: ", req.headers.cookie)
      console.log("id: ", req.body.user?._id, "username", req.body.username)
    /* check if cookie present and overwrite search criterion*/
    if (req.headers.cookie) {
      console.log('COOKIE PRESENT –> JWT VERIFICATION: ')
      const key = req.cookies.token
      jwt.verify(key, process.env.SECRET_KEY, async (err, authData: JwtPayload) => { // TD typing
        if (!err) {
          console.log('– SUCCESS')
          criterion = ['$username', authData.username];
        } else {
          console.log('–X FAILURE')
          return res.status(403).json({
            success: false,
            message: 'JWT verification failed.',
          })
        }
      })} else {
        res.status(403).json({
          success: false,
          message: 'X JWT VERFIFICATION FAILURE',
        })
      }


    const [user] = await User.aggregate([
      {
        /* use user id from client to query user */
        $match: {
          $expr: {
            $eq: criterion,
          },
        },
      },
      {
        $addFields: {
          userId: { $toString: '$_id' },
        },
      },
      /* aggregrate user id with the number of total assets */
      {
        $lookup: {
          from: 'Assets',
          localField: 'userId',
          foreignField: 'owners',
          as: 'assets_total',
        },
      },
      {
        $addFields: {
          assets_count: { $size: '$assets_total' },
        },
      },

      /* aggregrate user id with the number of assets on offer */
      {
        $lookup: {
          from: 'Assets',
          let: { userId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$onOffer', true] },
                    { $in: ['$$userId', '$owners'] },
                  ],
                },
              },
            },
          ],
          as: 'assets_offered',
        },
      },

      /* aggregrate user id with the number of pending incoming requests */
      {
        $lookup: {
          from: 'Transactions',
          let: { userId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$status', 'pending'] },
                    { $in: ['$$userId', '$requestee'] },
                  ],
                },
              },
            },
          ],
          as: 'requests_incoming_pending',
        },
      },

      /* aggregrate user id with the number of pending outgoing requests */
      {
        $lookup: {
          from: 'Transactions',
          let: {
            userId: '$userId',
            requesterId: { $toObjectId: '$requester' },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$status', 'pending'] },
                    { $eq: ['$requester', '$$userId'] },
                  ],
                },
              },
            },
          ],
          as: 'requests_outgoing_pending',
        },
      },

      {
        $addFields: {
          assets_count_offered: { $size: '$assets_offered' },
          requests_incoming_count_pending: {
            $size: '$requests_incoming_pending',
          },
          requests_outgoing_count_pending: {
            $size: '$requests_outgoing_pending',
          },
        },
      },
      {
        $project: {
          password: 0,
          userId: 0,
          assets_total: 0,
          assets_offered: 0,
          requests_incoming_pending: 0,
          requests_outgoing_pending: 0,
        },
      },
    ]).exec()
    console.log(user)
    return Object.keys(user).length !== 0
      ? res.status(200).json(user)
      : res.status(404).send('No user found.')
  } catch (err) {
    console.log("X FAILURE")
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
    return Object.keys(result).length !== 0
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
    console.log('GET USER ASSETS FROM DATABASE:')
    /* find user's id in database */
    console.log('– GET USER FROM DATABASE')
    const [user] = await User.find({ username: req.body.owner }).exec()
    const { id } = user
    /* find assets owned by user in database */
    console.log('– GET ASSETS FROM DATABASE')
    const asset = await Asset.find({ owners: id }).exec()
    return asset
      ? res.status(200).json(asset)
      : res.status(404).send('No user assets found.')
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
    console.log('GET USER REQUESTS FROM DATABASE:')
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
