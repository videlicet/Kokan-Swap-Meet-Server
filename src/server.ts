import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser';

import assetsRouter from './routes/assetsRouter.js'
import transactionsRouter from './routes/transactionsRouter.js'
import usersRouter from './routes/usersRouter.js'
import loginRouter from './routes/loginRouter.js'
import errorHandler from './middlewares/errorHandler.js'

import DB_URL from './DB_URL.js'

const app: Express = express()
const port = process.env.PORT || 3532

/* this might not be needed here !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/
mongoose.connect(DB_URL) // when hosting locally
// mongoose.connect(process.env.DB_URL) // when hosting on the web
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

app.use(cors<Request>())
app.use(express.json())
app.use(cookieParser())

app.use('/assets', assetsRouter)
app.use('/transactions', transactionsRouter)
app.use('/users', usersRouter)
app.use('/login', loginRouter)

app.use(errorHandler)

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`)
})