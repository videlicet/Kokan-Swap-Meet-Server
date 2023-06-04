import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { Octokit } from 'octokit'

/* import utils */
import { logger } from '../utils/Winston.js'

/* types  */
interface JwtPayload {
  username: string
  password: string
}

interface AccessToken {
  gitHub_token: string
}

interface AuthRequest extends Request {
  authData: any
}

export const JWTAuthentication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  logger.verbose('JWTAutentication: VERIFY KOKAN JWT ACCESS TOKEN')
  const key = req.cookies.kokan_token
  if (!key) {
    logger.error('JWTAutentication: NO KOKAN JWT ACCESS TOKEN PRESENT')
    res.status(403).json({ message: 'No kokan JWT access token present.' })
  } else {
    jwt.verify(
      key,
      process.env.SECRET_KEY,
      async (err, authData: JwtPayload) => {
        if (err) {
          logger.error(`JWTAuthentication: ${err}`)
          return res.status(403).json({
            message: 'JWT authentication failed.',
          })
        }
        req.authData = authData // TODO typing
        next()
      },
    )
  }
}

export const gitHubAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.verbose('gitHubAuthentication: VERIFY GITHUB JWT ACCESS TOKEN')
  if (!req.cookies.gitHub_token) {
    logger.error('gitHubAuthentication: NO GITHUB JWT ACCESS TOKEN PRESENT')
    res.status(403).json({ message: 'No GitHub JWT access token present.' })
  } else {
    /* verify and decode gitHub gitHub_token cookie and call gitHub API if successful */
    const key = req.cookies.gitHub_token.slice(7)
    const decoded = jwt.verify(key, process.env.SECRET_KEY)
    const octokit = new Octokit({
      auth: (decoded as AccessToken).gitHub_token, // TODO typing
    })
    try {
      await octokit.request('GET /user', {
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })
      next()
    } catch (err) {
      logger.error(`gitHubAuthentication: ${err}`)
    }
  }
}
