import jwt from 'jsonwebtoken';
import SECRET_KEY from '../SECRET_KEY'

export const authentication = async (req, res, next) => {
  try {
    if (!req.cookies.token) {
      res.status(401).json({ message: 'User not authenticated!' });
    } else {
      const payload = jwt.verify(req.cookies.token, SECRET_KEY);
      req.user = payload;                                         // this might come in handy later on
      next()
    }
  } catch (err) {
    next(err);
  }
};