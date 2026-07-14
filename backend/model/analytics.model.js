import { getSupabase } from '../config/supabaseClient.js';
import { runMigrations } from '../migrations/runner.js';

export async function runMigration() {
  try {
    const result = await runMigrations();
    return { error: null, ...result };
  } catch (error) {
    return { error };
  }
}

function getClient() {
  const sb = getSupabase();
  if (!sb) {
    return { data: null, error: new Error('Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.') };
  }
  return sb;
}

export default {
  async runMigration() {
    return runMigration();
  },

  async getAnalyticsSummaries() {
    const sb = getClient();
    if (sb.error) return sb;
    return sb
      .from('analytics_summaries')
      .select('*')
      .order('period', { ascending: false });
  },

  async getForecasts() {
    const sb = getClient();
    if (sb.error) return sb;
    return sb
      .from('forecasts')
      .select('*')
      .order('forecast_date', { ascending: false });
  },

  async getKpiStorage() {
    const sb = getClient();
    if (sb.error) return sb;
    return sb
      .from('kpi_storage')
      .select('*')
      .order('period', { ascending: false });
  },

  async getRevenueProjections() {
    const sb = getClient();
    if (sb.error) return sb;
    return sb
      .from('revenue_projections')
      .select('*')
      .order('projection_date', { ascending: false });
  },
};
