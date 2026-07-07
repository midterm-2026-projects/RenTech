-- Run this file in your Supabase project's SQL Editor (Dashboard > SQL Editor)
-- or via the Supabase CLI: supabase db push
-- The Supabase JS client cannot execute DDL (CREATE TABLE) directly.
-- After running this once, the model queries will work.

CREATE TABLE IF NOT EXISTS analytics_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(255) NOT NULL,
  metric_value DECIMAL(12, 2) NOT NULL,
  period VARCHAR(50) NOT NULL,
  category VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_date DATE NOT NULL,
  forecast_value DECIMAL(12, 2) NOT NULL,
  actual_value DECIMAL(12, 2),
  model VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kpi_storage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_name VARCHAR(255) NOT NULL,
  kpi_value DECIMAL(12, 2) NOT NULL,
  period VARCHAR(50) NOT NULL,
  target DECIMAL(12, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS revenue_projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projection_date DATE NOT NULL,
  projected_revenue DECIMAL(12, 2) NOT NULL,
  actual_revenue DECIMAL(12, 2),
  confidence_lower DECIMAL(12, 2),
  confidence_upper DECIMAL(12, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
