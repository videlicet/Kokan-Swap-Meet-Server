import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import assetsRouter from './routes/assetsRouter.js'
import transactionsRouter from './routes/transactionsRouter.js'
import usersRouter from './routes/usersRouter.js'
import authRouter from './routes/authRouter.js'

import errorHandler from './middlewares/errorHandler.js'

const app: Express = express()
const port = process.env.PORT || 3532

app.use(cors({ credentials: true, origin: true }))
app.use(cookieParser())
app.use(express.json())

app.use('/assets', assetsRouter)
app.use('/transactions', transactionsRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)

app.use(errorHandler)

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`)
})
