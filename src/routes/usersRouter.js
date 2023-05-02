import { Router } from 'express';
import { createUser, deleteUser, getUser, getUsers, updateUser } from '../controllers/users.js';

const usersRouter = Router();

usersRouter.route('/')
    .get(getUsers)
    .post(createUser);

usersRouter.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

export default usersRouter;
