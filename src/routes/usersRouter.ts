import { Router } from 'express';
import { getUsers, createUser, updateUsers, checkUserExists, getUser, updateUser, deleteUser, getUserAssets, getUserRequests } from '../controllers/users.js'
import { JWTAuthentication, gitHubAuthentication } from '../middlewares/authentication.js'
import {getTransactionExpiration} from '../controllers/transactions.js'

const usersRouter = Router()

usersRouter.use(gitHubAuthentication)

usersRouter.route('/')
    .get(JWTAuthentication, getUsers)
    .post(createUser)
    .put(JWTAuthentication, updateUsers)

usersRouter.route('/:id')
    .get(checkUserExists)
    .post(JWTAuthentication, getUser)
    .put(JWTAuthentication, updateUser)
    .delete(JWTAuthentication, deleteUser)

usersRouter.route('/:id/assets')
    .post(JWTAuthentication, getUserAssets)

usersRouter.route('/:id/requests')
    .post(JWTAuthentication, getTransactionExpiration, getUserRequests)

export default usersRouter
