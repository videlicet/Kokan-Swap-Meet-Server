import { Router } from 'express'
import { emailVerfication, submitSwapRequest, verifyVerificationCode } from '../controllers/emails.js'
import { JWTAuthentication, gitHubAuthentication } from '../middlewares/authentication.js'

const emailRouter = Router()

emailRouter.use(gitHubAuthentication)

emailRouter.route('/signup/submit')
    .post(emailVerfication)
    
emailRouter.route('/signup/verify')
    .post(verifyVerificationCode)

emailRouter.route('/swap/submit')
    .post(JWTAuthentication, submitSwapRequest)

export default emailRouter