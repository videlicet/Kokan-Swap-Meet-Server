import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

import assetsRouter from './routes/assetsRouter.ts'
import transactionsRouter from './routes/transactionsRouter.ts'
import usersRouter from './routes/usersRouter.ts'
import errorHandler from './middlewares/errorHandler.ts'

import DB_URL from './DB_URL.js'

const app: Express = express()
const port = process.env.PORT || 3532

console.log(process.env.PORT)

/* this might not be needed here !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/
mongoose.connect(DB_URL) // when hosting locally
// mongoose.connect(process.env.DB_URL) // when hosting on the web
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

app.use(cors<Request>())
app.use(express.json())
app.use('/assets', assetsRouter)
app.use('/transactions', transactionsRouter)
app.use('/users', usersRouter)
app.use(errorHandler)

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`)
})

// app.get('/api/v1', (req: Request, res: Response) => {
//   console.log(req.httpVersionMinor)
//   console.log('Hello!')
//   res.send('Express + TypeScript Server')
// })
