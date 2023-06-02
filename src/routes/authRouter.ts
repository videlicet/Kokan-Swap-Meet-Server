import { Router } from 'express'
import { authenticateUser, loginUser, logoutUser, getGitHubAccessToken, getGitHubUser, addGitHubCollaborator, getRepository} from '../controllers/auth.js'
import { JWTAuthentication, gitHubAuthentication } from '../middlewares/authentication.js'

const authRouter = Router()

authRouter.route('/')
    .get(authenticateUser)
    .post(gitHubAuthentication, loginUser) 
    .delete(JWTAuthentication, gitHubAuthentication, logoutUser)

authRouter.route('/gitHub')
    .get(getGitHubAccessToken)

authRouter.route('/gitHub/user')
    .get(gitHubAuthentication, getGitHubUser)

authRouter.route('/gitHub/addCollaborator')
    .post(JWTAuthentication, gitHubAuthentication, addGitHubCollaborator)

authRouter.route('/gitHub/repository')
    .post(JWTAuthentication, gitHubAuthentication, getRepository)


export default authRouter