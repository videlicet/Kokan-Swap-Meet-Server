/* models */
import User from '../models/userModel.js'

export async function aggregateUser(criterion: any) {
  const [user] = await User.aggregate([
    {
      /* use user id passed from client to query user */
      $match: {
        $expr: {
          $eq: criterion,
        },
      },
    },
    {
      $addFields: {
        userId: { $toString: '$_id' },
      },
    },
    /* aggregrate user id with number of assets */
    {
      $lookup: {
        from: 'Assets',
        localField: 'userId',
        foreignField: 'owners',
        as: 'assets_total',
      },
    },
    {
      $addFields: {
        assets_count: { $size: '$assets_total' },
      },
    },

    /* aggregrate user id with number of assets on offer */
    {
      $lookup: {
        from: 'Assets',
        let: { userId: '$userId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$onOffer', true] },
                  { $in: ['$$userId', '$owners'] },
                ],
              },
            },
          },
        ],
        as: 'assets_offered',
      },
    },

    /* aggregrate user id with number of pending incoming requests */
    {
      $lookup: {
        from: 'Transactions',
        let: { userId: '$userId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$status', 'pending'] },
                  { $in: ['$$userId', '$requestee'] },
                ],
              },
            },
          },
        ],
        as: 'requests_incoming_pending',
      },
    },

    /* aggregrate user id with number of pending outgoing requests */
    {
      $lookup: {
        from: 'Transactions',
        let: {
          userId: '$userId',
          requesterId: { $toObjectId: '$requester' },
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$status', 'pending'] },
                  { $eq: ['$requester', '$$userId'] },
                ],
              },
            },
          },
        ],
        as: 'requests_outgoing_pending',
      },
    },

    {
      $addFields: {
        assets_count_offered: { $size: '$assets_offered' },
        requests_incoming_count_pending: {
          $size: '$requests_incoming_pending',
        },
        requests_outgoing_count_pending: {
          $size: '$requests_outgoing_pending',
        },
      },
    },
    {
      $project: {
        password: 0,
        userId: 0,
        assets_total: 0,
        assets_offered: 0,
        requests_incoming_pending: 0,
        requests_outgoing_pending: 0,
      },
    },
  ]).exec()
  return user
}
