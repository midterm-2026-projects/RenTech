// Revenue Projection Service
// Projects total revenue by combining the SMA demand forecast for each item
// with that item's average revenue (price). Total = sum(forecastedDemand * avgPrice),
// rounded to two decimal places. Items with no sales history produce a forecast
// of 0 (calculateSMA returns [] when there is not enough history), so they add 0.

import { calculateSMA } from './smaForecastingService.js';

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function projectRevenue(items = [], { windowSize = 3 } = {}) {
  const breakdown = items.map(item => {
    const history = (item.history || []).map(h => ({ date: h.date, value: h.value }));
    const sma = calculateSMA(history, windowSize);
    const forecastedDemand = sma.length ? sma[sma.length - 1].forecast : 0;
    const averagePrice = item.averagePrice ?? 0;
    const projectedRevenue = round2(forecastedDemand * averagePrice);

    return {
      itemId: item.itemId,
      name: item.name,
      forecastedDemand,
      averagePrice,
      projectedRevenue,
    };
  });

  const total = round2(breakdown.reduce((sum, b) => sum + b.projectedRevenue, 0));

  return { total, breakdown };
}

export default {
  projectRevenue,
};
