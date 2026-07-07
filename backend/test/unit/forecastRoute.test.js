const { aggregateTransactions } = require('../../service/analyticsAggregationService');
const { calculateSMA } = require('../../service/smaForecastingService');

describe('Forecast Computation', () => {
  const transactions = [
    { date: '2024-01-01', type: 'rental', amount: 500 },
    { date: '2024-01-01', type: 'reservation', amount: 300 },
    { date: '2024-01-02', type: 'rental', amount: 700 },
    { date: '2024-01-03', type: 'rental', amount: 400 },
    { date: '2024-01-03', type: 'reservation', amount: 200 },
    { date: '2024-01-04', type: 'rental', amount: 650 },
    { date: '2024-01-05', type: 'rental', amount: 800 },
  ];

  const weeklyTransactions = [
    { date: '2024-01-01', type: 'rental', amount: 500 },
    { date: '2024-01-01', type: 'reservation', amount: 300 },
    { date: '2024-01-08', type: 'rental', amount: 700 },
    { date: '2024-01-08', type: 'reservation', amount: 200 },
    { date: '2024-01-15', type: 'rental', amount: 650 },
  ];

  it('should aggregate by day and compute SMA forecast', () => {
    const aggregation = aggregateTransactions(transactions, 'day');
    const forecastData = aggregation.map(a => ({
      date: a.period,
      value: a.count,
    }));
    const forecast = calculateSMA(forecastData, 3);

    expect(aggregation).toEqual([
      { period: '2024-01-01', count: 2, revenue: 800 },
      { period: '2024-01-02', count: 1, revenue: 700 },
      { period: '2024-01-03', count: 2, revenue: 600 },
      { period: '2024-01-04', count: 1, revenue: 650 },
      { period: '2024-01-05', count: 1, revenue: 800 },
    ]);
    expect(forecast).toEqual([
      { date: '2024-01-03', forecast: 1.67 },
      { date: '2024-01-04', forecast: 1.33 },
      { date: '2024-01-05', forecast: 1.33 },
    ]);
  });

  it('should aggregate by week and compute SMA forecast', () => {
    const aggregation = aggregateTransactions(weeklyTransactions, 'week');
    const forecastData = aggregation.map(a => ({
      date: a.period,
      value: a.count,
    }));
    const forecast = calculateSMA(forecastData, 2);

    expect(aggregation).toHaveLength(3);
    expect(aggregation[0]).toHaveProperty('period');
    expect(aggregation[0]).toHaveProperty('count');
    expect(aggregation[0]).toHaveProperty('revenue');
    expect(forecast).toHaveLength(2);
    expect(forecast[0]).toHaveProperty('date');
    expect(forecast[0]).toHaveProperty('forecast');
    expect(forecast[0].forecast).toBe(2);
    expect(forecast[1].forecast).toBe(1.5);
  });

  it('should return empty aggregation and forecast for no transactions', () => {
    const aggregation = aggregateTransactions([], 'day');
    const forecastData = aggregation.map(a => ({
      date: a.period,
      value: a.count,
    }));
    const forecast = calculateSMA(forecastData, 3);

    expect(aggregation).toEqual([]);
    expect(forecast).toEqual([]);
  });

  it('should return empty forecast when window exceeds data length', () => {
    const aggregation = aggregateTransactions(
      [{ date: '2024-01-01', type: 'rental', amount: 500 }],
      'day'
    );
    const forecastData = aggregation.map(a => ({
      date: a.period,
      value: a.count,
    }));
    const forecast = calculateSMA(forecastData, 3);

    expect(aggregation).toHaveLength(1);
    expect(forecast).toEqual([]);
  });

  it('should handle null period as day aggregation', () => {
    const aggregation = aggregateTransactions(transactions, null);
    expect(aggregation.map(a => a.period)).toEqual([
      '2024-01-01', '2024-01-02', '2024-01-03',
      '2024-01-04', '2024-01-05',
    ]);
  });

  it('should compute forecast with window size 1', () => {
    const aggregation = aggregateTransactions(
      [
        { date: '2024-01-01', type: 'rental', amount: 500 },
        { date: '2024-01-02', type: 'rental', amount: 700 },
      ],
      'day'
    );
    const forecastData = aggregation.map(a => ({
      date: a.period,
      value: a.count,
    }));
    const forecast = calculateSMA(forecastData, 1);

    expect(forecast).toHaveLength(2);
    expect(forecast[0]).toEqual({ date: '2024-01-01', forecast: 1 });
    expect(forecast[1]).toEqual({ date: '2024-01-02', forecast: 1 });
  });

  it('should respond quickly (unit-level check)', () => {
    const start = Date.now();

    const aggregation = aggregateTransactions(transactions, 'day');
    const forecastData = aggregation.map(a => ({
      date: a.period,
      value: a.count,
    }));
    calculateSMA(forecastData, 3);

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(2000);
  });
});
