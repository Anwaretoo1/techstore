-- ============================================================
--  TechStore Syria — PostgreSQL Database Schema
--  Run: psql -U postgres -d ecommerce_syria -f schema.sql
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fast text search

-- ─── Users ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  phone         VARCHAR(20),
  role          VARCHAR(20)  NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  is_active     BOOLEAN      NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);

-- ─── Categories ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  name_ar     VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image       VARCHAR(500),
  parent_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug     ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent   ON categories(parent_id);

-- ─── Products ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(500) NOT NULL,
  name_ar         VARCHAR(500) NOT NULL,
  description     TEXT,
  description_ar  TEXT,
  price           NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  sale_price      NUMERIC(12,2) CHECK (sale_price >= 0),
  sku             VARCHAR(100) NOT NULL UNIQUE,
  stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category_id     INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  brand           VARCHAR(100),
  rating          NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  review_count    INTEGER NOT NULL DEFAULT 0,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  tags            TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand      ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_is_active  ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured   ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_search     ON products USING gin(to_tsvector('simple', coalesce(name_ar,'') || ' ' || coalesce(name,'')));

-- ─── Product Images ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_images (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         VARCHAR(500) NOT NULL,
  alt         VARCHAR(255),
  is_primary  BOOLEAN NOT NULL DEFAULT false,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id);

-- ─── Product Specifications ───────────────────────────────────
CREATE TABLE IF NOT EXISTS product_specifications (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  key         VARCHAR(100) NOT NULL,
  key_ar      VARCHAR(100) NOT NULL,
  value       VARCHAR(500) NOT NULL,
  value_ar    VARCHAR(500) NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_specs_product ON product_specifications(product_id);

-- ─── Orders ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              SERIAL PRIMARY KEY,
  order_number    VARCHAR(50) NOT NULL UNIQUE,
  user_id         INTEGER NOT NULL REFERENCES users(id),
  status          VARCHAR(30) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
  payment_method  VARCHAR(30) NOT NULL
                    CHECK (payment_method IN ('cash_on_delivery','syriatel_cash','mtn_cash')),
  payment_status  VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (payment_status IN ('pending','paid','failed','refunded')),
  subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_cost   NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  total           NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes           TEXT,
  coupon_code     VARCHAR(50),
  -- Shipping address (denormalized for order history integrity)
  shipping_full_name  VARCHAR(200),
  shipping_phone      VARCHAR(30),
  shipping_city       VARCHAR(100),
  shipping_area       VARCHAR(200),
  shipping_street     TEXT,
  shipping_notes      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user      ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status    ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created   ON orders(created_at DESC);

-- ─── Order Items ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id              SERIAL PRIMARY KEY,
  order_id        INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id      INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_name    VARCHAR(500) NOT NULL,
  product_name_ar VARCHAR(500) NOT NULL,
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  unit_price      NUMERIC(12,2) NOT NULL,
  total_price     NUMERIC(12,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- ─── Coupons ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id              SERIAL PRIMARY KEY,
  code            VARCHAR(50) NOT NULL UNIQUE,
  discount_type   VARCHAR(20) NOT NULL DEFAULT 'fixed' CHECK (discount_type IN ('fixed','percentage')),
  discount_value  NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  min_order_value NUMERIC(12,2) DEFAULT 0,
  usage_limit     INTEGER,
  used_count      INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Product Reviews (placeholder) ───────────────────────────
CREATE TABLE IF NOT EXISTS product_reviews (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Auto-update updated_at trigger ──────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated    ON users;
DROP TRIGGER IF EXISTS trg_products_updated ON products;
DROP TRIGGER IF EXISTS trg_orders_updated   ON orders;

CREATE TRIGGER trg_users_updated    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated   BEFORE UPDATE ON orders   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
