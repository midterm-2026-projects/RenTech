import { createClient } from '@supabase/supabase-js';

let client = null;

export function getSupabase() {
  if (client) return client;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  client = createClient(supabaseUrl, supabaseKey);
  return client;
}
