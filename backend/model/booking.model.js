import { getSupabase } from '../config/supabaseClient.js';
import { query } from '../config/database.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function runMigration() {
  const sqlPath = join(__dirname, '..', 'migrations', '004_booking_schema.sql');
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
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
  },

  async create(bookingData) {
    const sb = getClient();
    if (sb.error) return sb;

    // 1. Check if the item is already booked on the same day
    const { data: existingBookings, error: checkError } = await sb
      .from('bookings')
      .select('id')
      .eq('item_name', bookingData.item_name)
      .eq('rental_date', bookingData.rental_date)
      .neq('status', 'Cancelled'); // Ignore bookings that were cancelled

    if (checkError) return { data: null, error: checkError };
    
    // 2. Reject the booking if a conflicting row exists
    if (existingBookings && existingBookings.length > 0) {
      return { 
        data: null, 
        error: new Error(`The gown "${bookingData.item_name}" is already reserved for ${bookingData.rental_date}.`) 
      };
    }

    // 3. Proceed to create if available
    const formattedBooking = {
      id: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
      item_name: bookingData.item_name,
      total_price: bookingData.total_price || 4500,
      booking_type: bookingData.booking_type || 'Me',
      full_name: bookingData.full_name,
      phone_number: bookingData.phone_number,
      address: bookingData.address,
      special_notes: bookingData.special_notes,
      rental_date: bookingData.rental_date,
      size_selected: bookingData.size_selected,
      status: 'Pending'
    };

    return sb
      .from('bookings')
      .insert([formattedBooking])
      .select();
  }
};