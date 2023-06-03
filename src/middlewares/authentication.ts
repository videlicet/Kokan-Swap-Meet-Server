import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { Octokit } from 'octokit'

/* types  */
interface JwtPayload {
  username: string
  password: string
}

interface AccessToken {
  access_token: string
}

interface AuthRequest extends Request {
  authData: any
}

export const JWTAuthentication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  console.log('– VERIFY KOKAN JWT ACCESS TOKEN')
  const key = req.cookies.token
  if (!key) {
    res.status(403).json({ message: 'No kokan access token present.' })
  } else {
    jwt.verify(
      key,
      process.env.SECRET_KEY,
      async (err, authData: JwtPayload) => {
        if (err) {
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
  if (!req.cookies.access_token) {
    res.status(403).json({ message: 'No GitHub access token present.' })
  } else {
    console.log('– VERIFY GITHUB JWT ACCESS TOKEN')
    /* verify and decode gitHub access_token cookie and call gitHub API if successful */
    const key = req.cookies.access_token.slice(7)
    const decoded = jwt.verify(key, process.env.SECRET_KEY)
    console.log('– CALL GITHUB API:')
    const octokit = new Octokit({
      auth: (decoded as AccessToken).access_token, // TODO typing
    })
    try {
      const res = await octokit.request('GET /user', {
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })
      next()
    } catch (err) {
      console.log(err)
    }
  }
}
