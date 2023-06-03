/* import models */
import Transaction from '../models/transactionModel.js'

export async function aggregateTransactions(id: string) {
  const transactionWithUsers = await Transaction.aggregate([
    {
      /* use transaction id passed from the client to query the correct asset */
      $match: {
        $expr: {
          $eq: ['$_id', { $toObjectId: id}],
        },
      },
    },
    /* project requestee ids in requestee array to ObjectIds */
    {
      $addFields: {
        requestee: {
          $map: {
            input: '$requestee',
            as: 'r',
            in: { $toObjectId: '$$r' },
          },
        },
      },
    },
    /* aggregrate requester id with requester username after projecting requester id to ObjectId*/
    {
      $lookup: {
        from: 'Users',
        let: { requesterId: { $toObjectId: '$requester' } },
        pipeline: [
          {
            $match: { $expr: { $eq: ['$_id', '$$requesterId'] } },
          },
          {
            $project: {
              _id: 0,
              username: 1,
              kokans: 1,
            },
          },
        ],
        as: 'requester_data',
      },
    },
    {
      $addFields: {
        requester_username: {
          $arrayElemAt: ['$requester_data.username', 0],
        },
        requester_kokans: { $arrayElemAt: ['$requester_data.kokans', 0] },
      },
    },
    /* aggregrate requestee ids with requestee usernames */
    {
      $lookup: {
        from: 'Users',
        localField: 'requestee',
        foreignField: '_id',
        as: 'requestee_data',
      },
    },
    {
      $addFields: {
        requestees_username: '$requestee_data.username',
      },
    },

    /* aggregate asset id with asset */
    {
      $lookup: {
        from: 'Assets',
        let: { assetId: { $toObjectId: '$asset_id' } },
        pipeline: [
          {
            $match: { $expr: { $eq: ['$_id', '$$assetId'] } },
          },
        ],
        as: 'asset_data',
      },
    },
    {
      $addFields: {
        asset_data: { $arrayElemAt: ['$asset_data', 0] },
      },
    },
    {
      $project: {
        requestee_data: 0,
        requester_data: 0,
      },
    },
  ]).exec()
  return transactionWithUsers
}
