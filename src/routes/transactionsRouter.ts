import { Router } from 'express';
import { getTransactions, createTransaction, getTransaction, updateTransaction, deleteTransaction} from '../controllers/transactions.js'

const transactionsRouter = Router();

transactionsRouter.route('/')
    .get(getTransactions)
    .post(createTransaction)

transactionsRouter.route('/:id')
    .get(getTransaction)
    .put(updateTransaction)
    .delete(deleteTransaction)

export default transactionsRouter
