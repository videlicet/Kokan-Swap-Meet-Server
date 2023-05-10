/* The assetModel defines the data structure for assets */

import mongoose from 'mongoose'
const { Schema, model } = mongoose

const assetSchema = new Schema(
  {
    asset_id: Number,
    title: String,
    kokans: Number,
    creator: String,
    created: String,
    owners: [String], // QQ how to indicate type?
    type: [String], // QQ how to indicate type?
    description_short: String,
    description_long: String,
    // TD tag?
    licence: String,
  },
  { collection: 'Assets' },
)

const Asset = model('Asset', assetSchema)

export default Asset
