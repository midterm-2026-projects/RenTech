-- 010_unify_products.sql
-- Unify the two catalogs: inventory_items (analytics/rental backbone) and
-- products (admin/storefront list) describe the same items, so make
-- inventory_items the single source of truth and expose products as a view.
-- All existing FKs (rentals, reservations, inventory_metrics) keep pointing at
-- inventory_items, so no analytics code or constraints change.

-- 1. Extend inventory_items with the columns products had.
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS price DECIMAL(12, 2);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Available';

-- 2. Merge existing products data into inventory_items (match by name so we
--    don't create duplicates). Only runs if a base-table `products` still
--    exists (it may already have been replaced by the view on a prior run).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'products' AND table_type = 'BASE TABLE'
  ) THEN
    UPDATE inventory_items i
    SET price = p.price,
        image = p.image,
        status = p.status,
        category = p.category
    FROM products p
    WHERE i.name = p.name
      AND (i.price IS NULL OR i.image IS DISTINCT FROM p.image OR i.status IS DISTINCT FROM p.status);

    INSERT INTO inventory_items (id, name, category, price, image, status, created_at)
    SELECT gen_random_uuid(), p.name, p.category, p.price, p.image, p.status, now()
    FROM products p
    WHERE NOT EXISTS (
      SELECT 1 FROM inventory_items i WHERE i.name = p.name
    );
  END IF;
END $$;

-- 3. Replace the products table with a read-only view over inventory_items.
--    Keeps the same column shape the backend/model expects, so no code changes.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'products' AND c.relkind IN ('r', 'p')
  ) THEN
    EXECUTE 'DROP TABLE products';
  ELSIF EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'products' AND c.relkind = 'v'
  ) THEN
    EXECUTE 'DROP VIEW products';
  END IF;
END $$;

CREATE VIEW products AS
SELECT id, name, category, price, image, status
FROM inventory_items;
