const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();

app.set('etag', false);

app.use(cors());

app.use(express.json({
  limit: '50mb'
}));

app.use(express.urlencoded({
  limit: '50mb',
  extended: true
}));


// =========================================================
// SERVE UPLOADS
// =========================================================

app.use(
  '/uploads',
  express.static(
    path.join(__dirname, 'uploads')
  )
);


// =========================================================
// POSTGRESQL CONNECTION
// =========================================================

const pool = new Pool({

  user: process.env.DB_USER,

  host: process.env.DB_HOST,

  database: process.env.DB_NAME,

  password: process.env.DB_PASSWORD,

  port: process.env.DB_PORT

});


// =========================================================
// TEST ROUTE
// =========================================================

app.get('/', (req, res) => {

  res.send(
    'Cultured Kitchen API is running...'
  );

});


// =========================================================
// CEO AUTH CHECK
// =========================================================

function requireCEO(req, res, next) {

  const role =
    String(
      req.headers['x-admin-role'] || ''
    ).trim().toUpperCase();


  if (role !== 'CEO') {

    return res.status(403).json({

      error:
        'CEO access required'

    });

  }

  next();

}


// =========================================================
// GET ALL PRODUCTS
// =========================================================

app.get('/products', async (req, res) => {

  try {

    const result =
      await pool.query(
        `
        SELECT *
        FROM products
        ORDER BY id ASC
        `
      );

    res.json(result.rows);

  } catch (error) {

    console.error(
      'Fetch products error:',
      error
    );

    res.status(500).json({

      error:
        'Failed to fetch products'

    });

  }

});


// =========================================================
// ADD PRODUCT
// CEO ONLY
// =========================================================

