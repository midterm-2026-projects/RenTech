import { getSupabase } from './supabaseClient.js';

function getProjectRef() {
  const url = process.env.SUPABASE_URL;
  if (!url) return null;
  const match = url.match(/https?:\/\/([^.]+)/);
  return match ? match[1] : null;
}

export async function query(sqlText, params) {
  const projectRef = getProjectRef();
  const pat = process.env.SUPABASE_PAT;

  if (!projectRef || !pat) {
    throw new Error(
      'Database migration via Management API requires SUPABASE_PAT in .env.\n' +
      '1. Go to https://supabase.com/dashboard/account/tokens\n' +
      '2. Create a new PAT and copy it\n' +
      "3. Add to backend/.env: SUPABASE_PAT=<your_pat>"
    );
  }

  const response = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pat}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sqlText }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Database query failed (${response.status}): ${errorBody}`);
  }

  const result = await response.json();
  return result;
}

export async function testConnection() {
  const sb = getSupabase();
  if (!sb) {
    throw new Error('Supabase not configured');
  }

  const { error } = await sb.from('analytics_summaries').select('id').limit(1);
  if (error && error.code === 'PGRST116') {
    return { ok: true, message: 'Connected via Supabase REST API (port 443)' };
  }
  if (error && error.code === '42P01') {
    return { ok: false, message: 'Connected but tables not found. Run migration first.' };
  }
  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true, message: 'Connected via Supabase REST API (port 443)' };
}

export default { query, testConnection };
