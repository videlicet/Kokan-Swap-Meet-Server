import { Router } from 'express'
import { authenticateUser, loginUser, logoutUser, emailVerfication, verifyVerificationCode, getGitHubAccessToken, getGitHubUser, addGitHubCollaborator } from '../controllers/auth.js'

const authRouter = Router()

authRouter.route('/')
    .get(authenticateUser)
    .post(loginUser)
    .delete(logoutUser)

authRouter.route('/email')
    .post(emailVerfication)

authRouter.route('/email/verification')
    .post(verifyVerificationCode)

authRouter.route('/gitHub')
    .get(getGitHubAccessToken)

authRouter.route('/gitHub/user')
    .get(getGitHubUser)

authRouter.route('/gitHub/addCollaborator')
    .post(addGitHubCollaborator)


export default authRouter