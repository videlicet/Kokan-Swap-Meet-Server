/* The transactionModel defines the data structure for transactions */

import mongoose from 'mongoose'
const { Schema, model } = mongoose

const transactionSchema = new Schema(
  {
    request_id: Number,
    asset_id: Number,
    requester: String, // for testing, should be number
    requestee: String, // for testing, should be number
    request_created: String,
    owners: [String], // QQ how to indicate type here?
    status: String, // 'pending', 'declined', 'accepted'
  },
  { collection: 'Transactions' },
)

const Transaction = model('Transaction', transactionSchema)

export default Transaction
