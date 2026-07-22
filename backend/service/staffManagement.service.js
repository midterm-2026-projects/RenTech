import bcrypt from 'bcryptjs';
import { getSupabase } from '../config/supabaseClient.js';

function getClient() {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase not configured.');
  return sb;
}

export const getStaffList = async () => {
  const sb = getClient();
  const { data, error } = await sb
    .from('local_users')
    .select('username, role')
    .in('role', ['Staff', 'Admin']);
  if (error) throw new Error(error.message);
  return data || [];
};

export const addStaff = async ({ username, password }) => {
  const sb = getClient();
  const normalized = username.trim().toLowerCase();

  const { data: existing } = await sb
    .from('local_users')
    .select('username')
    .eq('username', normalized)
    .maybeSingle();
  if (existing) throw new Error('Staff member with this username already exists.');

  const password_hash = await bcrypt.hash(password, 10);
  const { error } = await sb
    .from('local_users')
    .insert({ username: normalized, password_hash, role: 'Staff' });
  if (error) throw new Error(error.message);

  return { username: normalized, role: 'Staff', message: 'Staff member added successfully.' };
};

export const removeStaff = async (username) => {
  const sb = getClient();
  const normalized = username.trim().toLowerCase();

  const { data: existing } = await sb
    .from('local_users')
    .select('username')
    .eq('username', normalized)
    .maybeSingle();
  if (!existing) throw new Error('Staff member not found.');

  const { error } = await sb
    .from('local_users')
    .delete()
    .eq('username', normalized);
  if (error) throw new Error(error.message);

  return { success: true, message: `Staff member '${normalized}' has been removed.` };
};

export const validateStaffCredentials = async (username, password) => {
  const sb = getClient();
  const normalized = username.trim().toLowerCase();

  const { data, error } = await sb
    .from('local_users')
    .select('username, password_hash, role')
    .eq('username', normalized)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Staff member not found.');

  const match = await bcrypt.compare(password, data.password_hash);
  if (!match) throw new Error('Invalid password.');

  return { username: data.username, role: data.role, authenticated: true };
};