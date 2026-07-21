-- 009_transactions_date_normalize.sql
-- The transactions.date column accumulated mixed formats: some rows hold an
-- ISO date ("2026-07-21") while others hold a locale string ("Jul 21, 2026"),
-- which makes the admin Records table render inconsistent dates. Normalize
-- every row to a single canonical "YYYY-MM-DD" format.

UPDATE transactions
SET date = CASE
  WHEN date ~ '^[A-Za-z]{3} [0-9]{1,2}, [0-9]{4}$'
    THEN to_char(to_date(date, 'Mon DD, YYYY'), 'YYYY-MM-DD')
  WHEN date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
    THEN date
  ELSE to_char(now(), 'YYYY-MM-DD')
END
WHERE date IS NOT NULL;
