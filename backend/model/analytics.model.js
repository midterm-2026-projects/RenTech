import { getSupabase } from '../config/supabaseClient.js';
import { query } from '../config/database.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function runMigration() {
  const sqlPath = join(__dirname, '..', 'migrations', '001_analytics_schema.sql');
  const sql = readFileSync(sqlPath, 'utf8');

  try {
    await query(sql);
    return { error: null };
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
