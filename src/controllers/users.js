import db from '../db/serverIndex.js';
import ErrorResponse from '../utils/ErrorResponse.js';

/*export const getOrders = async (req, res, next) => {
  try {
    const { rowCount, rows } = await db.query('SELECT * FROM orders;');
    if (!rowCount) throw new ErrorResponse('No orders', 404);
    res.json(rows);
  } catch (error) {
    next(error);
  }
}

export const getOrder = async (req, res, next) => {
  try {
    const {
      params: { id }
    } = req;
    const {
      rowCount,
      rows: [order]
    } = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (!rowCount) throw new ErrorResponse(`Order with id of ${id} does not exist`, 404);
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (req, res, next) => {
  try {
    const {
      body: { price, date, user_id },
      params: { id }
    } = req;
    const {
      rowCount,
      rows: [order]
    } = await db.query('UPDATE orders SET (price, date, user_id) = ($2, $3, $4) WHERE id = $1', [
      id,
      price,
      date,
      user_id
    ]);
    if (!rowCount) throw new ErrorResponse(`Order with id of ${id} does not exist`, 404);
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const deleteOrder =  async (req, res, next) => {
  try {
    const {
      params: { id }
    } = req;
    const {
      rowCount,
      rows: [order]
    } = await db.query('DELETE FROM orders WHERE id = $1', [id]);
    if (!rowCount) throw new ErrorResponse(`Order with id of ${id} does not exist`, 404);
    res.json(order);
  } catch (error) {
    next(error);
  }
};
*/