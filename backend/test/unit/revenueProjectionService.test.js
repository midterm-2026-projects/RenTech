import { describe, it, expect } from 'vitest';
import { projectRevenue } from '../../service/revenueProjectionService.js';

describe('projectRevenue', () => {
  it('multiplies SMA forecast demand by average price per item and sums to 2 decimals', () => {
    const items = [
      {
        itemId: 'a',
        name: 'Gown',
        averagePrice: 2000,
        history: [
          { date: '2026-01-01', value: 10 },
          { date: '2026-02-01', value: 20 },
          { date: '2026-03-01', value: 30 },
        ],
      },
      {
        itemId: 'b',
        name: 'Tux',
        averagePrice: 1500,
        history: [
          { date: '2026-01-01', value: 4 },
          { date: '2026-02-01', value: 6 },
          { date: '2026-03-01', value: 8 },
        ],
      },
    ];

    const { total, breakdown } = projectRevenue(items, { windowSize: 3 });

    // Gown SMA = (10+20+30)/3 = 20 -> 20 * 2000 = 40000
    // Tux   SMA = (4+6+8)/3   = 6   -> 6 * 1500  = 9000
    expect(breakdown[0].forecastedDemand).toBe(20);
    expect(breakdown[0].projectedRevenue).toBe(40000);
    expect(breakdown[1].forecastedDemand).toBe(6);
    expect(breakdown[1].projectedRevenue).toBe(9000);
    expect(total).toBe(49000);
  });

  it('adds zero to the total for items with no sales history', () => {
    const items = [
      { itemId: 'a', name: 'New', averagePrice: 500, history: [] },
      {
        itemId: 'b',
        name: 'Gown',
        averagePrice: 1000,
        history: [
          { date: '2026-01-01', value: 5 },
          { date: '2026-02-01', value: 7 },
          { date: '2026-03-01', value: 9 },
        ],
      },
    ];

    const { total, breakdown } = projectRevenue(items, { windowSize: 3 });
    expect(breakdown[0].forecastedDemand).toBe(0);
    expect(breakdown[0].projectedRevenue).toBe(0);
    expect(total).toBe(7000); // only the Gown contributes
  });

  it('rounds the total to two decimal places', () => {
    const items = [
      {
        itemId: 'a',
        name: 'Frac',
        averagePrice: 3.3333,
        history: [
          { date: '2026-01-01', value: 1 },
          { date: '2026-02-01', value: 1 },
          { date: '2026-03-01', value: 1 },
        ],
      },
    ];

    const { total } = projectRevenue(items, { windowSize: 3 });
    // demand = 1, price = 3.3333 -> 3.3333 rounded to 2dp = 3.33
    expect(total).toBe(3.33);
  });

  it('returns total 0 for an empty list', () => {
    const { total, breakdown } = projectRevenue([], { windowSize: 3 });
    expect(total).toBe(0);
    expect(breakdown).toEqual([]);
  });
});

describe('projectRevenue - edge conditions & boundaries', () => {
  it('uses a windowSize of 1 for a single history point', () => {
    const { breakdown } = projectRevenue(
      [{ itemId: 'a', name: 'X', averagePrice: 10, history: [{ date: '2026-01-01', value: 5 }] }],
      { windowSize: 1 }
    );
    expect(breakdown[0].forecastedDemand).toBe(5);
    expect(breakdown[0].projectedRevenue).toBe(50);
  });

  it('history shorter than windowSize forecasts 0 (adds zero)', () => {
    const { total, breakdown } = projectRevenue(
      [{ itemId: 'a', name: 'X', averagePrice: 100, history: [{ date: '2026-01-01', value: 5 }, { date: '2026-02-01', value: 9 }] }],
      { windowSize: 3 }
    );
    expect(breakdown[0].forecastedDemand).toBe(0);
    expect(total).toBe(0);
  });

  it('uses the default windowSize (3) when none is passed', () => {
    const { breakdown } = projectRevenue([
      {
        itemId: 'a',
        name: 'X',
        averagePrice: 10,
        history: [
          { date: '2026-01-01', value: 3 },
          { date: '2026-02-01', value: 6 },
          { date: '2026-03-01', value: 9 },
        ],
      },
    ]);
    expect(breakdown[0].forecastedDemand).toBe(6); // (3+6+9)/3
  });

  it('treats a missing averagePrice as 0 revenue', () => {
    const { breakdown } = projectRevenue(
      [{ itemId: 'a', name: 'X', history: [{ date: '2026-01-01', value: 10 }, { date: '2026-02-01', value: 20 }, { date: '2026-03-01', value: 30 }] }],
      { windowSize: 3 }
    );
    expect(breakdown[0].averagePrice).toBe(0);
    expect(breakdown[0].projectedRevenue).toBe(0);
  });

  it('treats an averagePrice of 0 as 0 revenue', () => {
    const { breakdown } = projectRevenue(
      [{ itemId: 'a', name: 'X', averagePrice: 0, history: [{ date: '2026-01-01', value: 10 }, { date: '2026-02-01', value: 20 }, { date: '2026-03-01', value: 30 }] }],
      { windowSize: 3 }
    );
    expect(breakdown[0].projectedRevenue).toBe(0);
  });

  it('rounds fractional forecasts and prices to two decimals', () => {
    const { breakdown } = projectRevenue(
      [{ itemId: 'a', name: 'X', averagePrice: 2, history: [{ date: '2026-01-01', value: 1 }, { date: '2026-02-01', value: 2 }] }],
      { windowSize: 2 }
    );
    // avg = 1.5, 1.5 * 2 = 3.00
    expect(breakdown[0].forecastedDemand).toBe(1.5);
    expect(breakdown[0].projectedRevenue).toBe(3);
  });

  it('mixes items with and without history in one call', () => {
    const { total, breakdown } = projectRevenue(
      [
        { itemId: 'a', name: 'Has', averagePrice: 100, history: [{ date: '2026-01-01', value: 2 }, { date: '2026-02-01', value: 4 }, { date: '2026-03-01', value: 6 }] },
        { itemId: 'b', name: 'None', averagePrice: 100, history: [] },
        { itemId: 'c', name: 'Frac', averagePrice: 3.3333, history: [{ date: '2026-01-01', value: 1 }, { date: '2026-02-01', value: 1 }, { date: '2026-03-01', value: 1 }] },
      ],
      { windowSize: 3 }
    );
    expect(breakdown[0].projectedRevenue).toBe(400); // 4 * 100
    expect(breakdown[1].projectedRevenue).toBe(0);
    expect(breakdown[2].projectedRevenue).toBe(3.33); // 1 * 3.3333
    expect(total).toBe(403.33);
  });

  it('ignores an item with no history field at all', () => {
    const { breakdown } = projectRevenue([{ itemId: 'a', name: 'X', averagePrice: 50 }], { windowSize: 3 });
    expect(breakdown[0].forecastedDemand).toBe(0);
    expect(breakdown[0].projectedRevenue).toBe(0);
  });
});
