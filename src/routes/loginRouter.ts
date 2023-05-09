import { Router } from 'express'
import { login, auth } from '../controllers/login.js'

const loginRouter = Router()

loginRouter.route('/')
    .get(auth)
    .post(login)

export default loginRouter