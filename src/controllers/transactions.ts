import mongoose from 'mongoose'
import { Request, Response, NextFunction } from 'express'
import DB_URL from '../DB_URL.js' // when hosting locally
import Transaction from '../models/transactionModel.js'

mongoose.connect(DB_URL) // when hosting locally
// mongoose.connect(process.env.DB_URL) // when hosting on the web
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('GET to DATABASE')
    const users = await Transaction.find({}).exec()
    res.status(200).json(users)
  } catch (error) {
    next(error)
  }
}

export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('POST to DATABASE')
    const newTransaction = new Transaction(req.body)
    await newTransaction.save()
    return res.status(201).json(newTransaction)
  } catch (error) {
    next(error)
  }
}

export const getTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('GET to DATABASE')
    const transaction = await Transaction.findOne({ transaction_id: req.body.transaction_id }).exec() //specify what to search fo
    res.status(200).json(transaction)
  } catch (error) {
    next(error)
  }
}

export const updateTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('PUT to DATABASE')
    const searchCriterion = { username: req.body.username }
    await Transaction.updateOne(searchCriterion, req.body)
    const updatedTransaction = await Transaction.find(searchCriterion).exec()
    return res.status(200).json(updatedTransaction)
  } catch (error) {
    next(error)
  }
}

export const deleteTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('DELETE to DATABASE')
    console.log(req.body)
    const deletedTransaction = await Transaction.deleteOne({})
    return res.status(201).json(deletedTransaction) // QQ 201?
  } catch (error) {
    next(error)
  }
}
