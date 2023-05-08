import { Router } from 'express'
import {  getAssets, createAsset, getAsset, updateAsset, deleteAsset } from '../controllers/assets.js'

const assetsRouter = Router()

assetsRouter.route('/')
    .get(getAssets)
    .post(createAsset)

assetsRouter.route('/:id')
    .get(getAsset)
    .put(updateAsset)
    .delete(deleteAsset)

export default assetsRouter
