import { getSupabase } from '../config/supabaseClient.js';
import { query } from '../config/database.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function runMigration() {
  const sqlPath = join(__dirname, '..', 'migrations', '005_transaction_schema.sql');
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

  async find() {
    const sb = getClient();
    if (sb.error) return sb;
    return sb
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
  },

  async create(txData) {
    const sb = getClient();
    if (sb.error) return sb;

    const formattedTransaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      item: txData.item || "Standard Rental Item",
      date: txData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: txData.status || 'Reserved',
      amount: txData.amount || '₱0'
    };

    return sb
      .from('transactions')
      .insert([formattedTransaction])
      .select();
  }
};