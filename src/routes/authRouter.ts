import { Router } from 'express'
import { loginUser, authenticateUser, logoutUser, getGitHubAccessToken, getGitHubUser, addGitHubCollaborator } from '../controllers/auth.js'

const authRouter = Router()

authRouter.route('/')
    .get(authenticateUser)
    .post(loginUser)
    .delete(logoutUser)

authRouter.route('/gitHub')
    .get(getGitHubAccessToken)

authRouter.route('/gitHub/user')
    .get(getGitHubUser)

authRouter.route('/gitHub/addCollaborator')
    .post(addGitHubCollaborator)


export default authRouter