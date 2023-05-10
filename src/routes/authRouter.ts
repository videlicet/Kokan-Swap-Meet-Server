import { Router } from 'express'
import { loginUser, authenticateUser, logoutUser } from '../controllers/auth.js'

const authRouter = Router()

authRouter.route('/')
    .get(authenticateUser)
    .post(loginUser)
    .delete(logoutUser)

export default authRouter