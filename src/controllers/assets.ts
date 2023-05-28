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
    console.log('– GET ASSET FROM DATABASE:')
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
          owners_data: 0
        },
      },
    ]).exec()
    console.log('– SUCCESS')
    return Object.keys(asset).length > 0
      ? res.status(200).json(asset)
      : res.status(404).json({ message: 'No asset found.' })
  } catch (err) {
    console.log('X FAILURE')
    console.log(err)
    next(err)
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
