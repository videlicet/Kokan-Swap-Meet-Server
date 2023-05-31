// @ts-nocheck
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { Octokit } from 'octokit'

/* type for authData in jwt.verify() */
interface JwtPayload {
  username: string
  password: string
}

export const JWTAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('– VERIFY KOKAN JWT ACCESS TOKEN')
  const key = req.cookies.token
  console.log(key)
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
      auth: decoded.access_token, // TODO typing
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
