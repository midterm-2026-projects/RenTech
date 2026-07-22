import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/supabaseClient.js', () => ({
  getSupabase: vi.fn(),
}));

import { getSupabase } from '../../config/supabaseClient.js';
import productModel from '../../model/product.model.js';

const DATASET = [
  { id: 1, name: 'Black Tuxedo', status: 'Rented', category: 'suit' },
  { id: 2, name: 'Ivory Lace Gown', status: 'Available', category: 'wedding' },
  { id: 3, name: 'Velvet Cloak', status: 'Maintenance', category: 'costume' },
  { id: 4, name: 'Red Carpet Gown', status: 'Available', category: 'evening' },
];

function buildClient(rows) {
  let working = [...rows];
  let count = rows.length;

  const builder = {
    select() {
      return builder;
    },
    update(values) {
      builder._mode = 'update';
      builder._updated = values;
      return builder;
    },
    single() {
      return Promise.resolve({ data: { ...builder._updated, id: builder._targetId }, error: null });
    },
    ilike(column, pattern) {
      const like = String(pattern).replace(/%/g, '').toLowerCase();
      working = working.filter((r) => String(r[column]).toLowerCase().includes(like));
      count = working.length;
      return builder;
    },
    eq(column, value) {
      if (builder._mode === 'update') {
        builder._targetId = value;
        return builder;
      }
      working = working.filter((r) => r[column] === value);
      count = working.length;
      return builder;
    },
    order(column, opts) {
      const dir = opts && opts.ascending === false ? -1 : 1;
      working = [...working].sort((a, b) => {
        if (a[column] < b[column]) return -1 * dir;
        if (a[column] > b[column]) return 1 * dir;
        return 0;
      });
      return builder;
    },
    range(from, to) {
      const slice = working.slice(from, to + 1);
      return Promise.resolve({ data: slice, error: null, count });
    },
  };

  return {
    from: () => builder,
  };
}

describe('Product Model', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an error result when Supabase is not configured', async () => {
    getSupabase.mockReturnValue(null);

    const result = await productModel.findAll();

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.error).toBeInstanceOf(Error);
  });

  it('returns all products ordered by name with correct total and pagination', async () => {
    getSupabase.mockReturnValue(buildClient(DATASET));

    const result = await productModel.findAll({ page: 1, limit: 8 });

    expect(result.error).toBeNull();
    expect(result.total).toBe(DATASET.length);
    expect(result.data.map((p) => p.name)).toEqual([
      'Black Tuxedo',
      'Ivory Lace Gown',
      'Red Carpet Gown',
      'Velvet Cloak',
    ]);
  });

  it('applies server-side pagination offsets', async () => {
    getSupabase.mockReturnValue(buildClient(DATASET));

    const result = await productModel.findAll({ page: 2, limit: 2 });

    expect(result.total).toBe(DATASET.length);
    expect(result.data).toHaveLength(2);
    expect(result.data.map((p) => p.name)).toEqual(['Red Carpet Gown', 'Velvet Cloak']);
  });

  it('filters by status', async () => {
    getSupabase.mockReturnValue(buildClient(DATASET));

    const result = await productModel.findAll({ page: 1, limit: 8, status: 'Available' });

    expect(result.total).toBe(2);
    expect(result.data.every((p) => p.status === 'Available')).toBe(true);
  });

  it('filters by case-insensitive name search', async () => {
    getSupabase.mockReturnValue(buildClient(DATASET));

    const result = await productModel.findAll({ page: 1, limit: 8, search: 'gown' });

    expect(result.data.map((p) => p.name)).toEqual(['Ivory Lace Gown', 'Red Carpet Gown']);
  });

  it('combines search and status filters', async () => {
    getSupabase.mockReturnValue(buildClient(DATASET));

    const result = await productModel.findAll({ page: 1, limit: 8, search: 'gown', status: 'Available' });

    expect(result.data).toHaveLength(2);
    expect(result.data.every((p) => p.status === 'Available')).toBe(true);
  });

  it('returns an empty set when nothing matches', async () => {
    getSupabase.mockReturnValue(buildClient(DATASET));

    const result = await productModel.findAll({ page: 1, limit: 8, search: 'zzzzz' });

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('returns an error result when Supabase is not configured (soft delete)', async () => {
    getSupabase.mockReturnValue(null);

    const deleteFn = productModel.softDelete || productModel.remove || productModel.delete || productModel.update;
    const result = await deleteFn(1);

    expect(result.data).toBeNull();
    expect(result.error).toBeInstanceOf(Error);
  });

  it('flags the inventory row as deleted by id', async () => {
    getSupabase.mockReturnValue(buildClient(DATASET));

    const deleteFn = productModel.softDelete || productModel.remove || productModel.delete || productModel.update;
    const result = await deleteFn(3);

    expect(result.error).toBeNull();
    expect(result.data.id).toBe(3);
    expect(result.data.is_deleted).toBe(true);
  });
});