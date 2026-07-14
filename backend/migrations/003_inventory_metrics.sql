-- 003_inventory_metrics.sql
-- Maintains a pre-aggregated inventory_metrics table through triggers so that
-- analytics/dashboard queries read a small summary table (index scan) instead of
-- aggregating the full rentals table on every request.

CREATE TABLE IF NOT EXISTS inventory_metrics (
  inventory_id UUID PRIMARY KEY REFERENCES inventory_items(id),
  rental_count INT NOT NULL DEFAULT 0,
  total_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  last_activity DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_metrics_last_activity
  ON inventory_metrics(last_activity);

CREATE OR REPLACE FUNCTION refresh_inventory_metrics() RETURNS TRIGGER AS $$
DECLARE
  target_id UUID;
BEGIN
  target_id := COALESCE(NEW.inventory_id, OLD.inventory_id);

  INSERT INTO inventory_metrics (inventory_id, rental_count, total_revenue, last_activity)
  SELECT inventory_id,
         COUNT(*),
         COALESCE(SUM(amount), 0),
         MAX(rental_date)
  FROM rentals
  WHERE inventory_id = target_id
  GROUP BY inventory_id
  ON CONFLICT (inventory_id) DO UPDATE SET
    rental_count   = EXCLUDED.rental_count,
    total_revenue  = EXCLUDED.total_revenue,
    last_activity  = EXCLUDED.last_activity,
    updated_at     = now();

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_rentals_metrics ON rentals;

CREATE TRIGGER trg_rentals_metrics
  AFTER INSERT OR UPDATE OR DELETE ON rentals
  FOR EACH ROW EXECUTE FUNCTION refresh_inventory_metrics();
