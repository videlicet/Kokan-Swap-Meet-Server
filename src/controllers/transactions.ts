import mongoose from 'mongoose'
import { Request, Response, NextFunction } from 'express'
import Transaction from '../models/transactionModel.js'

mongoose.connect(process.env.DB_URL)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

export const getTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('GET to DATABASE')
    const transactions = await Transaction.find({}).exec()
    res.status(200).json(transactions)
  } catch (error) {
    next(error)
  }
}

export const createTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('POST to DATABASE')
    const newTransaction = new Transaction(req.body.transaction)
    await newTransaction.save()
    return res.status(201).json(newTransaction)
  } catch (error) {
    next(error)
  }
}

export const deleteTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('DELETE to DATABASE')
    const deletedTransaction = await Transaction.deleteMany({
      asset_id: req.body.asset._id,
    })
    return res.status(200).json(deletedTransaction)
  } catch (error) {
    next(error)
  }
}

export const getTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('GET to DATABASE')
    const transaction = await Transaction.findOne({
      transaction_id: req.body.transaction_id,
    }).exec() //specify what to search fo
    res.status(200).json(transaction)
  } catch (error) {
    next(error)
  }
}

export const updateTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('PUT to DATABASE')
    const searchCriterion = { _id: req.params.id }
    await Transaction.updateOne(searchCriterion, req.body.transaction)
    const updatedTransaction = await Transaction.find(searchCriterion).exec()
    return res.status(200).json(updatedTransaction)
  } catch (error) {
    next(error)
  }
}

export const deleteTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('DELETE to DATABASE')
    const deletedTransaction = await Transaction.deleteOne({
      _id: req.params.id,
    })
    return res.status(200).json(deletedTransaction)
  } catch (error) {
    next(error)
  }
}

export const getTransactionUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('GET TRANSACTION USERS FROM DATABASE:')
    const transactionWithUsers = await Transaction.aggregate([
      {
        /* use transaction id passed from the client to query the correct asset */
        $match: {
          $expr: {
            $eq: ['$_id', { $toObjectId: req.body.transaction_id }],
          },
        },
      },
      /* project requestee ids in requestee array to ObjectIds */
      {
        $addFields: {
          requestee: {
            $map: {
              input: '$requestee',
              as: 'r',
              in: { $toObjectId: '$$r' },
            },
          },
        },
      },
      /* aggregrate requester id with requester username after projecting requester id to ObjectId*/
      {
        $lookup: {
          from: 'Users',
          let: { requesterId: { $toObjectId: '$requester' } },
          pipeline: [
            {
              $match: { $expr: { $eq: ['$_id', '$$requesterId'] } },
            },
            {
              $project: {
                _id: 0,
                username: 1,
                kokans: 1,
              },
            },
          ],
          as: 'requester_data',
        },
      },
      {
        $addFields: {
          requester_username: {
            $arrayElemAt: ['$requester_data.username', 0],
          },
          requester_kokans: { $arrayElemAt: ['$requester_data.kokans', 0] },
        },
      },
      /* aggregrate requestee ids with requestee usernames */
      {
        $lookup: {
          from: 'Users',
          localField: 'requestee',
          foreignField: '_id',
          as: 'requestee_data',
        },
      },
      {
        $addFields: {
          requestees_username: '$requestee_data.username',
        },
      },
      /* aggregate asset id with asset */
      {
        $lookup: {
          from: 'Assets',
          let: { assetId: { $toObjectId: '$asset_id' } },
          pipeline: [
            {
              $match: { $expr: { $eq: ['$_id', '$$assetId'] } },
            },
          ],
          as: 'asset_data',
        },
      },
      {
        $addFields: {
          asset_data: { $arrayElemAt: ['$asset_data', 0] },
        },
      },
      {
        $project: {
          requestee_data: 0,
          requester_data: 0,
        },
      },
    ]).exec()
    return transactionWithUsers
      ? res.status(200).json(transactionWithUsers)
      : res.status(404).send('No transactions aggregated.')
  } catch (error) {
    next(error)
  }
}
