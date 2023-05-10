import { Router } from 'express';
import { getUsers, createUser, getUser, updateUser, deleteUser, getUserAssets } from '../controllers/users.js'

const usersRouter = Router()

usersRouter.route('/')
    .get(getUsers)
    .post(createUser)

usersRouter.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser)

usersRouter.route('/:id/assets')
    .post(getUserAssets)

export default usersRouter
