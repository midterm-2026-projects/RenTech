import { aggregateTransactions } from '../service/analyticsAggregationService.js';
import { calculateSMA } from '../service/smaForecastingService.js';
import { getTransactions } from '../data/mockData.js';

export function registerForecastRoute(router) {
  router.get('/forecast', (req, res) => {
    const { period, window } = req.query;

    if (!period || !window) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Both "period" and "window" query parameters are required.',
      });
    }

    if (!['day', 'week'].includes(period)) {
      return res.status(400).json({
        error: 'Invalid period',
        message: 'Period must be "day" or "week".',
      });
    }

    const windowSize = parseInt(window, 10);

    if (Number.isNaN(windowSize) || windowSize < 1) {
      return res.status(400).json({
        error: 'Invalid window',
        message: 'Window must be a positive integer.',
      });
    }

    const transactions = getTransactions();
    const aggregation = aggregateTransactions(transactions, period);

    if (aggregation.length === 0) {
      return res.json({
        period,
        window: windowSize,
        aggregation: [],
        forecast: [],
      });
    }

    const forecastData = aggregation.map(a => ({
      date: a.period,
      value: a.count,
    }));

    const forecast = calculateSMA(forecastData, windowSize);

    res.json({
      period,
      window: windowSize,
      aggregation,
      forecast,
    });
  });
}