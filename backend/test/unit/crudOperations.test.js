import { describe, it, expect, afterAll } from 'vitest';
import { getSupabase } from '../../config/supabaseClient.js';

const sb = getSupabase();
const isConfigured = sb !== null;

const TABLES = ['analytics_summaries', 'forecasts', 'kpi_storage', 'revenue_projections'];

async function checkTablesExist() {
  if (!sb) return false;
  for (const table of TABLES) {
    const { error } = await sb.from(table).select('id').limit(1);
    if (error && error.code === 'PGRST205') return false;
  }
  return true;
}

const tablesExist = isConfigured ? await checkTablesExist() : false;

function describeIf(condition) {
  return condition ? describe : describe.skip;
}

const insertedIds = {};

describeIf(tablesExist)('Supabase CRUD Operations', () => {
  afterAll(async () => {
    if (!sb) return;
    for (const [table, id] of Object.entries(insertedIds)) {
      if (id) {
        await sb.from(table).delete().eq('id', id);
      }
    }
  });

  it('inserts and selects from analytics_summaries', async () => {
    const { data, error } = await sb
      .from('analytics_summaries')
      .insert({ metric_name: 'test_metric', metric_value: 100.50, period: '2026-07' })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(Number(data.metric_value)).toBe(100.50);
    expect(data.period).toBe('2026-07');
    insertedIds.analytics_summaries = data.id;
  });

  it('inserts and selects from forecasts', async () => {
    const { data, error } = await sb
      .from('forecasts')
      .insert({ forecast_date: '2026-08-01', forecast_value: 50.00, model: 'SMA-3' })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data.forecast_date).toBe('2026-08-01');
    insertedIds.forecasts = data.id;
  });

  it('inserts and selects from kpi_storage', async () => {
    const { data, error } = await sb
      .from('kpi_storage')
      .insert({ kpi_name: 'monthly_revenue', kpi_value: 50000.00, period: '2026-07' })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(Number(data.kpi_value)).toBe(50000.00);
    insertedIds.kpi_storage = data.id;
  });

  it('inserts and selects from revenue_projections', async () => {
    const { data, error } = await sb
      .from('revenue_projections')
      .insert({ projection_date: '2026-08-01', projected_revenue: 75000.00 })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(Number(data.projected_revenue)).toBe(75000.00);
    insertedIds.revenue_projections = data.id;
  });

  it('rejects NULL on required columns', async () => {
    const { error } = await sb
      .from('analytics_summaries')
      .insert({ metric_name: null, metric_value: 100, period: '2026-07' });

    expect(error).not.toBeNull();
  });
});
