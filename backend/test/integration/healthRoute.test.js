import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';

const healthModel = vi.hoisted(() => ({
  getHealth: vi.fn(),
}));

const alerting = vi.hoisted(() => ({
  checkAndAlert: vi.fn(),
  getAlerts: vi.fn(),
}));

vi.mock('../../model/health.model.js', () => ({
  getHealth: healthModel.getHealth,
}));

vi.mock('../../service/alertingService.js', () => ({
  checkAndAlert: alerting.checkAndAlert,
  getAlerts: alerting.getAlerts,
  clearAlerts: vi.fn(),
}));

import { registerHealthRoutes } from '../../route/healthRoute.js';

function makeApp() {
  const app = express();
  const router = express.Router();
  registerHealthRoutes(router);
  app.use('/api', router);
  return app;
}

describe('health check route (controller)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => vi.restoreAllMocks());

  it('returns 200 with every component healthy', async () => {
    healthModel.getHealth.mockResolvedValue({
      status: 'ok',
      timestamp: new Date().toISOString(),
      components: {
        database: { status: 'healthy', message: 'connected' },
        gemini: { status: 'healthy', message: 'reachable' },
      },
    });

    const res = await request(makeApp()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.components.database.status).toBe('healthy');
    expect(res.body.components.gemini.status).toBe('healthy');
    expect(alerting.checkAndAlert).not.toHaveBeenCalled();
  });

  it('returns 503 and names the broken component when a service is down', async () => {
    healthModel.getHealth.mockResolvedValue({
      status: 'service_unavailable',
      timestamp: new Date().toISOString(),
      components: {
        database: { status: 'unhealthy', message: 'connection refused' },
        gemini: { status: 'healthy', message: 'reachable' },
      },
    });

    const res = await request(makeApp()).get('/api/health');
    expect(res.status).toBe(503);
    expect(res.body.status).toBe('service_unavailable');
    expect(res.body.components.database.status).toBe('unhealthy');
    expect(res.body.components.database.message).toContain('connection refused');
    expect(alerting.checkAndAlert).toHaveBeenCalledTimes(1);
  });

  it('exposes recent alerts via /api/health/alerts', async () => {
    alerting.getAlerts.mockReturnValue([
      { id: '1', component: 'database', severity: 'critical', message: 'down' },
    ]);

    const res = await request(makeApp()).get('/api/health/alerts');
    expect(res.status).toBe(200);
    expect(res.body.alerts).toHaveLength(1);
    expect(res.body.alerts[0].component).toBe('database');
  });
});
