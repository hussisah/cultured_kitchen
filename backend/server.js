const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
app.set('etag', false);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploads folder
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// =========================
// POSTGRESQL CONNECTION
// =========================

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});


// =========================
// TEST ROUTE
// =========================

app.get('/', (req, res) => {
  res.send('Cultured Kitchen API is running...');
});


// =========================
// CEO AUTH CHECK
// =========================

function requireCEO(req, res, next) {
  const role = req.headers['x-admin-role'];

  if (role !== 'CEO') {
    return res.status(403).json({
      error: 'CEO access required'
    });
  }

  next();
}


// =========================
// GET ALL PRODUCTS
// =========================

app.get('/products', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products ORDER BY id ASC'
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Failed to fetch products'
    });
  }
});


// =========================
// ADD NEW PRODUCT
// CEO ONLY
// =========================

app.post('/products', requireCEO, async (req, res) => {

  const {
    name,
    price,
    image,
    stock,
    category,
    description
  } = req.body;

  try {

    const result = await pool.query(
      `
      INSERT INTO products (
        name,
        price,
        image,
        stock,
        category,
        description
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [
        name,
        price,
        image,
        stock,
        category,
        description
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Failed to add product'
    });
  }
});

// =========================
// DELETE PRODUCT
// CEO ONLY
// =========================

app.delete('/products/:id', requireCEO, async (req, res) => {

  const { id } = req.params;

  try {

    const result = await pool.query(
      `
      DELETE FROM products
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        error: 'Product not found'
      });

    }

    res.json({
      message: 'Product deleted successfully',
      product: result.rows[0]
    });

  } catch (error) {

    console.error(
      'Delete product error:',
      error
    );

    res.status(500).json({
      error: 'Failed to delete product'
    });

  }

});


// =========================
// ADD STOCK
// CEO ONLY
// =========================

app.put('/products/:id/add-stock', requireCEO, async (req, res) => {

  const { id } = req.params;
  const { amount } = req.body;

  if (!Number.isInteger(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({
      error: 'Stock amount must be a positive whole number'
    });
  }

  try {

    const result = await pool.query(
      `
      UPDATE products
      SET
        stock = stock + $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [
        Number(amount),
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    res.json(result.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Failed to add stock'
    });
  }
});


// =========================
// REDUCE STOCK
// CEO ONLY
// =========================

app.put('/products/:id/reduce-stock', requireCEO, async (req, res) => {

  const { id } = req.params;
  const { amount } = req.body;

  if (!Number.isInteger(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({
      error: 'Stock amount must be a positive whole number'
    });
  }

  try {

    const result = await pool.query(
      `
      UPDATE products
      SET
        stock = stock - $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
        AND stock >= $1
      RETURNING *
      `,
      [
        Number(amount),
        id
      ]
    );

    if (result.rows.length === 0) {

      const product = await pool.query(
        'SELECT * FROM products WHERE id = $1',
        [id]
      );

      if (product.rows.length === 0) {
        return res.status(404).json({
          error: 'Product not found'
        });
      }

      return res.status(400).json({
        error: 'Not enough stock'
      });
    }

    res.json(result.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Failed to reduce stock'
    });
  }
});


// =========================
// CREATE ORDER
// =========================

app.post('/orders', async (req, res) => {

  const {
    customer_name,
    email,
    phone,
    whatsapp,
    delivery_type,
    delivery_address,
    payment_proof,
    total_amount,
    items
  } = req.body;

  try {

    const result = await pool.query(
      `
      INSERT INTO orders (
        customer_name,
        email,
        phone,
        whatsapp,
        delivery_type,
        delivery_address,
        payment_proof,
        total_amount,
        items
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [
        customer_name,
        email,
        phone,
        whatsapp,
        delivery_type,
        delivery_address,
        payment_proof,
        total_amount,
        JSON.stringify(items)
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Failed to save order'
    });
  }
});


// =========================
// GET ALL ORDERS
// =========================

app.get('/orders', async (req, res) => {

  try {

    const result = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC'
    );

    res.json(result.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Failed to fetch orders'
    });
  }
});


// =========================
// APPROVE ORDER
// REDUCES REAL INVENTORY
// =========================

