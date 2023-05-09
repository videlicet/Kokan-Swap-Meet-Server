import { Router } from 'express'
import { login } from '../controllers/login.js'

const loginRouter = Router()

loginRouter.route('/')
    .get()
    .post(login)

export default loginRouter