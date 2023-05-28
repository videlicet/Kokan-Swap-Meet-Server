import { Router } from 'express'
import { createAsset, getAsset, updateAsset, deleteAsset, getSearchedAssets } from '../controllers/assets.js'

const assetsRouter = Router()

assetsRouter.route('/')
    .post(createAsset)

assetsRouter.route('/:id')
    .post(function (req, res, next) {
        /* change controller depending on parameter */
        switch(req.params.id) {
            case 'search':
                getSearchedAssets(req, res, next)
                break;
            default:
                getAsset(req, res, next)
                break;
          }
    })
    .put(updateAsset)
    .delete(deleteAsset)

export default assetsRouter
