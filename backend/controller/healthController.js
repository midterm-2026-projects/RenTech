import { getHealth } from '../model/health.model.js';
import { checkAndAlert, getAlerts } from '../service/alertingService.js';

export async function getHealthStatus(req, res) {
  try {
    const health = await getHealth();

    if (health.status !== 'ok') {
      checkAndAlert(health);
      return res.status(503).json(health);
    }

    return res.status(200).json(health);
  } catch (error) {
    return res.status(503).json({
      status: 'service_unavailable',
      timestamp: new Date().toISOString(),
      components: {},
      error: error?.message || 'Health check failed',
    });
  }
}

export async function getHealthAlerts(req, res) {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    res.status(200).json({ alerts: getAlerts(limit) });
  } catch (error) {
    res.status(500).json({ error: error?.message || 'Failed to load alerts' });
  }
}
