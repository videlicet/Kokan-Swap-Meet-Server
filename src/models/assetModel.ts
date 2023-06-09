import mongoose from 'mongoose'
const { Schema, model } = mongoose

const assetSchema = new Schema(
  {
    asset_id: String,
    gitHub_repo: String,
    tags: [String],
    title: String,
    kokans: Number,
    creator: String,
    created: String,
    owners: [String],
    onOffer: Boolean,
    description_short: String,
    description_long: String,
    licence: String,
  },
  { collection: 'Assets' },
)

const Asset = model('Asset', assetSchema)

export default Asset
