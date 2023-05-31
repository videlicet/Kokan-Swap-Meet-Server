import express, { Express } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import assetsRouter from './routes/assetsRouter.js'
import transactionsRouter from './routes/transactionsRouter.js'
import usersRouter from './routes/usersRouter.js'
import authRouter from './routes/authRouter.js'
import emailRouter from './routes/emailRouter.js'

import errorHandler from './middlewares/errorHandler.js'

const app: Express = express()
const port = process.env.PORT || 3532

app.use(cors({ credentials: true, origin: true }))
app.use(cookieParser())
app.use(express.json())
app.use(errorHandler)

app.use('/assets', assetsRouter)
app.use('/transactions', transactionsRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/emails', emailRouter)


app.listen(port, () => {
  console.log(`Server is running on port ${port}.`)
})
