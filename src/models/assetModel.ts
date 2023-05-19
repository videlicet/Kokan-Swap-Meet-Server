/* The assetModel defines the data structure for assets */

import mongoose from 'mongoose'
const { Schema, model } = mongoose

const assetSchema = new Schema(
  {
    asset_id: String,
    gitHub_repo: String,
    title: String,
    kokans: Number,
    creator: String,
    created: String,
    owners: [String],
    onOffer: Boolean,
    type: [String],
    description_short: String,
    description_long: String,
    licence: String,
  },
  { collection: 'Assets' },
)

const Asset = model('Asset', assetSchema)

export default Asset
