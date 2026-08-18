-- ==========================================
-- PRODUCTS / INVENTORY TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    image TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    category TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- SEED EXISTING PRODUCTS
-- ==========================================

INSERT INTO products (
    id,
    name,
    price,
    image,
    stock,
    category,
    description
)
VALUES
(
    1,
    'Premium Cookware Set',
    45000,
    'assets/images/cookware.jpg',
    10,
    'Kitchen',
    'POTS'
),
(
    2,
    'Decorative Plate Set',
    18000,
    'assets/images/plates.jpg',
    15,
    'Dining',
    'plates'
),
(
    3,
    'Plate Rack',
    12000,
    'assets/images/platerack.jpg',
    8,
    'Souvenirs',
    'plate rack'
)
ON CONFLICT (id) DO NOTHING;