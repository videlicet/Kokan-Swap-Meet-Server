import { Router } from 'express'
import { loginUser, authenticateUser, logoutUser, getAccessToken, addCollaborator } from '../controllers/auth.js'

const authRouter = Router()

authRouter.route('/')
    .get(authenticateUser)
    .post(loginUser)
    .delete(logoutUser)

authRouter.route('/gitHub')
    .get(getAccessToken)

authRouter.route('/gitHub/addCollaborator')
    .post(addCollaborator)


export default authRouter