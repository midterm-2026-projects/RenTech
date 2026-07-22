import { getSupabase } from '../config/supabaseClient.js';

function getClient() {
  const sb = getSupabase();
  if (!sb) {
    return { data: null, error: new Error('Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.') };
  }
  return sb;
}

export async function findAll({ page = 1, limit = 8, search = '', status = '' } = {}) {
  const sb = getClient();
  if (sb.error) return { data: [], total: 0, error: sb.error };

  const from = (Math.max(1, page) - 1) * limit;
  const to = from + limit - 1;

  let q = sb
    .from('products')
    .select('*', { count: 'exact' });

  if (search) {
    q = q.ilike('name', `%${search}%`);
  }
  if (status) {
    q = q.eq('status', status);
  }

  const { data, error, count } = await q
    .order('name', { ascending: true })
    .range(from, to);

  if (error) return { data: [], total: 0, error };

  return {
    data: data || [],
    total: typeof count === 'number' ? count : (data || []).length,
    error: null,
  };
}

export async function updateStatusByName(name, status) {
  const sb = getClient();
  if (sb.error) return { data: null, error: sb.error };

  const { data, error } = await sb
    .from('products')
    .update({ status: status })
    .eq('name', name)
    .select();

  if (error) return { data: null, error };

  return { data: data || [], error: null };
}

export async function softDelete(id) {
  const sb = getClient();
  if (sb.error) return { data: null, error: sb.error };

  const { data, error } = await sb
    .from('products')
    .update({ is_deleted: true })
    .eq('id', id)
    .select()
    .single();

  if (error) return { data: null, error };

  return { data: data || null, error: null };
}

export default { findAll, updateStatusByName, softDelete };