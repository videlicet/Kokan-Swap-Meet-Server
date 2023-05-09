import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import SECRET_KEY from '../SECRET_KEY'

export const authentication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.cookies.token) {
      res.status(401).json({ message: 'User not authenticated!' })
    } else {
      const payload = jwt.verify(req.cookies.token, SECRET_KEY)
      //req.user = payload // TD QQ this might come in handy later on; what is this used for
      next()
    }
  } catch (err) {
    next(err)
  }
}
