import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express'
import DB_URL from '../DB_URL.js'; // when hosting locally
import Asset from '../models/assetModel.ts';

mongoose.connect(DB_URL) // when hosting locally
// mongoose.connect(process.env.DB_URL) // when hosting on the web
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

export const getAssets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('GET to DATABASE')
    const users = await Asset.find({}).exec()
    res.status(200).json(users)
  } catch (error) {
    next(error)
  }
}

export const createAsset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('POST to DATABASE')
    const newAsset = new Asset(req.body)
    await newAsset.save()
    return res.status(201).json(newAsset)
  } catch (error) {
    next(error)
  }
}

export const getAsset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('GET to DATABASE')
    const asset = await Asset.find({}).exec() //specify what to search fo
    res.status(200).json(asset)
  } catch (error) {
    next(error)
  }
}

export const updateAsset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('PUT to DATABASE')
    await Asset.updateMany() // not update Many, how to decide what to update? just all of it?
    const updatedAsset = await Asset.find({}).exec()
    return res.status(200).json(updatedAsset)
  } catch (error) {
    next(error)
  }
}

export const deleteAsset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('DELETE to DATABSE')
    console.log(req.body)
    const deletedAsset = await Asset.deleteMany({}) //delete ONE
    return res.status(201).json(deletedAsset) // QQ 201?
  } catch (error) {
    next(error)
  }
}
