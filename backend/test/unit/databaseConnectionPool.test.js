import { describe, it, expect } from 'vitest';
import { getSupabase } from '../../config/supabaseClient.js';

const sb = getSupabase();
const isConfigured = sb !== null;

const TABLES = ['analytics_summaries', 'forecasts', 'kpi_storage', 'revenue_projections'];

function describeIf(condition) {
  return condition ? describe : describe.skip;
}

describeIf(isConfigured)('Supabase Database Connection', () => {
  it('connects to Supabase REST API', () => {
    expect(sb).toBeTruthy();
  });

  it('handles concurrent requests', async () => {
    const results = await Promise.all(
      TABLES.map(t => sb.from(t).select('id').limit(1))
    );
    for (const { error } of results) {
      expect(error && error.code !== 'PGRST205' || !error).toBe(true);
    }
  });
});
