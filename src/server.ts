import express, { Express } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import winston from 'winston'
import expressWinston from 'express-winston'

import assetsRouter from './routes/assetsRouter.js'
import transactionsRouter from './routes/transactionsRouter.js'
import usersRouter from './routes/usersRouter.js'
import authRouter from './routes/authRouter.js'
import emailRouter from './routes/emailRouter.js'

import errorHandler from './middlewares/errorHandler.js'

const app: Express = express()
const port = process.env.PORT || 3532

/* winston */
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'grey',
  debug: 'white',
}

winston.addColors(colors)

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
)

export const logger = winston.createLogger({
  level: 'debug',
  format: format,
  defaultMeta: { service: 'server' },
})
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({}))
}

/* middlewares */
app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: format,
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
