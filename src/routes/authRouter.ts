import { Router } from 'express'
import { loginUser, authenticateUser } from '../controllers/auth.js'

const authRouter = Router()

authRouter.route('/')
    .get(authenticateUser)
    .post(loginUser)

export default authRouter