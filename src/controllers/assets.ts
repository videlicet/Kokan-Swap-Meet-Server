import mongoose from 'mongoose'
import { Request, Response, NextFunction } from 'express'

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
  console.log('CREATE ASSET IN DATABASE:')
  console.group()
  try {
    const newAsset = new Asset(req.body)
    await newAsset.save()
    console.log('COMPLETED')
    console.groupEnd()
    return Object.keys(newAsset).length > 0
      ? res.status(201).json(newAsset)
      : res.status(400).json({ message: 'Creation failed.' })
  } catch (err) {
    console.log('FAILURE')
    console.log(err)
    console.groupEnd()
    next(err)
  }
}

export const deleteAssets = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('DELETE ASSETS IN DATABASE')
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
    console.log(err)
    next(err)
  }
}

export const getAsset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('GET ASSET FROM DATABASE:')
  console.group()
  try {
    const asset = await aggregateAssets(req.body.asset._id)
    console.log('SUCCESS')
    console.groupEnd()
    return Object.keys(asset).length > 0
      ? res.status(200).json(asset)
      : res.status(404).json({ message: 'No asset found.' })
  } catch (err) {
    console.log('FAILURE')
    console.log(err)
    console.groupEnd()
    next(err)
  }
}

export const updateAsset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('UPDATE ASSET IN DATABASE:')
  console.group()
  try {
    const searchCriterion = { _id: req.body.asset.asset_id }
    const updatedAsset = await Asset.updateOne(searchCriterion, req.body.update)
    console.log('COMPLETED')
    console.groupEnd()
    return Object.keys(updatedAsset).length > 0
      ? res.status(200).json({ message: 'Update successfull.' })
      : res.status(400).json({ message: 'Update failed.' })
  } catch (err) {
    console.log('FAILURE')
    console.log(err)
    console.groupEnd()
    next(err)
  }
}

export const deleteAsset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('DELETE ASSET IN DATABASE:')
  console.group()
  try {
    const deletedAsset = await Asset.deleteOne({ _id: req.body.asset._id })
    console.log('COMPLETED')
    console.groupEnd()
    return Object.keys(deletedAsset).length > 0
      ? res.status(200).json({ message: 'Delete successfull.' })
      : res.status(400).json({ message: 'Delete failed.' })
  } catch (err) {
    console.log('FAILURE')
    console.log(err)
    console.groupEnd()
    next(err)
  }
  console.groupEnd()
}

export const getSearchedAssets = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('SEARCH ASSETS IN DATABASE:')
  console.group()
  try {
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
    })
      .sort({ created: -1 })
      .exec()
    console.log('COMPLETED')
    console.groupEnd()
    return Object.keys(assets).length > 0
      ? res.status(200).json(assets)
      : res.status(400).json({ message: 'No assets found.' })
  } catch (err) {
    console.log('FAILURE')
    console.log(err)
    console.groupEnd()
    next(err)
  }
}
