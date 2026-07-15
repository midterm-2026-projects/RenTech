import { describe, it, expect } from 'vitest';
import {
  classifyInventory,
  classifyItem,
  DEFAULT_THRESHOLDS,
} from '../../service/inventoryOptimizationService.js';

const now = new Date('2026-06-01T00:00:00Z');

function item(overrides = {}) {
  return {
    id: 'i1',
    name: 'Gown',
    category: 'Dresses',
    rentalCount: 0,
    revenue: 0,
    lastActivity: null,
    ...overrides,
  };
}

describe('classifyItem', () => {
  it('labels high frequency + high revenue as Star Performer', () => {
    const result = classifyItem(
      item({ rentalCount: 20, revenue: 9000, lastActivity: '2026-05-30' }),
      {},
      now
    );
    expect(result).toBe('Star Performer');
  });

  it('requires BOTH high rentals and high revenue for Star', () => {
    expect(
      classifyItem(item({ rentalCount: 20, revenue: 100, lastActivity: '2026-05-30' }), {}, now)
    ).toBe('Slow Mover');
    expect(
      classifyItem(item({ rentalCount: 2, revenue: 9000, lastActivity: '2026-05-30' }), {}, now)
    ).toBe('Slow Mover');
  });

  it('labels low but steady movement as Slow Mover', () => {
    const result = classifyItem(
      item({ rentalCount: 3, revenue: 500, lastActivity: '2026-05-20' }),
      {},
      now
    );
    expect(result).toBe('Slow Mover');
  });

  it('labels no activity as Dead Stock', () => {
    expect(classifyItem(item({ rentalCount: 0 }), {}, now)).toBe('Dead Stock');
  });

  it('labels items idle beyond deadDays as Dead Stock', () => {
    const result = classifyItem(
      item({ rentalCount: 50, revenue: 99999, lastActivity: '2026-01-01' }),
      {},
      now
    );
    expect(result).toBe('Dead Stock');
  });

  it('respects changeable thresholds', () => {
    const thresholds = { starMinRentals: 5, starMinRevenue: 1000, deadDays: 30 };
    expect(
      classifyItem(item({ rentalCount: 6, revenue: 2000, lastActivity: '2026-05-20' }), thresholds, now)
    ).toBe('Star Performer');
    // idle 42 days > 30 day threshold => Dead Stock despite high metrics
    expect(
      classifyItem(item({ rentalCount: 6, revenue: 2000, lastActivity: '2026-04-01' }), thresholds, now)
    ).toBe('Dead Stock');
  });
});

describe('classifyInventory', () => {
  it('returns id, name and category for each item', () => {
    const result = classifyInventory(
      [
        item({ id: 'a', name: 'Tux', category: 'Suits', rentalCount: 20, revenue: 9000, lastActivity: '2026-05-30' }),
        item({ id: 'b', name: 'Hat', category: 'Accessories', rentalCount: 0 }),
      ],
      {},
      now
    );

    expect(result).toEqual([
      { id: 'a', name: 'Tux', category: 'Suits', classification: 'Star Performer' },
      { id: 'b', name: 'Hat', category: 'Accessories', classification: 'Dead Stock' },
    ]);
  });

  it('uses default thresholds when none provided', () => {
    const result = classifyInventory(
      [item({ rentalCount: DEFAULT_THRESHOLDS.starMinRentals, revenue: DEFAULT_THRESHOLDS.starMinRevenue, lastActivity: '2026-05-30' })],
      {},
      now
    );
    expect(result[0].classification).toBe('Star Performer');
  });
});

describe('classifyItem - edge conditions & boundaries', () => {
  it('treats hitting the Star threshold exactly as a Star Performer', () => {
    const r = classifyItem(
      item({
        rentalCount: DEFAULT_THRESHOLDS.starMinRentals,
        revenue: DEFAULT_THRESHOLDS.starMinRevenue,
        lastActivity: '2026-05-30',
      }),
      {},
      now
    );
    expect(r).toBe('Star Performer');
  });

  it('one rental short of the Star threshold drops to Slow Mover', () => {
    const r = classifyItem(
      item({
        rentalCount: DEFAULT_THRESHOLDS.starMinRentals - 1,
        revenue: DEFAULT_THRESHOLDS.starMinRevenue,
        lastActivity: '2026-05-30',
      }),
      {},
      now
    );
    expect(r).toBe('Slow Mover');
  });

  it('idle exactly deadDays is NOT dead (strictly greater than)', () => {
    // 2026-03-03 is exactly 90 days before now (2026-06-01)
    const r = classifyItem(item({ rentalCount: 3, lastActivity: '2026-03-03' }), {}, now);
    expect(r).toBe('Slow Mover');
  });

  it('idle one day past deadDays becomes Dead Stock', () => {
    // 2026-03-02 is 91 days before now
    const r = classifyItem(item({ rentalCount: 3, lastActivity: '2026-03-02' }), {}, now);
    expect(r).toBe('Dead Stock');
  });

  it('a future lastActivity (clock skew) is never Dead Stock', () => {
    const r = classifyItem(item({ rentalCount: 0, lastActivity: '2026-07-01' }), {}, now);
    expect(r).toBe('Dead Stock'); // dead because zero rentals, not because of idle time
    const r2 = classifyItem(item({ rentalCount: 4, lastActivity: '2026-07-01' }), {}, now);
    expect(r2).toBe('Slow Mover'); // not dead despite "negative" idle time
  });

  it('handles missing/undefined metrics via defaults (=> Dead Stock)', () => {
    const bare = { id: 'x', name: 'x', category: 'x' };
    expect(classifyItem(bare, {}, now)).toBe('Dead Stock');
  });

  it('high revenue but zero rentals has no movement => Dead Stock', () => {
    const r = classifyItem(item({ rentalCount: 0, revenue: 99999, lastActivity: '2026-05-30' }), {}, now);
    expect(r).toBe('Dead Stock');
  });

  it('partial threshold overrides still merge with defaults', () => {
    const r = classifyItem(
      item({ rentalCount: 5, revenue: 100, lastActivity: '2026-05-30' }),
      { starMinRentals: 5 },
      now
    );
    // starMinRevenue still default 5000, so not a Star
    expect(r).toBe('Slow Mover');
  });

  it('returns an empty list for no items', () => {
    expect(classifyInventory([], {}, now)).toEqual([]);
  });

  it('classifies a mixed batch in a single pass', () => {
    const result = classifyInventory(
      [
        item({ id: '1', rentalCount: 20, revenue: 9000, lastActivity: '2026-05-30' }),
        item({ id: '2', rentalCount: 3, revenue: 300, lastActivity: '2026-05-20' }),
        item({ id: '3', rentalCount: 0, lastActivity: '2026-01-01' }),
      ],
      {},
      now
    );
    expect(result.map(r => r.classification)).toEqual([
      'Star Performer',
      'Slow Mover',
      'Dead Stock',
    ]);
  });
});
