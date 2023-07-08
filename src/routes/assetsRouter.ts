import { Router } from 'express'
import { createAsset, deleteAssets, getAsset, updateAsset, deleteAsset, getSearchedAssets } from '../controllers/assets.js'
import { JWTAuthentication, gitHubAuthentication } from '../middlewares/authentication.js'

const assetsRouter = Router()

assetsRouter.use(JWTAuthentication, gitHubAuthentication)

assetsRouter.route('/')
    .post(createAsset)
    .delete(deleteAssets)

assetsRouter.route('/:id')
    .get(getSearchedAssets)
    .post(getAsset)
    .put(updateAsset)
    .delete(deleteAsset)

export default assetsRouter
