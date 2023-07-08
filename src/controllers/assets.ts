import mongoose from 'mongoose'
import { Request, Response, NextFunction } from 'express'

/* import utils */
import { logger } from '../utils/Winston.js'

/* import models */
import Asset from '../models/assetModel.js'

/* import aggregations */
import { aggregateAssets } from '../aggregations/assetsAggregations.js'

/* mongoose */
mongoose.connect(process.env.DB_URL)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

export const createAsset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.verbose('createAsset: CREATE ASSET IN DATABASE')
  try {
    const newAsset = new Asset(req.body)
    await newAsset.save()
    return Object.keys(newAsset).length > 0
      ? res.status(201).json(newAsset)
      : res.status(400).json({ message: 'Creation failed.' })
  } catch (err) {
    logger.error(`createAsset: ${err}`)
    next(err)
  }
}

export const deleteAssets = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.verbose('deleteAssets: DELETE ASSETS IN DATABASE')
  try {
    const deletedAssets = await Asset.deleteMany({
      owners: {
        $size: 1,
        $all: [req.body.user._id],
      },
    })
    return Object.keys(deletedAssets).length > 0
      ? res.status(200).json({ message: 'Delete successfull.' })
      : res.status(400).json({ message: 'Delete failed.' })
  } catch (err) {
    logger.error(`deleteAssets: ${err}`)
    next(err)
  }
}

export const getAsset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.verbose('getAsset: GET ASSET FROM DATABASE')
  try {
    const asset = await aggregateAssets(req.body.asset._id)
    return Object.keys(asset).length > 0
      ? res.status(200).json(asset)
      : res.status(404).json({ message: 'No asset found.' })
  } catch (err) {
    logger.error(`getAsset: ${err}`)
    next(err)
  }
}

export const updateAsset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.verbose('updateAsset: UPDATE ASSET IN DATABASE')
  try {
    const searchCriterion = { _id: req.body.asset.asset_id }
    const updatedAsset = await Asset.updateOne(searchCriterion, req.body.update)
    return Object.keys(updatedAsset).length > 0
      ? res.status(200).json({ message: 'Update successfull.' })
      : res.status(400).json({ message: 'Update failed.' })
  } catch (err) {
    logger.error(`updateAsset: ${err}`)
    next(err)
  }
}

export const deleteAsset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.verbose('deleteAsset: DELETE ASSET IN DATABASE')
  try {
    const deletedAsset = await Asset.deleteOne({ _id: req.body.asset._id })
    return Object.keys(deletedAsset).length > 0
      ? res.status(200).json({ message: 'Delete successfull.' })
      : res.status(400).json({ message: 'Delete failed.' })
  } catch (err) {
    logger.error(`deleteAsset: ${err}`)
    next(err)
  }
}

export const getSearchedAssets = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.verbose('getSearchedAssets: SEARCH ASSETS IN DATABASE')
  try {
    const searchTerm = req.query.query
    const searchPages = req.query.pages // TODO for later implementation
    const searchTags = req.query.tags
    let assets
    if (searchTags == 'assets') {
      assets = await Asset.find({
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          {
            description_short: {
              $regex: searchTerm,
              $options: 'i',
            },
          },
          {
            description_long: {
              $regex: searchTerm,
              $options: 'i',
            },
          },
        ],
      })
        .sort({ created: -1 })
        .exec()
    } else if (searchTags == 'tags') {
      assets = await Asset.find({ tags: { $regex: searchTerm, $options: 'i' } })
        .sort({ created: -1 })
        .exec()
    }
    return Object.keys(assets).length > 0
      ? res.status(200).json(assets)
      : res.status(400).json({ message: 'No assets found.' })
  } catch (err) {
    logger.error(`getSearchedAssets: ${err}`)
    next(err)
  }
}