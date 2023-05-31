import { Router } from 'express'
import { emailVerfication, submitSwapRequest, verifyVerificationCode } from '../controllers/emails.js'

const emailRouter = Router()

emailRouter.route('/signup/submit')
    .post(emailVerfication)
    
emailRouter.route('/signup/verify')
    .post(verifyVerificationCode)

emailRouter.route('/swap/submit')
    .post(submitSwapRequest)


export default emailRouter