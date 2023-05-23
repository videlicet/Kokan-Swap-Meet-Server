// @ts-nocheck
import mongoose from 'mongoose'
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { Octokit } from 'octokit'
import nodemailer from 'nodemailer'
import fetch from 'node-fetch' // node has fetch integrated since 2022, but deploying on render requires it

/* models */
import User from '../models/userModel.js'

/* utils */
import { verificatioEmail } from '../utils/Emails.js'

/* mongo DB setup */
mongoose.connect(process.env.DB_URL)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

/* nodemailer setup */
let transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_ADDRESS_PW,
  },
})

let verificationCodesStore: any = {} // TD typing

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
          return res.status(403).json({
            success: false,
            message: 'JWT authentication failed',
          })
        }
        console.log('– GET USER FROM DATABASE')
        /* find user in database */
        // TD modularize
        const user = await User.aggregate([
          {
            /* use user id passed from the client to query the correct user */
            $match: {
              $expr: {
                $eq: ['$username', authData.username],
              },
            },
          },
          {
            $addFields: {
              userId: { $toString: '$_id' },
            },
          },
          /* aggregrate user id with the number of total assets */
          {
            $lookup: {
              from: 'Assets',
              localField: 'userId',
              foreignField: 'owners',
              as: 'assets_total',
            },
          },
          {
            $addFields: {
              asset_count: { $size: '$assets_total' },
            },
          },

          /* aggregrate user id with the number of pending assets */
          {
            $lookup: {
              from: 'Assets',
              let: { userId: '$userId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$status', 'pending'] },
                        { $in: ['$$userId', '$owners'] },
                      ],
                    },
                  },
                },
              ],
              as: 'assets_pending',
            },
          },

          /* aggregrate user id with the number of pending incoming requests */
          {
            $lookup: {
              from: 'Transactions',
              let: { userId: '$userId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$status', 'pending'] },
                        { $in: ['$$userId', '$requestee'] },
                      ],
                    },
                  },
                },
              ],
              as: 'requests_incoming_pending',
            },
          },

          /* aggregrate user id with the number of pending outgoing requests */
          {
            $lookup: {
              from: 'Transactions',
              localField: 'userId',
              foreignField: 'requester',
              as: 'requests_outgoing_pending',
            },
          },

          {
            $addFields: {
              assets_count_pending: { $size: '$assets_pending' },
              requests_incoming_count_pending: {
                $size: '$requests_incoming_pending',
              },
              requests_outgoing_count_pending: {
                $size: '$requests_outgoing_pending',
              },
            },
          },
          {
            $project: {
              password: 0,
              userId: 0,
              assets_total: 0,
              assets_pending: 0,
              requests_incoming_pending: 0,
              requests_outgoing_pending: 0,
            },
          },
        ]).exec()
        return user
          ? res.status(200).json(user[0])
          : res.status(404).send('No user found.')
      },
    )
  } else {
    res.status(403).json({
      success: false,
      message: 'Authentication failed',
    })
  }
}

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
        maxAge: 3600000,
      }
      res.status(200).cookie('token', accessToken, options).send('Password correct.')
    } catch (error) {
      return res
        .status(500)
        .json({ message: error.message, errors: error.errors })
    }
  } else return res.status(401).json({ message: 'Password incorrect.' })
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
      .clearCookie('access_token', {
        path: '/',
        sameSite: 'none',
        secure: true,
      })
      .sendStatus(200)
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message, errors: error.errors })
  }
}

export const emailVerfication = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('EMAIL VERIFICATION:')
  const verification_code = Math.floor(Math.random() * 90000) + 10000
  let mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: req.body.email,
    subject: 'Kokan: Welcome!',
    html: verificatioEmail(req.body.username, verification_code),
  }
  transporter.sendMail(mailOptions, function (error: any, info: any) {
    // TD typing
    if (error) {
      console.log(error)
    } else {
      console.log('– EMAIL SENT: ' + info.response)
      verificationCodesStore = {
        ...verificationCodesStore,
        [`${req.body.username}`]: { verification_code: verification_code },
      }
      console.log(verificationCodesStore)
    }
  })
  /* set cookie with verification code*/
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'none' as const, // as const necessary because sameSite is not included on the CookieOptions type
    maxAge: 3600000, // TD change maxAge to 10 min
  }
  return res
    .status(200)
    .cookie('verification_code', verification_code, options)
    .json({ verification_code: verification_code })
}

export const verifyVerificationCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('GET VERIFICATION CODE: ')
  const clientVerificationCode = req.cookies.verification_code
  if (verificationCodesStore[req.body.username]) {
    const { verification_code } = verificationCodesStore[req.body.username]
    if (verification_code === Number(clientVerificationCode)) {
      return res.status(200).json({ success: true })
    } else return res.status(400).json({ success: false })
  } else return res.status(400).json({ success: false })
}

export const getGitHubAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
      { access_token: accessToken.access_token },
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
    console.log('X FAILED')
    console.log(err)
    return res.send()
  }
}

export const getGitHubUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('GET GITHUB USER:')
  console.log('– VERIFY GITHUB JWT ACCESS TOKEN')
  /* verify and decode gitHub access_token cookie */
  const key = req.cookies.access_token.slice(7)
  const decoded = jwt.verify(key, process.env.SECRET_KEY)

  console.log('– CALL GITHUB API:')
  const octokit = new Octokit({
    auth: decoded.access_token, //TD typing
  })

  try {
    const gitHubUser = await octokit.request('GET /user', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    if (gitHubUser) {
      console.log('–– SUCCESS')
      return res.status(200).json(gitHubUser.data)
    }
    console.log('–X FAILURE')
    return res.status(404).send('No GitHub User Found')
  } catch (err) {
    console.log('X FAILURE')
    console.log(err)
  }
}

export const addGitHubCollaborator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  /* verify and decode gitHub access_token cookie */
  const key = req.cookies.access_token.slice(7)
  const decoded = jwt.verify(key, process.env.SECRET_KEY)

  console.log('ADD COLLABORATOR TO GITHUB REPO')
  const octokit = new Octokit({
    auth: decoded.access_token, //TD typing
  })

  /* test: get repo collaborators */
  let collaborators = await octokit.request(
    'GET /repos/{owner}/{repo}/collaborators',
    {
      owner: req.body.requesteeGitHub,
      repo: req.body.gitHubRepo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    },
  )
  let { data } = collaborators

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
