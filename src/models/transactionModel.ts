/* The transactionModel defines the data structure for transactions */

import mongoose from 'mongoose'
const { Schema, model } = mongoose

const transactionSchema = new Schema(
  {
    asset_id: String,
    requester: String,
    requestee: [String],
    created: String,
    status: String, // 'pending', 'declined', 'accepted'
  },
  { collection: 'Transactions' },
)

const Transaction = model('Transaction', transactionSchema)

export default Transaction
