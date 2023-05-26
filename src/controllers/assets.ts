import mongoose from 'mongoose'
import { Request, Response, NextFunction } from 'express'
import Asset from '../models/assetModel.js'

mongoose.connect(process.env.DB_URL)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

export const getAssets = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('GET to DATABASE')
    const users = await Asset.find({}).exec()
    return res.status(200).json(users)
  } catch (error) {
    next(error)
  }
}

export const createAsset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('POST to DATABASE')
    const newAsset = new Asset(req.body)
    await newAsset.save()
    return res.status(201).json(newAsset)
  } catch (error) {
    next(error)
  }
}

export const getAsset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('GET to DATABASE')
    const asset = await Asset.findOne({ _id: req.body.asset._id }).exec()
    return res.status(200).json(asset)
  } catch (error) {
    next(error)
  }
}

export const updateAsset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('PUT to DATABASE')
    const searchCriterion = { _id: req.body.asset.asset_id }
    await Asset.updateOne(searchCriterion, req.body.update)
    const updatedAsset = await Asset.find(searchCriterion).exec()
    return res.status(200).json('Update successfull')
  } catch (error) {
    next(error)
  }
}

export const deleteAsset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('DELETE to DATABASE')
    const deletedAsset = await Asset.deleteOne({ _id: req.body.asset._id })
    return res.status(200).send('Delete successfull') // QQ 201?
  } catch (error) {
    next(error)
  }
}

export const getSearchedAssets = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('GET to DATABASE')
    let assets = await Asset.find({
      $or: [
        { title: { $regex: req.body.asset.searchTerm, $options: 'i' } },
        {
          description_short: {
            $regex: req.body.asset.searchTerm,
            $options: 'i',
          },
        },
        {
          description_long: {
            $regex: req.body.asset.searchTerm,
            $options: 'i',
          },
        },
      ],
    }).exec()
    return res.status(200).json(assets)
  } catch (error) {
    next(error)
  }
}
