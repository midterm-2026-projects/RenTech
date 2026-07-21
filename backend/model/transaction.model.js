import { getSupabase } from '../config/supabaseClient.js';

function getClient() {
  const sb = getSupabase();
  if (!sb) {
    return { data: null, error: new Error('Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.') };
  }
  return sb;
}

// Map a raw DB row to the shape the admin Records UI expects.
function mapRow(row) {
  if (!row) return row;
  return {
    id: row.id,
    username: row.username || 'Walk-in Customer',
    itemName: row.item,
    pricePerDay: row.price_per_day != null ? Number(row.price_per_day) : null,
    daysRented: row.days_rented != null ? Number(row.days_rented) : null,
    totalCost: row.amount != null ? Number(row.amount) : null,
    status: row.status,
    date: row.date,
  };
}

// Server-side pagination + optional search (id / customer / item) and status filter.
export async function findAll({ page = 1, limit = 10, search = '', status = '' } = {}) {
  const sb = getClient();
  if (sb.error) return { data: [], total: 0, error: sb.error };

  const from = (Math.max(1, page) - 1) * limit;
  const to = from + limit - 1;

  let q = sb
    .from('transactions')
    .select('id, username, item, price_per_day, days_rented, amount, status, date', { count: 'exact' });

  if (search) {
    const like = `%${search}%`;
    q = q.or(`id.ilike.${like},username.ilike.${like},item.ilike.${like}`);
  }
  if (status) {
    const statuses = String(status)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (statuses.length) {
      q = q.in('status', statuses);
    }
  }

  const { data, error, count } = await q
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return { data: [], total: 0, error };

  const mapped = (data || []).map(mapRow);
  return {
    data: mapped,
    total: typeof count === 'number' ? count : mapped.length,
    error: null,
  };
}

// Persist a status change (used by the Records "return" toggle).
export async function updateStatus(id, status) {
  const sb = getClient();
  if (sb.error) return { data: null, error: sb.error };

  const { data, error } = await sb
    .from('transactions')
    .update({ status })
    .eq('id', id)
    .select('id, username, item, price_per_day, days_rented, amount, status, date');

  if (error) return { data: null, error };
  return { data: Array.isArray(data) && data.length ? mapRow(data[0]) : null, error: null };
}

// Create a new transaction row.
export async function create(txData) {
  const sb = getClient();
  if (sb.error) return { data: null, error: sb.error };

  const { data, error } = await sb
    .from('transactions')
    .insert([txData])
    .select();

  if (error) return { data: null, error };
  return { data: data || [], error: null };
}

export { mapRow };

export default { findAll, updateStatus, create };
