import { Router } from 'express'
import { authenticateUser, loginUser, logoutUser, emailVerfication, getVerificationCode, getGitHubAccessToken, getGitHubUser, addGitHubCollaborator } from '../controllers/auth.js'

const authRouter = Router()

authRouter.route('/')
    .get(authenticateUser)
    .post(loginUser)
    .delete(logoutUser)

authRouter.route('/email')
    .post(emailVerfication)

authRouter.route('/email/verification')
    .post(getVerificationCode)

authRouter.route('/gitHub')
    .get(getGitHubAccessToken)

authRouter.route('/gitHub/user')
    .get(getGitHubUser)

authRouter.route('/gitHub/addCollaborator')
    .post(addGitHubCollaborator)


export default authRouter