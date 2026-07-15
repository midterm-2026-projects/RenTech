import analyticsModel from '../model/analytics.model.js';

export async function getAnalyticsSummaries(req, res) {
  try {
    const { data, error } = await analyticsModel.getAnalyticsSummaries();
    if (error) return res.status(500).json({ error: error.message || 'Failed to load summaries' });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load summaries' });
  }
}

export async function getAnalyticsForecasts(req, res) {
  try {
    const { data, error } = await analyticsModel.getForecasts();
    if (error) return res.status(500).json({ error: error.message || 'Failed to load forecasts' });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load forecasts' });
  }
}

export async function getAnalyticsKpis(req, res) {
  try {
    const { data, error } = await analyticsModel.getKpiStorage();
    if (error) return res.status(500).json({ error: error.message || 'Failed to load KPIs' });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load KPIs' });
  }
}

export async function getAnalyticsRevenueProjections(req, res) {
  try {
    const { data, error } = await analyticsModel.getRevenueProjections();
    if (error) return res.status(500).json({ error: error.message || 'Failed to load projections' });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load projections' });
  }
}
