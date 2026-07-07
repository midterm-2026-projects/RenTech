const { calculateSMA } = require('../../service/smaForecastingService');

describe('SMA Forecasting Service', () => {
  it('should calculate SMA correctly with window size 3', () => {
    const data = [
      { date: '2024-01-01', value: 10 },
      { date: '2024-01-02', value: 20 },
      { date: '2024-01-03', value: 30 },
      { date: '2024-01-04', value: 40 },
      { date: '2024-01-05', value: 50 },
    ];

    const result = calculateSMA(data, 3);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ date: '2024-01-03', forecast: 20 });
    expect(result[1]).toEqual({ date: '2024-01-04', forecast: 30 });
    expect(result[2]).toEqual({ date: '2024-01-05', forecast: 40 });
  });

  it('should return empty forecast when data is shorter than window', () => {
    const data = [
      { date: '2024-01-01', value: 10 },
      { date: '2024-01-02', value: 20 },
    ];

    const result = calculateSMA(data, 3);

    expect(result).toEqual([]);
  });

  it('should return empty forecast for empty data', () => {
    const result = calculateSMA([], 3);
    expect(result).toEqual([]);
  });

  it('should return empty forecast for null data', () => {
    const result = calculateSMA(null, 3);
    expect(result).toEqual([]);
  });

  it('should calculate SMA correctly with window size 2', () => {
    const data = [
      { date: '2024-01-01', value: 10 },
      { date: '2024-01-02', value: 20 },
      { date: '2024-01-03', value: 30 },
    ];

    const result = calculateSMA(data, 2);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ date: '2024-01-02', forecast: 15 });
    expect(result[1]).toEqual({ date: '2024-01-03', forecast: 25 });
  });

  it('should handle decimal values correctly', () => {
    const data = [
      { date: '2024-01-01', value: 5 },
      { date: '2024-01-02', value: 7 },
      { date: '2024-01-03', value: 9 },
    ];

    const result = calculateSMA(data, 2);

    expect(result).toHaveLength(2);
    expect(result[0].forecast).toBe(6);
    expect(result[1].forecast).toBe(8);
  });

  it('should work with window size 1 (identity)', () => {
    const data = [
      { date: '2024-01-01', value: 42 },
      { date: '2024-01-02', value: 99 },
    ];

    const result = calculateSMA(data, 1);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ date: '2024-01-01', forecast: 42 });
    expect(result[1]).toEqual({ date: '2024-01-02', forecast: 99 });
  });
});
