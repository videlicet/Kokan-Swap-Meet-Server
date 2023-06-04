/* import models */
import Asset from '../models/assetModel.js'

export async function aggregateAssets(id: string) {
  const [asset] = await Asset.aggregate([
    {
      /* use asset id passed from client to query asset */
      $match: {
        $expr: {
          $eq: ['$_id', { $toObjectId: id }],
        },
      },
    },
    {
      $addFields: {
        assetId: { $toString: '$_id' },
      },
    },
    /* aggregrate creator id with creator username after projecting creator id to ObjectId */
    {
      $lookup: {
        from: 'Users',
        let: { creatorId: { $toObjectId: '$creator' } },
        pipeline: [
          {
            $match: { $expr: { $eq: ['$_id', '$$creatorId'] } },
          },
          {
            $project: {
              _id: 0,
              username: 1,
            },
          },
        ],
        as: 'creator_data',
      },
    },
    {
      $addFields: {
        creator_username: {
          $arrayElemAt: ['$creator_data.username', 0],
        },
      },
    },
    /* project owners ids in owners array to ObjectIds */
    {
      $addFields: {
        owners_ids: {
          $map: {
            input: '$owners',
            as: 'r',
            in: { $toObjectId: '$$r' },
          },
        },
      },
    },
    /* aggregrate owners ids with owners usernames */
    {
      $lookup: {
        from: 'Users',
        localField: 'owners_ids',
        foreignField: '_id',
        as: 'owners_data',
      },
    },
    {
      $addFields: {
        owners_usernames: '$owners_data.username',
      },
    },
    /* cheack if swap request exists by aggregating a transaction creation date */
    {
      $lookup: {
        from: 'Transactions',
        let: {
          assetId: { $toString: '$_id' },
          requesterId: id,
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$asset_id', '$$assetId'] },
                  { $eq: ['$requester', '$$requesterId'] },
                  { $in: ['$status', ['pending', 'accepted']] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
              created: 1,
              status: 1,
            },
          },
        ],
        as: 'transaction_data',
      },
    },

    /* cheack if swap request exists by aggregating a transaction creation date */
    {
      $lookup: {
        from: 'Transactions',
        let: {
          assetId: { $toString: '$_id' },
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$asset_id', '$$assetId'] },
                  { $eq: ['$status', 'pending'] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
              requester: 1,
            },
          },
        ],
        as: 'transaction_requesters_data',
      },
    },
    {
      $addFields: {
        transaction_created: {
          $arrayElemAt: ['$transaction_data.created', 0],
        },
        transaction_status: {
          $arrayElemAt: ['$transaction_data.status', 0],
        },
        transaction_requesters: '$transaction_requesters_data.requester',
      },
    },
    {
      $project: {
        assetId: 0,
        creator_data: 0,
        transaction_data: 0,
        transaction_requesters_data: 0,
        owners_ids: 0,
        owners_data: 0,
      },
    },
  ]).exec()
  return asset
}
