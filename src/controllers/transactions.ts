import { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'

/* import models */
import User from '../models/userModel.js'
import Transaction from '../models/transactionModel.js'

/* import aggregations */
import { aggregateTransactions } from '../aggregations/transactionsAggregations.js'

/* mongoose */
mongoose.connect(process.env.DB_URL)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

export const getTransactions = async (
  res: Response,
) => {
  try {
    console.log('GET TRANSACTIONS IN DATABASE')
    const transactions = await Transaction.find({}).exec()
    return res.status(200).json(transactions)
  } catch (err) {
    console.log(err)
  }
}

export const createTransaction = async (
  req: Request,
  res: Response,
) => {
  try {
    console.log('CREATE TRANSACTION IN DATABASE')
    const newTransaction = new Transaction(req.body.transaction)
    await newTransaction.save()
    return res.status(201).json(newTransaction)
  } catch (err) {
    console.log(err)
  }
}

export const deleteTransactions = async (
  req: Request,
  res: Response,
) => {
  try {
    console.log('DELETE TRANSACTIONS IN DATABASE')
    const searchCriterion = {
      asset_id: req.body.asset._id,
    }
    const deletedTransaction = await Transaction.deleteMany(searchCriterion)
    return res.status(200).json(deletedTransaction)
  } catch (err) {
    console.log(err)
  }
}

export const getTransaction = async (
  req: Request,
  res: Response,
) => {
  try {
    console.log('FIND TRANSACTION IN DATABASE')
    const searchCriterion = { _id: req.params.id, status: 'pending' }
    const transaction = await Transaction.findOne(searchCriterion).exec()
    console.log('transaction:', transaction)
    return transaction
      ? res.status(200).json(transaction)
      : res.status(404).json({ message: 'Find transaction failed.' })
  } catch (err) {
    console.log(err)
  }
}

export const updateTransaction = async (
  req: Request,
  res: Response,
) => {
  try {
    console.log('UPDATE TRANSACTION IN DATABASE')
    const searchCriterion = { _id: req.params.id }
    await Transaction.updateOne(searchCriterion, req.body.transaction)
    const updatedTransaction = await Transaction.find(searchCriterion).exec()
    return res.status(200).json(updatedTransaction)
  } catch (err) {
    console.log(err)
  }
}

export const deleteTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('DELETE TRANSACTION IN DATABASE')
    const searchCriterion = {
      _id: req.params.id,
    }
    const deletedTransaction = await Transaction.deleteOne(searchCriterion)
    return res.status(200).json(deletedTransaction)
  } catch (err) {
    console.log(err)
  }
}

export const getTransactionUsers = async (
  req: Request,
  res: Response,
) => {
  try {
    console.log('GET TRANSACTION USERS FROM DATABASE:')
    const transactionWithUsers = await aggregateTransactions(req.body.transaction_id)
    return transactionWithUsers
      ? res.status(200).json(transactionWithUsers)
      : res.status(404).json({ message: 'No transactions aggregated.' })
  } catch (err) {
    console.log(err)
  }
}

export const getTransactionExpiration = async (
  req: Request,
  res: undefined,
  next: NextFunction,
) => {
  console.log('GET USER REQUESTS EXPIRATION FROM DATABASE:')
  console.log('– GET USER REQUESTS')
  try {
    const requests = await Transaction.aggregate([
      {
        /* use transaction id passed from the client to query the correct asset */
        $match: {
          status: 'pending',
          requester: req.body.user._id,
        },
      },
    ]).exec()

    if (requests) {
      console.log('– GET REQUEST CREATION DATES (ITERATION):')
      requests.forEach((request: any) => {
        // TODO typing
        const dateCreated = new Date(request.created)
        console.log('–– COMPARE REQUEST CREATION DATE AND EXPIRATION OFFSET:')
        const expirationOffset = 5
        const expirationDate = new Date(
          dateCreated.setUTCDate(dateCreated.getUTCDate() + expirationOffset),
        )
        if (expirationDate.getTime() < new Date().getTime()) {
          console.log('––– SET EXPIRED TRANSACTION STATUS TO "EXPIRED"')
          updateTransaction(request._id)
          console.log('––– REBATE KOKANS TO REQUESTER')
          updateUser(request.requester, request.kokans)
        }
      })
    }

    async function updateTransaction(id: string) {
      try {
        console.log('-> SET TRANSACTION STATUS TO "EXPIRED"')
        const searchCriterion = { _id: id }
        const res = await Transaction.updateOne(searchCriterion, {
          status: 'expired',
        })
        if (res) console.log('SUCCESS')
        return
      } catch (err) {
        console.log('X FAILURE')
        console.log(err)
      }
    }

    async function updateUser(id: string, rebate: number) {
      try {
        console.log('-> REBATE USER KOKANS')
        const searchCriterion = { _id: id }
        const res = await User.updateOne(searchCriterion, {
          $inc: { kokans: rebate, kokans_pending: -rebate },
        }).exec()
        if (res) console.log('SUCCESS')
        return
      } catch (err) {
        console.log('X FAILURE')
        console.log(err)
      }
    }
    next()
  } catch (err) {
    console.log('X FAILURE')
    console.log(err)
    next(err)
  }
}
