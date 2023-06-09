import { Router } from 'express';
import { getTransactions, createTransaction, deleteTransactions, getTransaction, updateTransaction, deleteTransaction, getTransactionUsers} from '../controllers/transactions.js'
import { JWTAuthentication, gitHubAuthentication } from '../middlewares/authentication.js'

const transactionsRouter = Router();

transactionsRouter.use(JWTAuthentication, gitHubAuthentication)
  
transactionsRouter.route('/')
    .get(getTransactions)
    .post(createTransaction)
    .delete(deleteTransactions)

transactionsRouter.route('/:id')
    .get(getTransaction)
    .put(updateTransaction)
    .delete(deleteTransaction)

transactionsRouter.route('/:id/users')
    .post(getTransactionUsers)

export default transactionsRouter
