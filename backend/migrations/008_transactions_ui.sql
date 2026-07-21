-- 008_transactions_ui.sql
-- The transactions table currently has: id, item, date, status, amount.
-- The admin Records UI needs a customer (username) and rental breakdown.
-- Add those columns and backfill the existing 28 rows so the API can serve
-- the UI shape without breaking existing records.

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS username VARCHAR(255);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS price_per_day NUMERIC(12, 2);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS days_rented INTEGER;

-- Backfill existing rows whose new columns are null.
UPDATE transactions
  SET username = 'Walk-in Customer'
  WHERE username IS NULL;

UPDATE transactions
  SET price_per_day = CAST(amount AS NUMERIC(12, 2))
  WHERE price_per_day IS NULL;

UPDATE transactions
  SET days_rented = 1
  WHERE days_rented IS NULL;
