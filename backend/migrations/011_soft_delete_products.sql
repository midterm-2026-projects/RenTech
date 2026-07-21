-- 011_soft_delete_products.sql
-- Soft-delete support for inventory items. Items are never physically removed;
-- instead is_deleted is flipped so historical rentals/reservations stay intact
-- and the admin storefront (products view) stops listing them.

ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

-- Recreate the products view to exclude soft-deleted rows.
DROP VIEW IF EXISTS products;
CREATE VIEW products AS
SELECT id, name, category, price, image, status
FROM inventory_items
WHERE is_deleted = FALSE;
