import { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { Octokit } from 'octokit'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import fetch from 'node-fetch' // node has fetch integrated since 2022, but deploying on render requires it (May 2023)

/* import utils */
import { logger } from '../utils/Winston.js'

/* import models */
import User from '../models/userModel.js'

/* types  */
interface AccessToken {
  gitHub_token: string
  access_token?: string
}

/* mongoose */
mongoose.connect(process.env.DB_URL)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

export const loginUser = async (req: Request, res: Response) => {
  logger.verbose('loginUser: GET USER IN DATABASE:')
  /*  find user in db */
  const user = await User.findOne({ username: req.body.username }).exec()

  if (!user) {
    logger.error('loginUser: GET USER IN DATABASE: FAILED')
    return res.status(404).json({ message: 'User not found.' })
  }
  /* compare send password with stored password */
  const passwordCorrect = await bcrypt.compare(req.body.password, user.password)
  logger.verbose('loginUser: – CHECK PASSWORD')
  if (user && passwordCorrect == true) {
    /* create kokan access token*/
    const accessToken = jwt.sign(
      { username: req.body.username },
      process.env.SECRET_KEY,
    )
    /* create a response cookie*/
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const, // as const necessary because sameSite is not included on the CookieOptions type
      maxAge: 3600000,
    }
    return res
      .status(200)
      .cookie('kokan_token', accessToken, options)
      .json({ message: 'Password correct.' })
  } else {
    logger.error('loginUser: – CHECK PASSWORD: FAILED')
    return res.status(401).json({ message: 'Password incorrect.' })
  }
}

export const logoutUser = async (req: Request, res: Response) => {
  logger.verbose('logoutUser: CLEAR COOKIE')
  return res
    .clearCookie('kokan_token', { path: '/', sameSite: 'none', secure: true })
    .clearCookie('gitHub_token', {
      path: '/',
      sameSite: 'none',
      secure: true,
    })
    .sendStatus(200)
}

export const getGitHubAccessToken = async (req: Request, res: Response) => {
  logger.verbose('getGitHubAccessToken: GET GITHUB ACCESS TOKEN:')
  const params =
    '?client_id=' +
    process.env.GITHUB_CLIENT_ID +
    '&client_secret=' +
    process.env.GITHUB_CLIENT_SECRET +
    '&code=' +
    req.query.code
  try {
    /* request GitHub access token  */
    const authentictor = await fetch(
      `https://github.com/login/oauth/access_token${params}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      },
    )
    let gitHub_token = await authentictor.json()
    logger.verbose('getGitHubAccessToken: – JWT SIGN GITHUB ACCESS TOKEN')

    /* jwt sign GitHub access token  */
    gitHub_token = jwt.sign(
      { gitHub_token: (gitHub_token as AccessToken).access_token },
      process.env.SECRET_KEY,
    )

    /* create a response cookie */
    logger.verbose('getGitHubAccessToken: – SEND RESPONSE COOKIE')
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const, // as const necessary because sameSite is not included on the CookieOptions type
      maxAge: 3600000
    }
    return res
      .status(200)
      .cookie('gitHub_token', 'Bearer ' + gitHub_token, options)
      .send()
  } catch (err) {
    logger.error(`getGitHubAccessToken: ${err}`)
    return res.status(400).json({ message: err.message, errors: err.errors })
  }
}

export const getGitHubUser = async (req: Request, res: Response) => {
  logger.verbose('getGitHubUser: GET GITHUB USER:')
  /* verify and decode gitHub gitHub_token cookie and call gitHub API if successful */
  logger.verbose('getGitHubUser: – VERIFY GITHUB JWT ACCESS TOKEN')
  const key = req.cookies.gitHub_token.slice(7)
  const decoded = jwt.verify(key, process.env.SECRET_KEY)
  const octokit = new Octokit({
    auth: (decoded as AccessToken).gitHub_token,
  })
  logger.verbose(`getGitHubUser: GET GITHUB USER FROM GITHUB`)
  try {
    const gitHubUser = await octokit.request('GET /user', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    if (gitHubUser) {
      return res.status(200).json(gitHubUser.data)
    }
    logger.error(`getGitHubUser: GET GITHUB USER FROM GITHUB: FAILED`)
    return res.status(404).json({ message: 'No GitHub user Found' })
  } catch (err) {
    logger.error(`getGitHubUser: ${err}`)
    return res.status(404).json({ message: err.message, errors: err.errors })
  }
}

export const addGitHubCollaborator = async (req: Request, res: Response) => {
  logger.verbose('addGitHubCollborator: ADD COLLABORATOR TO GITHUB REPO:')
  /* verify and decode gitHub gitHub_token cookie */
  logger.verbose('addGitHubCollborator: – VERIFY GITHUB JWT ACCESS TOKEN')
  const key = req.cookies.gitHub_token.slice(7)
  const decoded = jwt.verify(key, process.env.SECRET_KEY)

  /* add collaborator to GitHub Repo*/
  const octokit = new Octokit({
    auth: (decoded as AccessToken).gitHub_token,
  })
  logger.verbose('addGitHubCollborator: – ADD COLLABORATOR TO GITHUB REPO')
  try {
    const resCollaborators = await octokit.request(
      'PUT /repos/{owner}/{repo}/collaborators/{username}',
      {
        owner: req.body.requesteeGitHub,
        repo: req.body.gitHubRepo,
        username: req.body.requesterGitHub,
        permission: 'pull',
      },
    )
    const collaborators = resCollaborators.data
    return res.status(200).json(collaborators)
  } catch (err) {
    logger.error(`addGitHubCollaborator: ${err}`)
    return res.status(404).json({ message: err.message, errors: err.errors })
  }
}

export const getRepository = async (req: Request, res: Response) => {
  logger.verbose('getRepository: CHECK IF REPOSITORY EXISTS')
  try {
    const key = req.cookies.gitHub_token.slice(7)
    const decoded = jwt.verify(key, process.env.SECRET_KEY)
    const octokit = new Octokit({
      auth: (decoded as AccessToken).gitHub_token,
    })
    await octokit.request('GET /repos/{owner}/{repo}', {
      owner: req.body.owner,
      repo: req.body.repository,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    return res.status(200).json({ message: 'Repository exists.' })
  } catch (err) {
    logger.error(`getRepository: ${err}`)
    return res.status(404).json({ message: err.message, errors: err.errors })
  }
}
