const { aggregateTransactions } = require('../../service/analyticsAggregationService');

describe('Analytics Aggregation Service', () => {
  it('should group transactions by day and return count and revenue', () => {
    const transactions = [
      { date: '2024-01-01', type: 'rental', amount: 500 },
      { date: '2024-01-01', type: 'reservation', amount: 300 },
      { date: '2024-01-02', type: 'rental', amount: 700 },
    ];

    const result = aggregateTransactions(transactions, 'day');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ period: '2024-01-01', count: 2, revenue: 800 });
    expect(result[1]).toEqual({ period: '2024-01-02', count: 1, revenue: 700 });
  });

  it('should group transactions by week', () => {
    const transactions = [
      { date: '2024-01-01', type: 'rental', amount: 500 },
      { date: '2024-01-03', type: 'rental', amount: 400 },
      { date: '2024-01-08', type: 'rental', amount: 600 },
    ];

    const result = aggregateTransactions(transactions, 'week');

    expect(result).toHaveLength(2);
    expect(result[0].period).toBe('2024-01-01');
    expect(result[0].count).toBe(2);
    expect(result[1].period).toBe('2024-01-08');
    expect(result[1].count).toBe(1);
  });

  it('should return empty array for empty transactions', () => {
    const result = aggregateTransactions([], 'day');
    expect(result).toEqual([]);
  });

  it('should return empty array for null transactions', () => {
    const result = aggregateTransactions(null, 'day');
    expect(result).toEqual([]);
  });

  it('should sort results chronologically', () => {
    const transactions = [
      { date: '2024-01-03', type: 'rental', amount: 400 },
      { date: '2024-01-01', type: 'rental', amount: 500 },
      { date: '2024-01-02', type: 'rental', amount: 700 },
    ];

    const result = aggregateTransactions(transactions, 'day');

    expect(result[0].period).toBe('2024-01-01');
    expect(result[1].period).toBe('2024-01-02');
    expect(result[2].period).toBe('2024-01-03');
  });

  it('should handle transactions with zero amount', () => {
    const transactions = [
      { date: '2024-01-01', type: 'rental', amount: 0 },
    ];

    const result = aggregateTransactions(transactions, 'day');

    expect(result).toHaveLength(1);
    expect(result[0].revenue).toBe(0);
    expect(result[0].count).toBe(1);
  });
});
