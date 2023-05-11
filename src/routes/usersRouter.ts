import { Router } from 'express';
import { getUsers, createUser, getUser, updateUser, deleteUser, getUserAssets, getUserRequests } from '../controllers/users.js'

const usersRouter = Router()

usersRouter.route('/')
    .get(getUsers)
    .post(createUser)

usersRouter.route('/:id')
    .post(getUser)
    .put(updateUser)
    .delete(deleteUser)

usersRouter.route('/:id/assets')
    .post(getUserAssets)

usersRouter.route('/:id/requests')
    .post(getUserRequests)

export default usersRouter