app.put('/orders/:id/approve', async (req, res) => {

  const { id } = req.params;

  const client = await pool.connect();

  try {

    // Start transaction
    await client.query('BEGIN');

    // Get the order
    const orderResult = await client.query(
      'SELECT * FROM orders WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (orderResult.rows.length === 0) {

      await client.query('ROLLBACK');

      return res.status(404).json({
        error: 'Order not found'
      });
    }

    const order = orderResult.rows[0];

    // Prevent approving an already approved order
    if (order.status === 'Approved') {

      await client.query('ROLLBACK');

      return res.status(400).json({
        error: 'Order is already approved'
      });
    }

    // Prevent approving a declined order
    if (order.status === 'Declined') {

      await client.query('ROLLBACK');

      return res.status(400).json({
        error: 'Declined orders cannot be approved'
      });
    }

    const items = Array.isArray(order.items)
      ? order.items
      : JSON.parse(order.items || '[]');


    // ==========================================
    // CHECK STOCK FOR EVERY PRODUCT FIRST
    // ==========================================

    for (const item of items) {

      const productId = Number(item.id);
      const quantity = Number(item.quantity || 0);

      if (!productId || quantity <= 0) {

        await client.query('ROLLBACK');

        return res.status(400).json({
          error: 'Invalid product information in order'
        });
      }

      const productResult = await client.query(
        'SELECT * FROM products WHERE id = $1 FOR UPDATE',
        [productId]
      );

      if (productResult.rows.length === 0) {

        await client.query('ROLLBACK');

        return res.status(400).json({
          error: `Product with ID ${productId} was not found`
        });
      }

      const product = productResult.rows[0];

      if (product.stock < quantity) {

        await client.query('ROLLBACK');

        return res.status(400).json({
          error: `Not enough stock for ${product.name}. Available: ${product.stock}, requested: ${quantity}`
        });
      }
    }


    // ==========================================
    // REDUCE STOCK
    // ==========================================

    for (const item of items) {

      const productId = Number(item.id);
      const quantity = Number(item.quantity || 0);

      await client.query(
        `
        UPDATE products
        SET
          stock = stock - $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        `,
        [quantity, productId]
      );
    }


    // ==========================================
    // APPROVE ORDER
    // ==========================================

    const updatedOrder = await client.query(
      `
      UPDATE orders
      SET status = 'Approved'
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );


    // Commit everything
    await client.query('COMMIT');

    res.json({
      message: 'Order approved and stock updated',
      order: updatedOrder.rows[0]
    });

  } catch (error) {

    await client.query('ROLLBACK');

    console.error('Approve order error:', error);

    res.status(500).json({
      error: 'Failed to approve order'
    });

  } finally {

    client.release();
  }
});


// =========================
// DECLINE ORDER
// =========================

app.put('/orders/:id/decline', async (req, res) => {

  const { id } = req.params;

  try {

    await pool.query(
      "UPDATE orders SET status = 'Declined' WHERE id = $1",
      [id]
    );

    res.json({
      message: 'Order declined'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Failed to decline order'
    });
  }
});


// =========================
// DELETE ORDER
// =========================

app.delete('/orders/:id', async (req, res) => {

  const { id } = req.params;

  try {

    await pool.query(
      'DELETE FROM orders WHERE id = $1',
      [id]
    );

    res.json({
      message: 'Order deleted'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Failed to delete order'
    });
  }
});
// =========================
// GET ALL CATEGORIES
// =========================

app.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY name ASC'
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Failed to fetch categories'
    });
  }
});


// =========================
// ADD CATEGORY
// CEO ONLY
// =========================

app.post('/categories', async (req, res) => {

  const { name } = req.body;

  const role = req.headers['x-admin-role'];

  if (role !== 'CEO') {
    return res.status(403).json({
      error: 'CEO access required'
    });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({
      error: 'Category name is required'
    });
  }

  try {

    const result = await pool.query(
      `
      INSERT INTO categories (name)
      VALUES ($1)
      RETURNING *
      `,
      [name.trim()]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {

    console.error(error);

    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Category already exists'
      });
    }

    res.status(500).json({
      error: 'Failed to add category'
    });
  }
});

// =========================
// START SERVER
// =========================

app.listen(3000, () => {
  console.log('Server running on port 3000');
});