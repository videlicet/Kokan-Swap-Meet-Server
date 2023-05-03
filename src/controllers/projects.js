import ErrorResponse from "../utils/ErrorResponse.js";

/*
export const getProducts = async (req, res, next) => {
  try {
    const { rowCount, rows } = await db.query('SELECT * FROM products;');
    if (!rowCount) throw new ErrorResponse('No products', 404);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      body: { name, description, stock, price }
    } = req;
    const {
      rows: [newProduct]
    } = await db.query(`INSERT INTO products (name, description, stock, price) VALUES($1, $2, $3, $4) RETURNING *`, [
      name,
      description,
      stock,
      price
    ]);
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const {
      params: { id }
    } = req;
    const {
      rowCount,
      rows: [product]
    } = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    if (!rowCount) throw new ErrorResponse(`Product with id of ${id} does not exist`, 404);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const {
      body: { name, description, stock, price },
      params: { id }
    } = req;
    const {
      rowCount,
      rows: [product]
    } = await db.query('UPDATE products SET (name, description, stock, price) = ($2, $3, $4, $5) WHERE id = $1', [
      id,
      name,
      description,
      stock,
      price
    ]);
    if (!rowCount) throw new ErrorResponse(`Product with id of ${id} does not exist`, 404);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const {
      params: { id }
    } = req;
    const {
      rowCount,
      rows: [product]
    } = await db.query('DELETE FROM products WHERE id = $1', [id]);
    if (!rowCount) throw new ErrorResponse(`Product with id of ${id} does not exist`, 404);
    res.json(product);
  } catch (error) {
    next(error);
  }
};
*/
