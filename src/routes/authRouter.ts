import { Router } from 'express'
import { authenticateUser, loginUser, logoutUser, getGitHubAccessToken, getGitHubUser, addGitHubCollaborator, getRepository} from '../controllers/auth.js'

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

authRouter.route('/gitHub/repository')
    .post(getRepository)


export default authRouter