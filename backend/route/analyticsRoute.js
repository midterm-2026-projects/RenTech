import analyticsModel from '../model/analytics.model.js';

export function registerAnalyticsRoutes(router) {
  router.get('/analytics/summaries', async (req, res) => {
    const { data, error } = await analyticsModel.getAnalyticsSummaries();
    if (error) return res.status(500).json({ error: error.message || 'Failed to load summaries' });
    res.json(data || []);
  });

  router.get('/analytics/forecasts', async (req, res) => {
    const { data, error } = await analyticsModel.getForecasts();
    if (error) return res.status(500).json({ error: error.message || 'Failed to load forecasts' });
    res.json(data || []);
  });

  router.get('/analytics/kpis', async (req, res) => {
    const { data, error } = await analyticsModel.getKpiStorage();
    if (error) return res.status(500).json({ error: error.message || 'Failed to load KPIs' });
    res.json(data || []);
  });

  router.get('/analytics/revenue-projections', async (req, res) => {
    const { data, error } = await analyticsModel.getRevenueProjections();
    if (error) return res.status(500).json({ error: error.message || 'Failed to load projections' });
    res.json(data || []);
  });
}
