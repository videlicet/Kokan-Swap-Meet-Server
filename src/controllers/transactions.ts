import mongoose from 'mongoose'
import DB_URL from '../DB_URL.js' // when hosting locally
import Transaction from '../models/transactionModel.ts'

mongoose.connect(DB_URL) // when hosting locally
// mongoose.connect(process.env.DB_URL) // when hosting on the web
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

export const getTransactions = async (req, res, next) => {
  try {
    console.log('GET to DATABASE')
    const users = await Transaction.find({}).exec()
    res.status(200).json(users)
  } catch (error) {
    next(error)
  }
}

export const createTransaction = async (req, res, next) => {
  try {
    console.log('POST to DATABASE')
    const newTransaction = new Transaction(req.body)
    await newTransaction.save()
    return res.status(201).json(newTransaction)
  } catch (error) {
    next(error)
  }
}

export const getTransaction = async (req, res, next) => {
  try {
    console.log('GET to DATABASE')
    const transaction = await Transaction.find({}).exec() //specify what to search fo
    res.status(200).json(transaction)
  } catch (error) {
    next(error)
  }
}

export const updateTransaction = async (req, res, next) => {
  try {
    console.log('PUT to DATABASE')
    await Transaction.updateMany({ name: 'Awesome Post!' }, 'John') // not update Many, how to decide what to update? just all of it?
    const updatedTransaction = await Transaction.find({}).exec()
    return res.status(200).json(updatedTransaction)
  } catch (error) {
    next(error)
  }
}

export const deleteTransaction = async (req, res, next) => {
  try {
    console.log('DELETE to DATABSE')
    console.log(req.body)
    const deletedTransaction = await Transaction.deleteMany({}) //delete ONE
    return res.status(201).json(deletedTransaction) // QQ 201?
  } catch (error) {
    next(error)
  }
}
