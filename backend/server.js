const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploads folder (for future file uploads if needed)
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test route
app.get('/', (req, res) => {
  res.send('Cultured Kitchen API is running...');
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
// =========================
app.put('/orders/:id/approve', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      "UPDATE orders SET status = 'Approved' WHERE id = $1",
      [id]
    );

    res.json({
      message: 'Order approved'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to approve order'
    });
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
// START SERVER
// =========================
app.listen(3000, () => {
  console.log('Server running on port 3000');
});