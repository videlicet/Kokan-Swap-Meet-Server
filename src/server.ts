import express, { Express, Request, Response,  NextFunction} from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
// import session from 'express-session'

import assetsRouter from './routes/assetsRouter.js'
import transactionsRouter from './routes/transactionsRouter.js'
import usersRouter from './routes/usersRouter.js'
import authRouter from './routes/authRouter.js'
import errorHandler from './middlewares/errorHandler.js'

const app: Express = express()
const port = process.env.PORT || 3532

app.use((req: Request, res: Response, next: NextFunction) => {
  next();
}, cors({credentials: true, origin: true}))
app.use(express.json())
app.use(cookieParser())

// app.use(
//   session({
//     secret: 'D53gxl41G',
//     resave: false,
//     saveUninitialized: false,
//     cookie: {httpOnly: true,
//     maxAge: 11000000}  //maybe this neeeds to be fixed
//   })
// );


app.use('/assets', assetsRouter)
app.use('/transactions', transactionsRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)

app.use(errorHandler)

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`)
})


/**
 * 
import DB_URL from './DB_URL.js'

//this might not be needed here !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
mongoose.connect(DB_URL) // when hosting locally
// mongoose.connect(process.env.DB_URL) // when hosting on the web
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
 
*/