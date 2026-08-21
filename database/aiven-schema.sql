
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;


-- ============================================================
-- 1. USERS
--    Source  : UserDAO.java
--    Columns : id, name, email, password, role, status, created_at
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(150)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,          -- BCrypt hash (jBCrypt)
    role        VARCHAR(20)     NOT NULL           -- 'ADMIN' | 'CUSTOMER'
                    CHECK (role IN ('ADMIN','CUSTOMER')),
    status      VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE'  -- 'ACTIVE' | 'BLOCKED'
                    CHECK (status IN ('ACTIVE','BLOCKED')),
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id)
);

-- ============================================================
-- 2. PRODUCTS
--    Source  : ProductDAO.java
--    Columns : id, name, description, category, price, mrp,
--              quantity, image_url, created_at
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id          BIGINT              NOT NULL AUTO_INCREMENT,
    name        VARCHAR(200)        NOT NULL,
    description TEXT                NULL,
    category    VARCHAR(100)        NOT NULL,
    price       DECIMAL(10,2)       NOT NULL,
    mrp         DECIMAL(10,2)       NULL,          -- original / crossed-out price
    quantity    INT                 NOT NULL DEFAULT 0,
    image_url   VARCHAR(500)        NULL,
    created_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id)
);

-- ============================================================
-- 3. CART
--    Source  : CartDAO.java
--    Columns : id, user_id, product_id, quantity
--    Note    : One row per (user, product) pair; quantity is updated
--              in-place rather than adding duplicate rows.
-- ============================================================
CREATE TABLE IF NOT EXISTS cart (
    id          BIGINT  NOT NULL AUTO_INCREMENT,
    user_id     BIGINT  NOT NULL,
    product_id  BIGINT  NOT NULL,
    quantity    INT     NOT NULL DEFAULT 1,

    PRIMARY KEY (id),
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_product (user_id, product_id)  -- prevents duplicate cart rows
);

-- ============================================================
-- 4. ORDERS
--    Source  : OrderDAO.java
--    Columns : id, user_id, total_amount, status, order_date,
--              shipping_address, payment_method
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id               BIGINT          NOT NULL AUTO_INCREMENT,
    user_id          BIGINT          NOT NULL,
    total_amount     DECIMAL(12,2)   NOT NULL,
    status           VARCHAR(20)     NOT NULL DEFAULT 'PENDING'
                         CHECK (status IN ('PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED')),
    order_date       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    shipping_address VARCHAR(500)    NULL,
    payment_method   VARCHAR(30)     NULL,         -- 'CARD' | 'UPI' | 'COD'

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 5. ORDER_ITEMS
--    Source  : OrderDAO.saveOrderItems() + OrderItem model
--    Columns : id, order_id, product_id, quantity, price
--    Note    : price is snapshot at time of purchase (not live product price)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    order_id    BIGINT          NOT NULL,
    product_id  BIGINT          NOT NULL,
    quantity    INT             NOT NULL,
    price       DECIMAL(10,2)  NOT NULL,           -- price at time of order

    PRIMARY KEY (id),
    FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- ============================================================
-- SEED DATA — optional, lets you test immediately
-- ============================================================

-- Admin user  (password = "admin123"  BCrypt hash)
INSERT INTO users (name, email, password, role) VALUES
('Admin User',
 'admin@shopverse.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y',
 'ADMIN');

-- Sample customer  (password = "customer123"  BCrypt hash)
INSERT INTO users (name, email, password, role) VALUES
('sahil barge',
 'sahil@example.com',
 '$2a$10$8K1p/a0dR8xB2m5cFnRcxuPJrQ8p9ZQfVNLNWthsmKLLsPrAf3S36',
 'CUSTOMER');

-- Sample products
INSERT INTO products (name, description, category, price, mrp, quantity, image_url) VALUES
('AeroBeat Wireless Earbuds',
 'True wireless earbuds with active noise cancellation and 30-hour battery.',
 'Electronics', 2999.00, 4499.00, 48,
 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80'),

('Stratus Smartwatch Pro',
 'AMOLED smartwatch with heart-rate, SpO2 tracking and 7-day battery.',
 'Electronics', 6499.00, 8999.00, 23,
 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=600&q=80'),

('Nimbus Running Shoes',
 'Lightweight breathable running shoes with responsive cushioning.',
 'Fashion', 3199.00, 3999.00, 65,
 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'),

('Lumen Desk Lamp',
 'Touch-control LED desk lamp with 3 colour modes and adjustable brightness.',
 'Home', 1499.00, 1999.00, 80,
 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80'),

('Caskette Leather Backpack',
 'Premium vegan-leather backpack with padded 15.6-inch laptop compartment.',
 'Fashion', 2599.00, 3499.00, 34,
 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'),

('Pulse Bluetooth Speaker',
 'Portable speaker with 12-hour playback and IPX6 water resistance.',
 'Electronics', 1899.00, 2599.00, 56,
 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80'),

('Aroma Ceramic Mug Set',
 'Set of 2 hand-glazed ceramic mugs, microwave and dishwasher safe.',
 'Home', 899.00, 1199.00, 120,
 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80'),

('Zenith Polarized Sunglasses',
 'UV400 polarized sunglasses with lightweight TR90 frame.',
 'Fashion', 1299.00, 1799.00, 42,
 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80'),

('Orbit Gaming Mouse',
 'RGB gaming mouse with 16000 DPI sensor and 6 programmable buttons.',
 'Electronics', 1599.00, 2199.00, 70,
 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&q=80'),

('Cocoon Memory Foam Pillow',
 'Ergonomic cervical support pillow with breathable bamboo cover.',
 'Home', 1099.00, 1499.00, 90,
 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&q=80'),

('Voyage Travel Trolley',
 '8-wheel hardshell trolley bag with TSA lock and 360° spinner wheels.',
 'Fashion', 4299.00, 5999.00, 18,
 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=600&q=80'),

('Flux Mechanical Keyboard',
 'Hot-swappable mechanical keyboard with RGB backlight and tactile switches.',
 'Electronics', 3499.00, 4299.00, 39,
 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80');
