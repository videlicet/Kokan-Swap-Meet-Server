import { Request, Response } from 'express'
import mongoose from 'mongoose'
import nodemailer from 'nodemailer'

/* import utils */
import { logger } from '../utils/Winston.js'

/* import utils */
import { verificationEmail, incomingSwapRequestEmail } from '../utils/Emails.js'

/* import models */
import User from '../models/userModel.js'

/* mongoose */
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

/* temporary store for verification codes */
let verificationCodesStore: any = {} // TODO typing

export const emailVerfication = async (req: Request, res: Response) => {
  logger.verbose('emailVerification: EMAIL VERIFICATION:')
  const verification_code = Math.floor(Math.random() * 90000) + 10000
  let mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: req.body.email,
    subject: 'Kokan: Welcome!',
    html: verificationEmail(req.body.username, verification_code.toString()),
  }
  transporter.sendMail(mailOptions, function (err: any, info: any) {
    // TODO typing
    if (!err) {
      logger.verbose('emailVerification: – EMAIL SENT')
      verificationCodesStore = {
        ...verificationCodesStore,
        [`${req.body.username}`]: { verification_code: verification_code },
      }
      /* set cookie with verification code*/
      const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const, // as const necessary because sameSite is not included on the CookieOptions type
        maxAge: 600000,
      }
      return res
        .status(200)
        .cookie('verification_code', verification_code, options)
        .json({ verification_code: verification_code })
    } else {
      logger.error(`emailVerification: ${err}`)
      return res.status(500).json({message: "Sending email verification failed."})
    }
  })
}

export const verifyVerificationCode = async (req: Request, res: Response) => {
  logger.verbose('verifyVerificationCode: GET VERIFICATION CODE:')
  const clientVerificationCode = req.cookies.verification_code
  if (verificationCodesStore[req.body.username]) {
    const { verification_code } = verificationCodesStore[req.body.username]
    logger.verbose(
      'verifyVerificationCode: – COMPARE VERIFICATION CODE AND CLIENT VERIFICATION CODE',
    )
    if (verification_code === Number(clientVerificationCode)) {
      try {
        logger.verbose('verifyVerificationCode: –– UPDATE USER IN DB:')
        await User.updateOne(
          { username: req.body.username },
          { email_verified: true },
        )
      } catch (err) {
        logger.error(`verifyVerificationCode: ${err}`)
      }
      return res
        .status(200)
        .clearCookie('verification_code', {
          path: '/',
          sameSite: 'none',
          secure: true,
        })
        .json({ success: true })
    } else {
      logger.error('verifyVerificationCode: – VERIFICATION CODE INVALID')
      return res.status(400).json({ success: false })
    }
  } else {
    logger.error('verifyVerificationCode: – NO VERIFICATION CODE PRESENT')
    return res.status(400).json({ success: false })
  }
}

export const submitSwapRequest = async (req: Request, res: Response) => {
  logger.verbose('submitSwapRequest: EMAIL NOTIFICATION INCOMING SWAP REQUEST:')
  /* query email of owner user */
  const { email } = await User.findOne({
    username: req.body.owner.username,
  }).exec()
  /* send email */
  let mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: 'Incoming swap request!',
    html: incomingSwapRequestEmail(
      req.body.user.username,
      req.body.owner.username,
      req.body.asset.title,
    ),
  }
  transporter.sendMail(mailOptions, function (err: any, info: any) {
    // TODO typing
    if (!err) {
      logger.verbose('submitSwapRequest: – EMAIL SENT')
    } else {
      logger.error(`submitSwapRequest: ${err}`)
    }
  })
  return res.status(200).json({ message: 'Email dispatched.' })
}
