import { Router } from 'express'
import { loginUser, authenticateUser, logoutUser, getAccessToken } from '../controllers/auth.js'

const authRouter = Router()

authRouter.route('/')
    .get(authenticateUser)
    .post(loginUser)
    .delete(logoutUser)

authRouter.route('/gitHub')
    .get(getAccessToken)

export default authRouter