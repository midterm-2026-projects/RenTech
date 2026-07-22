import { getSupabase } from '../config/supabaseClient.js';

const DEFAULTS = {
  bookingConfirmation: "Hi {customerName}, your booking for {itemName} on {rentalDate} is confirmed! Show this QR when you pick up your item: {qrCode}. Thank you for choosing RENTECH.",
  returnReminder: "Hi {customerName}, this is a friendly reminder to return your rented item '{itemName}' by {returnDate}. Late returns are subject to penalties. - RENTECH",
  overdueAlert: "URGENT: {customerName}, your rental for '{itemName}' is overdue. Please return it immediately to avoid additional charges. - RENTECH",
  paymentConfirmation: "Hi {customerName}, we received your downpayment of ₱{downpaymentAmount} for '{itemName}'. Remaining balance ₱{balanceAmount} is due at pickup. - RENTECH",
};

function getClient() {
  const sb = getSupabase();
  if (!sb) return null;
  return sb;
}

async function getSettingsByPrefix(prefix) {
  const sb = getClient();
  if (!sb) return {};
  const { data } = await sb
    .from('settings')
    .select('key, value')
    .ilike('key', `${prefix}%`);
  const map = {};
  (data || []).forEach(row => { map[row.key] = row.value; });
  return map;
}

async function setSetting(key, value) {
  const sb = getClient();
  if (!sb) return;
  await sb
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
}

export const getProfile = async () => {
  const settings = await getSettingsByPrefix('profile_');
  return {
    name: settings.profile_name || 'Admin User',
    role: settings.profile_role || 'Admin Role',
    email: settings.profile_email || 'user@rentech.com',
    phone: settings.profile_phone || '+63 917 123 4567',
  };
};

export const getIntegrations = async () => {
  const settings = await getSettingsByPrefix('integration_');
  return [
    {
      id: 1,
      name: settings.integration_semaphore_name || 'Semaphore SMS Gateway',
      status: settings.integration_semaphore_status || 'Connected',
      desc: settings.integration_semaphore_desc || 'Automated return reminders & booking confirmations.',
    },
    {
      id: 2,
      name: settings.integration_paymongo_name || 'PayMongo Payments',
      status: settings.integration_paymongo_status || 'Active',
      desc: settings.integration_paymongo_desc || 'Secure GCash & Credit Card downpayments.',
    },
  ];
};

export const getTemplates = async () => {
  const settings = await getSettingsByPrefix('');
  const result = { ...DEFAULTS };
  for (const key of Object.keys(DEFAULTS)) {
    if (settings[key] !== undefined) {
      result[key] = settings[key];
    }
  }
  return result;
};

export const updateTemplate = async (key, value) => {
  if (!DEFAULTS[key]) {
    throw new Error('Template not found.');
  }
  await setSetting(key, value);
  return await getTemplates();
};

export const resetTemplate = async (key) => {
  if (!DEFAULTS[key]) {
    throw new Error('Template not found.');
  }
  await setSetting(key, DEFAULTS[key]);
  return await getTemplates();
};

export const resetAllTemplates = async () => {
  const sb = getClient();
  if (sb) {
    for (const key of Object.keys(DEFAULTS)) {
      await setSetting(key, DEFAULTS[key]);
    }
  }
  return { ...DEFAULTS };
};

export const signOut = async () => {
  return { success: true, message: 'User signed out successfully.' };
};