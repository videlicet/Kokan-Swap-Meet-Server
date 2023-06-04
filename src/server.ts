import express, { Express } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import winston from 'winston'
import expressWinston from 'express-winston'

/* import routers */
import assetsRouter from './routes/assetsRouter.js'
import transactionsRouter from './routes/transactionsRouter.js'
import usersRouter from './routes/usersRouter.js'
import authRouter from './routes/authRouter.js'
import emailRouter from './routes/emailRouter.js'

/* import middlewares */
import errorHandler from './middlewares/errorHandler.js'

/* import utils */
import {logger, format} from './utils/Winston.js'

const app: Express = express()
const port = process.env.PORT || 3532


/* middlewares */
app.use(
  expressWinston.logger({
    format: format,
    transports: [new winston.transports.Console()],
  }),
)
app.use(cors({ credentials: true, origin: true }))
app.use(cookieParser())
app.use(express.json())
app.use(errorHandler)

/* routers */
app.use('/assets', assetsRouter)
app.use('/transactions', transactionsRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/emails', emailRouter)

app.listen(port, () => {
  logger.log('info', `Server is running on port ${port}.`)
})
