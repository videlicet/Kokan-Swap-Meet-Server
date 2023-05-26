import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

/* type for authData in jwt.verify() */
interface JwtPayload {
  username: string
  password: string
}

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.headers.cookie) {
    console.log('JWT VERIFICATION:')
    const key = req.cookies.token
    jwt.verify(
      key,
      process.env.SECRET_KEY,
      async (err, authData: JwtPayload) => {
        if (err) {
          console.log('X FAILURE')
          return res.status(403).json({
            success: false,
            message: 'JWT authentication failed',
          })
        } else {
          console.log('– SUCCESS')
          return next()
        }
      },
    )
  } else {
    res.status(403).json({
      success: false,
      message: 'Authentication failed',
    })
  }
}
