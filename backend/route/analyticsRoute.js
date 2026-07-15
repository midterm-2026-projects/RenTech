import { requireAuth } from '../middleware/auth.js';
import {
  getAnalyticsSummaries,
  getAnalyticsForecasts,
  getAnalyticsKpis,
  getAnalyticsRevenueProjections,
} from '../controller/analyticsController.js';

export function registerAnalyticsRoutes(router) {
  router.use(requireAuth);

  router.get('/summaries', getAnalyticsSummaries);
  router.get('/forecasts', getAnalyticsForecasts);
  router.get('/kpis', getAnalyticsKpis);
  router.get('/revenue-projections', getAnalyticsRevenueProjections);
}