app.post(
  '/products',
  requireCEO,
  async (req, res) => {

    const {

      name,
      price,
      image,
      stock,
      category,
      description

    } = req.body;


    try {

      const result =
        await pool.query(
          `
          INSERT INTO products (
            name,
            price,
            image,
            stock,
            category,
            description
          )

          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6
          )

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


      res.status(201).json(
        result.rows[0]
      );


    } catch (error) {

      console.error(
        'Add product error:',
        error
      );


      res.status(500).json({

        error:
          'Failed to add product'

      });

    }

  }
);


// =========================================================
// DELETE PRODUCT
// CEO ONLY
// =========================================================

app.delete(
  '/products/:id',
  requireCEO,
  async (req, res) => {

    const { id } = req.params;


    try {

      const result =
        await pool.query(
          `
          DELETE FROM products

          WHERE id = $1

          RETURNING *
          `,
          [id]
        );


      if (
        result.rows.length === 0
      ) {

        return res.status(404).json({

          error:
            'Product not found'

        });

      }


      res.json({

        message:
          'Product deleted successfully',

        product:
          result.rows[0]

      });


    } catch (error) {

      console.error(
        'Delete product error:',
        error
      );


      res.status(500).json({

        error:
          'Failed to delete product'

      });

    }

  }
);


// =========================================================
// ADD STOCK
// CEO ONLY
// =========================================================

app.put(
  '/products/:id/add-stock',
  requireCEO,
  async (req, res) => {

    const { id } = req.params;

    const { amount } = req.body;


    if (
      !Number.isInteger(
        Number(amount)
      ) ||
      Number(amount) <= 0
    ) {

      return res.status(400).json({

        error:
          'Stock amount must be a positive whole number'

      });

    }


    try {

      const result =
        await pool.query(
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


      if (
        result.rows.length === 0
      ) {

        return res.status(404).json({

          error:
            'Product not found'

        });

      }


      res.json(
        result.rows[0]
      );


    } catch (error) {

      console.error(
        'Add stock error:',
        error
      );


      res.status(500).json({

        error:
          'Failed to add stock'

      });

    }

  }
);


// =========================================================
// REDUCE STOCK
// CEO ONLY
// =========================================================

app.put(
  '/products/:id/reduce-stock',
  requireCEO,
  async (req, res) => {

    const { id } = req.params;

    const { amount } = req.body;


    if (
      !Number.isInteger(
        Number(amount)
      ) ||
      Number(amount) <= 0
    ) {

      return res.status(400).json({

        error:
          'Stock amount must be a positive whole number'

      });

    }


    try {

      const result =
        await pool.query(
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


      if (
        result.rows.length === 0
      ) {

        const product =
          await pool.query(
            `
            SELECT *
            FROM products
            WHERE id = $1
            `,
            [id]
          );


        if (
          product.rows.length === 0
        ) {

          return res.status(404).json({

            error:
              'Product not found'

          });

        }


        return res.status(400).json({

          error:
            'Not enough stock'

        });

      }


      res.json(
        result.rows[0]
      );


    } catch (error) {

      console.error(
        'Reduce stock error:',
        error
      );


      res.status(500).json({

        error:
          'Failed to reduce stock'

      });

    }

  }
);


// =========================================================
// CREATE ORDER
// =========================================================

app.post(
  '/orders',
  async (req, res) => {

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

      const result =
        await pool.query(
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

          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9
          )

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


      res.status(201).json(
        result.rows[0]
      );


    } catch (error) {

      console.error(
        'Create order error:',
        error
      );


      res.status(500).json({

        error:
          'Failed to save order'

      });

    }

  }
);


// =========================================================
// GET ALL ORDERS
// =========================================================

app.get(
  '/orders',
  async (req, res) => {

    try {

      const result =
        await pool.query(
          `
          SELECT *
          FROM orders
          ORDER BY created_at DESC
          `
        );


      res.json(
        result.rows
      );


    } catch (error) {

      console.error(
        'Fetch orders error:',
        error
      );


      res.status(500).json({

        error:
          'Failed to fetch orders'

      });

    }

  }
);


// =========================================================
// APPROVE ORDER
//
// APPROVING:
// 1. Checks order
// 2. Checks stock
// 3. Reduces stock
// 4. Changes status to Approved
// 5. Creates permanent sale
// =========================================================

app.put(
  '/orders/:id/approve',
  async (req, res) => {

    const { id } = req.params;

    const client =
      await pool.connect();


    try {

      await client.query(
        'BEGIN'
      );


      // -----------------------------------------
      // GET ORDER
      // -----------------------------------------

      const orderResult =
        await client.query(
          `
          SELECT *
          FROM orders
          WHERE id = $1
          FOR UPDATE
          `,
          [id]
        );


      if (
        orderResult.rows.length === 0
      ) {

        await client.query(
          'ROLLBACK'
        );


        return res.status(404).json({

          error:
            'Order not found'

        });

      }


      const order =
        orderResult.rows[0];


      // -----------------------------------------
      // ALREADY APPROVED
      // -----------------------------------------

      if (
        String(order.status)
          .toLowerCase() ===
        'approved'
      ) {

        await client.query(
          'ROLLBACK'
        );


        return res.status(400).json({

          error:
            'Order is already approved'

        });

      }


      // -----------------------------------------
      // DECLINED CANNOT BE APPROVED
      // -----------------------------------------

      if (
        String(order.status)
          .toLowerCase() ===
        'declined'
      ) {

        await client.query(
          'ROLLBACK'
        );


        return res.status(400).json({

          error:
            'Declined orders cannot be approved'

        });

      }


      // -----------------------------------------
      // ORDER ITEMS
      // -----------------------------------------

      const items =
        Array.isArray(order.items)

          ? order.items

          : JSON.parse(
              order.items || '[]'
            );


      // -----------------------------------------
      // CHECK STOCK
      // -----------------------------------------

      for (
        const item of items
      ) {

        const productId =
          Number(item.id);

        const quantity =
          Number(
            item.quantity || 0
          );


        if (
          !productId ||
          quantity <= 0
        ) {

          await client.query(
            'ROLLBACK'
          );


          return res.status(400).json({

            error:
              'Invalid product information in order'

          });

        }


        const productResult =
          await client.query(
            `
            SELECT *
            FROM products
            WHERE id = $1
            FOR UPDATE
            `,
            [productId]
          );


        if (
          productResult.rows.length === 0
        ) {

          await client.query(
            'ROLLBACK'
          );


          return res.status(400).json({

            error:
              `Product with ID ${productId} was not found`

          });

        }


        const product =
          productResult.rows[0];


        if (
          Number(product.stock) <
          quantity
        ) {

          await client.query(
            'ROLLBACK'
          );


          return res.status(400).json({

            error:
              `Not enough stock for ${product.name}. ` +
              `Available: ${product.stock}, ` +
              `requested: ${quantity}`

          });

        }

      }


      // -----------------------------------------
      // REDUCE INVENTORY
      // -----------------------------------------

      for (
        const item of items
      ) {

        const productId =
          Number(item.id);

        const quantity =
          Number(
            item.quantity || 0
          );


        await client.query(
          `
          UPDATE products

          SET
            stock = stock - $1,
            updated_at = CURRENT_TIMESTAMP

          WHERE id = $2
          `,
          [
            quantity,
            productId
          ]
        );

      }


      // -----------------------------------------
      // APPROVE ORDER
      // -----------------------------------------

      const updatedOrderResult =
        await client.query(
          `
          UPDATE orders

          SET status = 'Approved'

          WHERE id = $1

          RETURNING *
          `,
          [id]
        );


      const updatedOrder =
        updatedOrderResult.rows[0];


      // -----------------------------------------
      // CREATE PERMANENT SALE
      // -----------------------------------------

      await client.query(
        `
        INSERT INTO sales (
          order_id,
          customer_name,
          email,
          phone,
          whatsapp,
          delivery_type,
          delivery_address,
          total_amount,
          items,
          approved_at
        )

        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9::jsonb,
          CURRENT_TIMESTAMP
        )

        ON CONFLICT (order_id)
        DO NOTHING
        `,
        [
          updatedOrder.id,
          updatedOrder.customer_name,
          updatedOrder.email,
          updatedOrder.phone,
          updatedOrder.whatsapp,
          updatedOrder.delivery_type,
          updatedOrder.delivery_address,
          updatedOrder.total_amount,
          JSON.stringify(items)
        ]
      );


      await client.query(
        'COMMIT'
      );


      res.json({

        message:
          'Order approved, inventory updated and sale recorded',

        order:
          updatedOrder

      });


    } catch (error) {

      await client.query(
        'ROLLBACK'
      );


      console.error(
        'Approve order error:',
        error
      );


      res.status(500).json({

        error:
          'Failed to approve order'

      });


    } finally {

      client.release();

    }

  }
);


// =========================================================
// DECLINE ORDER
// =========================================================

app.put(
  '/orders/:id/decline',
  async (req, res) => {

    const { id } = req.params;


    try {

      const result =
        await pool.query(
          `
          UPDATE orders

          SET status = 'Declined'

          WHERE id = $1

          RETURNING *
          `,
          [id]
        );


      if (
        result.rows.length === 0
      ) {

        return res.status(404).json({

          error:
            'Order not found'

        });

      }


      res.json({

        message:
          'Order declined',

        order:
          result.rows[0]

      });


    } catch (error) {

      console.error(
        'Decline order error:',
        error
      );


      res.status(500).json({

        error:
          'Failed to decline order'

      });

    }

  }
);


// =========================================================
// DELETE ORDER
//
// CEO + SALES
//
// APPROVED:
//   Archive first
//   Then delete
//
// DECLINED:
//   Delete directly
//
// This fixes:
// "Only approved orders can be deleted"
// =========================================================

app.delete(
  '/orders/:id',
  async (req, res) => {

    const { id } =
      req.params;


    // Normalize role
    const role =
      String(
        req.headers['x-admin-role'] || ''
      )
        .trim()
        .toUpperCase();


    // -----------------------------------------
    // ROLE CHECK
    // -----------------------------------------

    if (
      role !== 'CEO' &&
      role !== 'SALES'
    ) {

      return res.status(403).json({

        error:
          'CEO or Sales access required'

      });

    }


    const client =
      await pool.connect();


    try {

      await client.query(
        'BEGIN'
      );


      // -----------------------------------------
      // GET ORDER
      // -----------------------------------------

      const orderResult =
        await client.query(
          `
          SELECT *
          FROM orders

          WHERE id = $1

          FOR UPDATE
          `,
          [id]
        );


      if (
        orderResult.rows.length === 0
      ) {

        await client.query(
          'ROLLBACK'
        );


        return res.status(404).json({

          error:
            'Order not found'

        });

      }


      const order =
        orderResult.rows[0];


      const status =
        String(
          order.status || ''
        )
          .trim()
          .toLowerCase();


      // =================================================
      // APPROVED ORDER
      // =================================================

      if (
        status === 'approved'
      ) {

        // -----------------------------------------
        // CHECK ARCHIVE
        // -----------------------------------------

        const existingArchive =
          await client.query(
            `
            SELECT id

            FROM sales_archive

            WHERE original_order_id = $1

            LIMIT 1
            `,
            [id]
          );


        // -----------------------------------------
        // ARCHIVE IF NOT ALREADY ARCHIVED
        // -----------------------------------------

        if (
          existingArchive.rows.length === 0
        ) {

          const items =
            Array.isArray(order.items)

              ? order.items

              : JSON.parse(
                  order.items || '[]'
                );


          await client.query(
            `
            INSERT INTO sales_archive (
              original_order_id,
              customer_name,
              email,
              phone,
              whatsapp,
              delivery_type,
              delivery_address,
              payment_proof,
              total_amount,
              items,
              status,
              created_at,
              archived_at
            )

            VALUES (
              $1,
              $2,
              $3,
              $4,
              $5,
              $6,
              $7,
              $8,
              $9,
              $10,
              $11,
              $12,
              CURRENT_TIMESTAMP
            )
            `,
            [
              order.id,
              order.customer_name,
              order.email,
              order.phone,
              order.whatsapp,
              order.delivery_type,
              order.delivery_address,
              order.payment_proof,
              order.total_amount,
              JSON.stringify(items),
              order.status,
              order.created_at
            ]
          );

        }


        // -----------------------------------------
        // DELETE APPROVED ORDER
        // -----------------------------------------

        await client.query(
          `
          DELETE FROM orders
          WHERE id = $1
          `,
          [id]
        );


        await client.query(
          'COMMIT'
        );


        return res.json({

          message:
            'Approved order archived and removed from active orders.'

        });

      }


      // =================================================
      // DECLINED ORDER
      // =================================================

      if (
        status === 'declined'
      ) {

        // -----------------------------------------
        // DELETE DECLINED ORDER DIRECTLY
        // -----------------------------------------

        await client.query(
          `
          DELETE FROM orders
          WHERE id = $1
          `,
          [id]
        );


        await client.query(
          'COMMIT'
        );


        return res.json({

          message:
            'Declined order removed from active orders.'

        });

      }


      // =================================================
      // OTHER STATUS
      // =================================================

      await client.query(
        'ROLLBACK'
      );


      return res.status(400).json({

        error:
          `Orders with status "${order.status}" cannot be deleted.`

      });


    } catch (error) {

      await client.query(
        'ROLLBACK'
      );


      console.error(
        'Delete order error:',
        error
      );


      res.status(500).json({

        error:
          'Failed to delete order'

      });


    } finally {

      client.release();

    }

  }
);


// =========================================================
// SALES AUDIT
// CURRENT + ARCHIVED APPROVED ORDERS
// =========================================================

app.get(
  '/audit/sales',
  async (req, res) => {

    try {

      const result =
        await pool.query(
          `
          SELECT
            id,
            id AS original_order_id,
            customer_name,
            email,
            phone,
            whatsapp,
            delivery_type,
            delivery_address,
            payment_proof,
            total_amount,
            items,
            status,
            created_at,
            FALSE AS archived,
            NULL::timestamp AS archived_at

          FROM orders

          WHERE LOWER(status) = 'approved'


          UNION ALL


          SELECT
            id,
            original_order_id,
            customer_name,
            email,
            phone,
            whatsapp,
            delivery_type,
            delivery_address,
            payment_proof,
            total_amount,
            items,
            status,
            created_at,
            TRUE AS archived,
            archived_at

          FROM sales_archive

          WHERE LOWER(status) = 'approved'


          ORDER BY created_at DESC
          `
        );


      res.json(
        result.rows
      );


    } catch (error) {

      console.error(
        'Sales audit error:',
        error
      );


      res.status(500).json({

        error:
          'Failed to fetch sales audit'

      });

    }

  }
);


// =========================================================
// GET ALL PERMANENT SALES
// =========================================================

app.get(
  '/sales',
  async (req, res) => {

    try {

      const result =
        await pool.query(
          `
          SELECT *

          FROM sales

          ORDER BY approved_at DESC
          `
        );


      res.json(
        result.rows
      );


    } catch (error) {

      console.error(
        'Failed to fetch sales:',
        error
      );


      res.status(500).json({

        error:
          'Failed to fetch sales'

      });

    }

  }
);


// =========================================================
// GET CATEGORIES
// =========================================================

app.get(
  '/categories',
  async (req, res) => {

    try {

      const result =
        await pool.query(
          `
          SELECT *

          FROM categories

          ORDER BY name ASC
          `
        );


      res.json(
        result.rows
      );


    } catch (error) {

      console.error(
        'Fetch categories error:',
        error
      );


      res.status(500).json({

        error:
          'Failed to fetch categories'

      });

    }

  }
);


// =========================================================
// ADD CATEGORY
// CEO ONLY
// =========================================================

app.post(
  '/categories',
  async (req, res) => {

    const {
      name
    } = req.body;


    const role =
      String(
        req.headers['x-admin-role'] || ''
      )
        .trim()
        .toUpperCase();


    if (
      role !== 'CEO'
    ) {

      return res.status(403).json({

        error:
          'CEO access required'

      });

    }


    if (
      !name ||
      !name.trim()
    ) {

      return res.status(400).json({

        error:
          'Category name is required'

      });

    }


    try {

      const result =
        await pool.query(
          `
          INSERT INTO categories (
            name
          )

          VALUES ($1)

          RETURNING *
          `,
          [
            name.trim()
          ]
        );


      res.status(201).json(
        result.rows[0]
      );


    } catch (error) {

      console.error(
        'Add category error:',
        error
      );


      if (
        error.code === '23505'
      ) {

        return res.status(409).json({

          error:
            'Category already exists'

        });

      }


      res.status(500).json({

        error:
          'Failed to add category'

      });

    }

  }
);


// =========================================================
// START SERVER
// =========================================================

app.listen(
  3000,
  () => {

    console.log(
      'Server running on port 3000'
    );

  }
);