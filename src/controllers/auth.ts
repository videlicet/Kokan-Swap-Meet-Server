// @ts-nocheck
import mongoose from 'mongoose'
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { Octokit, App } from 'octokit'

import User from '../models/userModel.js'

mongoose.connect(process.env.DB_URL)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('POST to DATABASE')
  /*  find user in db */
  const user = await User.findOne({ username: req.body.username }).exec()

  if (!user) {
    return res.status(404).json({ message: 'User not found.' })
  }
  // compare send password with stored password
  const passwordCorrect = await bcrypt.compare(req.body.password, user.password)
  if (user && passwordCorrect == true) {
    try {
      // create access token
      let accessToken = jwt.sign(
        { username: req.body.username },
        process.env.SECRET_KEY,
      )
      // create a response cookie
      const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const, // as const necessary because sameSite is not included on the CookieOptions type
        maxAge: 100000,
      }
      res.status(200).cookie('token', accessToken, options).json(user)
    } catch (error) {
      return res
        .status(500)
        .json({ message: error.message, errors: error.errors })
    }
  } else return res.status(401).json({ message: 'Password incorrect.' })
}

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
    console.log('JWT verification')
    const key = req.cookies.token
    jwt.verify(
      key,
      process.env.SECRET_KEY,
      async (err, authData: JwtPayload) => {
        if (err) {
          return res.status(403).json({
            success: false,
            message: 'JWT authentication failed',
          })
        }
        console.log('GET to DATABASE')
        // find user in db
        const user = await User.findOne({ username: authData.username }).exec()
        if (!user) {
          return res.status(404).json({ message: 'User not found.' })
        }
        return res.status(200).json(user)
      },
    )
  } else {
    res.status(403).json({
      success: false,
      message: 'Authentication failed',
    })
  }
}

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('CLEAR COOKIE')
  try {
    res
      .clearCookie('token', { path: '/', sameSite: 'none', secure: true })
      .clearCookie('access_token', { path: '/', sameSite: 'none', secure: true })
      .sendStatus(200)
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message, errors: error.errors })
  }
}

export const getAccessToken = async (  req: Request,
  res: Response,
  next: NextFunction) => {
    console.log('GET accesstToken from GitHub')
    const params = "?client_id=" + process.env.GITHUB_CLIENT_ID + "&client_secret=" + process.env.GITHUB_CLIENT_SECRET + "&code=" + req.query.code
    try {
      const authentictor = await fetch(`https://github.com/login/oauth/access_token${params}`, {
      method: "POST",
      headers: {
        "Accept": "application/json"
      }})
      let accessToken = await authentictor.json()
      /* jwt sign gitHub token  */
      accessToken = jwt.sign(
        { access_token: accessToken.access_token },
        process.env.SECRET_KEY,
      )
      // create a response cookie
      const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const, // as const necessary because sameSite is not included on the CookieOptions type
        maxAge: 100000,
      }
       return res.status(200).cookie('access_token', 'Bearer ' + accessToken, options).json({success: "success"})
    } catch(err) {
    }
  }

  export const addCollaborator = async (req: Request,
    res: Response,
    next: NextFunction) => {
      /* verify and decode gitHub access_token cookie */
      const key = req.cookies.access_token.slice(7)
      const decoded = jwt.verify(
        key,
        process.env.SECRET_KEY,
      )

      console.log('ADD collaborator to GitHub repo')
      const octokit = new Octokit({
        auth: decoded.access_token, //TD typing
      })

      console.log(req.body.requesteeGitHub)
      console.log(req.body.requesterGitHub)
      console.log(req.body.gitHubRepo)


      /* test: get repo collaborators */
      let collaborators = await octokit.request('GET /repos/{owner}/{repo}/collaborators', {
        owner: req.body.requesteeGitHub,
        repo: req.body.gitHubRepo,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })
      let {data} = collaborators

      console.log(data)
      return res.status(200).json(data)

      // const data = 
      //   await octokit.request('PUT /repos/{owner}/{repo}/collaborators/{username}', {
      //   owner: req.body.requesteeGitHub,
      //   repo: req.body.gitHubRepo,
      //   username: req.body.requesterGitHub,
      //   permission: 'pull'
      // })

      // if (data.status === 200) {
      //   let collaborators = await data.json()
      //   return res.status(200).json(collaborators)
      // }
      // return res.status(400) 
  }

  /* 

 

  */