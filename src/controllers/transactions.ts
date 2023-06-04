import { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'

/* import utils */
import { logger } from '../utils/Winston.js'

/* import models */
import User from '../models/userModel.js'
import Transaction from '../models/transactionModel.js'

/* import aggregations */
import { aggregateTransactions } from '../aggregations/transactionsAggregations.js'

/* mongoose */
mongoose.connect(process.env.DB_URL)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

export const getTransactions = async (res: Response) => {
  try {
    logger.verbose('getTransactions: GET TRANSACTIONS IN DATABASE')
    const transactions = await Transaction.find({}).exec()
    return res.status(200).json(transactions)
  } catch (err) {
    logger.error(`getTransactions: ${err}`)
  }
}

export const createTransaction = async (req: Request, res: Response) => {
  try {
    logger.verbose('createTransaction: CREATE TRANSACTION IN DATABASE')
    const newTransaction = new Transaction(req.body.transaction)
    await newTransaction.save()
    return res.status(201).json(newTransaction)
  } catch (err) {
    logger.error(`createTransaction: ${err}`)
  }
}

export const deleteTransactions = async (req: Request, res: Response) => {
  try {
    logger.verbose('deleteTransactions: DELETE TRANSACTIONS IN DATABASE')
    const searchCriterion = {
      asset_id: req.body.asset._id,
    }
    const deletedTransaction = await Transaction.deleteMany(searchCriterion)
    return res.status(200).json(deletedTransaction)
  } catch (err) {
    logger.error(`deleteTransactions: ${err}`)
  }
}

export const getTransaction = async (req: Request, res: Response) => {
  try {
    logger.verbose('getTransaction: FIND TRANSACTION IN DATABASE')
    const searchCriterion = { _id: req.params.id, status: 'pending' }
    const transaction = await Transaction.findOne(searchCriterion).exec()
    return transaction
      ? res.status(200).json(transaction)
      : res.status(404).json({ message: 'Find transaction failed.' })
  } catch (err) {
    logger.error(`getTransaction: ${err}`)
  }
}

export const updateTransaction = async (req: Request, res: Response) => {
  try {
    logger.verbose('updateTransaction: UPDATE TRANSACTION IN DATABASE')
    const searchCriterion = { _id: req.params.id }
    await Transaction.updateOne(searchCriterion, req.body.transaction)
    const updatedTransaction = await Transaction.find(searchCriterion).exec()
    return res.status(200).json(updatedTransaction)
  } catch (err) {
    logger.error(`updateTransaction: ${err}`)
  }
}

export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    logger.verbose('deleteTransaction: ELETE TRANSACTION IN DATABASE')
    const searchCriterion = {
      _id: req.params.id,
    }
    const deletedTransaction = await Transaction.deleteOne(searchCriterion)
    return res.status(200).json(deletedTransaction)
  } catch (err) {
    logger.error(`deleteTransaction: ${err}`)
  }
}

export const getTransactionUsers = async (req: Request, res: Response) => {
  try {
    logger.verbose('getTransactionUsers: GET TRANSACTION USERS FROM DATABASE:')
    const transactionWithUsers = await aggregateTransactions(
      req.body.transaction_id,
    )
    return transactionWithUsers
      ? res.status(200).json(transactionWithUsers)
      : res.status(404).json({ message: 'No transactions aggregated.' })
  } catch (err) {
    logger.error(`getTransactionUsers: ${err}`)
  }
}

export const getTransactionExpiration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.verbose(
    'getTransactionExpiration: GET USER REQUESTS EXPIRATION FROM DATABASE:',
  )
  logger.verbose('getTransactionExpiration: – GET USER REQUESTS')
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
      logger.verbose(
        'getTransactionExpiration: – GET REQUEST CREATION DATES (ITERATION):',
      )
      requests.forEach((request: any) => {
        // TODO typing
        const dateCreated = new Date(request.created)
        logger.verbose(
          'getTransactionExpiration: –– COMPARE REQUEST CREATION DATE AND EXPIRATION OFFSET:',
        )
        const expirationOffset = 5
        const expirationDate = new Date(
          dateCreated.setUTCDate(dateCreated.getUTCDate() + expirationOffset),
        )
        if (expirationDate.getTime() < new Date().getTime()) {
          logger.verbose(
            'getTransactionExpiration: ––– SET EXPIRED TRANSACTION STATUS TO "EXPIRED"',
          )
          updateTransaction(request._id)
          logger.verbose(
            'getTransactionExpiration: ––– REBATE KOKANS TO REQUESTER',
          )
          updateUser(request.requester, request.kokans)
        }
      })
    }

    async function updateTransaction(id: string) {
      try {
        logger.verbose(
          'getTransactionExpiration -> updateTransaction: SET TRANSACTION STATUS TO "EXPIRED"',
        )
        const searchCriterion = { _id: id }
        await Transaction.updateOne(searchCriterion, {
          status: 'expired',
        })
        return
      } catch (err) {
        logger.error(`getTransactionExpiration -> updateTransaction: ${err}`)
      }
    }

    async function updateUser(id: string, rebate: number) {
      try {
        logger.verbose(
          'getTransactionExpiration -> updateUser: REBATE USER KOKANS',
        )
        const searchCriterion = { _id: id }
        await User.updateOne(searchCriterion, {
          $inc: { kokans: rebate, kokans_pending: -rebate },
        }).exec()
        return
      } catch (err) {
        logger.error(`getTransactionExpiration -> updateUser: ${err}`)
      }
    }
    next()
  } catch (err) {
    logger.error(`getTransactionUsers: ${err}`)
    next(err)
  }
}
