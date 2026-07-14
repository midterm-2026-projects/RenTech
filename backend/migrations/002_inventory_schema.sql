-- 002_inventory_schema.sql
-- Smart Inventory Intelligence: core tables for items, rentals and reservations,
-- plus the indexes that let analytics queries use an index scan instead of a
-- slow sequential (full) scan on rental date, reservation date and inventory id.

CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES inventory_items(id),
  rental_date DATE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES inventory_items(id),
  reservation_date DATE NOT NULL
);

-- Indexes requested for analytics query optimization.
CREATE INDEX IF NOT EXISTS idx_rentals_rental_date ON rentals(rental_date);
CREATE INDEX IF NOT EXISTS idx_rentals_inventory_id ON rentals(inventory_id);
CREATE INDEX IF NOT EXISTS idx_reservations_reservation_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_inventory_id ON reservations(inventory_id);
