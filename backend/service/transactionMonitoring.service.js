import { getSupabase } from '../config/supabaseClient.js';

function getClient() {
  const sb = getSupabase();
  if (!sb) {
    return { data: null, error: new Error('Supabase not configured.') };
  }
  return sb;
}

function mapRow(row) {
  if (!row) return row;
  return {
    id: row.id,
    username: row.username || 'Walk-in Customer',
    itemName: row.item,
    pricePerDay: row.price_per_day != null ? Number(row.price_per_day) : null,
    daysRented: row.days_rented != null ? Number(row.days_rented) : null,
    totalCost: row.amount != null ? Number(row.amount) : 0,
    status: row.status,
    date: row.date,
  };
}

export const getRentalHistory = async (filters = {}) => {
  const sb = getClient();
  if (sb.error) return [];

  if (filters.username !== undefined && filters.username !== null) {
    if (typeof filters.username !== "string" || filters.username.trim() === "") {
      throw new Error("Improper Data Type: Username filter must be a non-empty string.");
    }
  }
  if (filters.status !== undefined && filters.status !== null) {
    if (typeof filters.status !== "string" || filters.status.trim() === "") {
      throw new Error("Improper Data Type: Status filter must be a non-empty string.");
    }
  }
  if (filters.itemName !== undefined && filters.itemName !== null) {
    if (typeof filters.itemName !== "string" || filters.itemName.trim() === "") {
      throw new Error("Improper Data Type: Item Name filter must be a non-empty string.");
    }
  }

  let q = sb.from('transactions').select('*', { count: 'exact' });

  if (filters.username) {
    q = q.ilike('username', `%${filters.username.trim()}%`);
  }
  if (filters.status) {
    if (Array.isArray(filters.status)) {
      q = q.in('status', filters.status);
    } else {
      q = q.ilike('status', filters.status);
    }
  }
  if (filters.itemName) {
    q = q.ilike('item', `%${filters.itemName.trim()}%`);
  }

  const { data, error } = await q.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(mapRow);
};

export const getTransactionSummary = async (username = null) => {
  if (username !== null && (typeof username !== "string" || username.trim() === "")) {
    throw new Error("Improper Data Type: Username argument must be a valid string.");
  }

  const sb = getClient();
  if (sb.error) return { totalTransactions: 0, totalRevenue: 0, statusCounts: {} };

  let q = sb.from('transactions').select('amount, status, username', { count: 'exact' });
  if (username) {
    q = q.ilike('username', `%${username.trim()}%`);
  }

  const { data, error, count } = await q;
  if (error) throw new Error(error.message);

  const records = data || [];
  const totalRevenue = records.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const statusCounts = records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return {
    totalTransactions: typeof count === 'number' ? count : records.length,
    totalRevenue,
    statusCounts,
  };
};

export const getAllTransactionSummaries = async () => {
  const sb = getClient();
  if (sb.error) return [];

  const { data, error } = await sb.from('transactions').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(mapRow);
};

export const getTransactionHistory = async (filters = {}) => {
  return await getRentalHistory(filters);
};

export const calculateTransactionCosts = async (transactionId = null) => {
  const sb = getClient();
  if (sb.error) return { totalItems: 0, totalCost: 0, averageCostPerItem: 0, breakdown: [] };

  let q = sb.from('transactions').select('*');
  if (transactionId) {
    q = q.eq('id', transactionId);
  }
  const { data, error } = await q;
  if (error) throw new Error(error.message);

  if (transactionId && (!data || data.length === 0)) {
    const err = new Error("Transaction not found.");
    err.statusCode = 404;
    throw err;
  }

  const breakdown = (data || []).map(mapRow).map(r => ({
    id: r.id,
    itemName: r.itemName,
    pricePerDay: r.pricePerDay,
    daysRented: r.daysRented,
    totalCost: r.totalCost,
    status: r.status,
  }));

  const totalCost = breakdown.reduce((sum, item) => sum + (item.totalCost || 0), 0);
  return {
    totalItems: breakdown.length,
    totalCost,
    averageCostPerItem: breakdown.length > 0 ? Math.round(totalCost / breakdown.length) : 0,
    breakdown,
  };
};

