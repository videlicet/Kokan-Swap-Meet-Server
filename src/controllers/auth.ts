// @ts-nocheck
import { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { Octokit } from 'octokit'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import fetch from 'node-fetch' // node has fetch integrated since 2022, but deploying on render requires it (May 2023)

/* import models */
import User from '../models/userModel.js'

/* mongoose */
mongoose.connect(process.env.DB_URL)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

export const loginUser = async (req: Request, res: Response) => {
  console.log('GET USER IN DATABASE:')
  /*  find user in db */
  const user = await User.findOne({ username: req.body.username }).exec()

  if (!user) {
    return res.status(404).json({ message: 'User not found.' })
  }
  /* compare send password with stored password */
  const passwordCorrect = await bcrypt.compare(req.body.password, user.password)
  if (user && passwordCorrect == true) {
    /* create access token*/
    let accessToken = jwt.sign(
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
      .cookie('token', accessToken, options)
      .json({ message: 'Password correct.' })
  } else {
    return res.status(401).json({ message: err.message, errors: err.errors })
  }
}

export const logoutUser = async (req: Request, res: Response) => {
  console.log('CLEAR COOKIE:')
  /* TODO how can this fail ? no catch necessary*/
  try {
    return res
      .clearCookie('token', { path: '/', sameSite: 'none', secure: true })
      .clearCookie('access_token', {
        path: '/',
        sameSite: 'none',
        secure: true,
      })
      .sendStatus(200)
  } catch (err) {
    console.log('X FAILURE')
    return res.status(500).json({ message: err.message, errors: err.errors })
  }
}

export const getGitHubAccessToken = async (req: Request, res: Response) => {
  console.log('GET GITHUB ACCESS TOKEN:')
  const params =
    '?client_id=' +
    process.env.GITHUB_CLIENT_ID +
    '&client_secret=' +
    process.env.GITHUB_CLIENT_SECRET +
    '&code=' +
    req.query.code
  try {
    /* request GitHub access token  */
    console.log('– REQUEST GITHUB ACCESS TOKEN')
    const authentictor = await fetch(
      `https://github.com/login/oauth/access_token${params}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      },
    )
    let accessToken = await authentictor.json()
    console.log('– JWT SIGN GITHUB ACCESS TOKEN')

    /* jwt sign GitHub access token  */
    accessToken = jwt.sign(
      { access_token: accessToken.access_token }, // TODO typing
      process.env.SECRET_KEY,
    )

    /* create a response cookie */
    console.log('– SEND RESPONSE COOKIE')
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const, // as const necessary because sameSite is not included on the CookieOptions type
    }
    return res
      .status(200)
      .cookie('access_token', 'Bearer ' + accessToken, options)
      .send()
  } catch (err) {
    console.log('X FAILUR')
    console.log(err)
    return res.status(400).json({ message: err.message, errors: err.errors })
  }
}

export const getGitHubUser = async (req: Request, res: Response) => {
  console.log('GET GITHUB USER:')
  console.log('– VERIFY GITHUB JWT ACCESS TOKEN')
  /* verify and decode gitHub access_token cookie and call gitHub API if successful */
  const key = req.cookies.access_token.slice(7)
  const decoded = jwt.verify(key, process.env.SECRET_KEY)
  console.log('– CALL GITHUB API:')
  const octokit = new Octokit({
    auth: decoded.access_token, // TODO typing
  })
  try {
    const gitHubUser = await octokit.request('GET /user', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    if (gitHubUser) {
      console.log('– SUCCESS')
      return res.status(200).json(gitHubUser.data)
    }
    console.log('–X FAILURE')
    return res.status(404).send('No GitHub User Found')
  } catch (err) {
    console.log('X FAILURE')
    console.log(err)
    return res.status(404).json({ message: err.message, errors: err.errors })
  }
}

export const addGitHubCollaborator = async (req: Request, res: Response) => {
  /* verify and decode gitHub access_token cookie */
  const key = req.cookies.access_token.slice(7)
  const decoded = jwt.verify(key, process.env.SECRET_KEY)

  /* add collaborator to GitHub Repo*/
  console.log('ADD COLLABORATOR TO GITHUB REPO:')
  const octokit = new Octokit({
    auth: decoded.access_token, // TODO typing
  })
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
    console.log('– SUCCESFULLY SENT COLLOABORATION INVITATION')
    const collaborators = resCollaborators.data
    return res.status(200).json(collaborators)
  } catch (err) {
    console.log('–FAILURE')
    console.log(err)
    return res.status(404).json({ message: err.message, errors: err.errors })
  }
}

export const getRepository = async (req: Request, res: Response) => {
  console.log('CHECK IF REPOSITORY EXISTS:')
  try {
    const key = req.cookies.access_token.slice(7)
    const decoded = jwt.verify(key, process.env.SECRET_KEY)
    const octokit = new Octokit({
      auth: decoded.access_token, // TODO typing
    })
    await octokit.request('GET /repos/{owner}/{repo}', {
      owner: req.body.owner,
      repo: req.body.repository,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    console.log('– REPOSITORY EXISTS.')
    return res.status(200).json({ message: 'Repository exists.' })
  } catch (err) {
    console.log('X FAILURE')
    console.log(err)
    return res.status(404).json({ message: err.message, errors: err.errors })
  }
}
