import mongoose from 'mongoose'
import { Request, Response, NextFunction } from 'express'
import Asset from '../models/assetModel.js'

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

export const getAsset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('GET ASSET FROM DATABASE:')
  console.group()
  try {
    const [asset] = await Asset.aggregate([
      {
        /* use asset id passed from client to query asset */
        $match: {
          $expr: {
            $eq: ['$_id', { $toObjectId: req.body.asset._id }],
          },
        },
      },
      {
        $addFields: {
          assetId: { $toString: '$_id' },
        },
      },
      /* aggregrate requester id with requester username after projecting requester id to ObjectId*/
      {
        $lookup: {
          from: 'Users',
          let: { creatorId: { $toObjectId: '$creator' } },
          pipeline: [
            {
              $match: { $expr: { $eq: ['$_id', '$$creatorId'] } },
            },
            {
              $project: {
                _id: 0,
                username: 1,
              },
            },
          ],
          as: 'creator_data',
        },
      },
      {
        $addFields: {
          creator_username: {
            $arrayElemAt: ['$creator_data.username', 0],
          },
        },
      },
      /* project owners ids in owners array to ObjectIds */
      {
        $addFields: {
          owners_ids: {
            $map: {
              input: '$owners',
              as: 'r',
              in: { $toObjectId: '$$r' },
            },
          },
        },
      },
      /* aggregrate owners ids with owners usernames */
      {
        $lookup: {
          from: 'Users',
          localField: 'owners_ids',
          foreignField: '_id',
          as: 'owners_data',
        },
      },
      {
        $addFields: {
          owners_usernames: '$owners_data.username',
        },
      },
      {
        $project: {
          assetId: 0,
          creator_data: 0,
          owners_ids: 0,
          owners_data: 0,
        },
      },
    ]).exec()
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
  console.log('UPTDATE ASSET IN DATABASE:')
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
