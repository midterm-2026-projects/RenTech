import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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
}));

import { getHealthStatus, getHealthAlerts } from '../../controller/healthController.js';

function mockRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe('healthController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => vi.restoreAllMocks());

  it('returns 200 and does not alert when all components are healthy', async () => {
    healthModel.getHealth.mockResolvedValue({
      status: 'ok',
      components: { database: { status: 'healthy' }, gemini: { status: 'healthy' } },
    });

    const req = {};
    const res = mockRes();
    await getHealthStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(alerting.checkAndAlert).not.toHaveBeenCalled();
  });

  it('returns 503 and raises an alert when a component is down', async () => {
    healthModel.getHealth.mockResolvedValue({
      status: 'service_unavailable',
      components: { database: { status: 'unhealthy' }, gemini: { status: 'healthy' } },
    });

    const req = {};
    const res = mockRes();
    await getHealthStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(alerting.checkAndAlert).toHaveBeenCalledTimes(1);
  });

  it('returns 503 when the health check itself throws', async () => {
    healthModel.getHealth.mockRejectedValue(new Error('boom'));

    const req = {};
    const res = mockRes();
    await getHealthStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'service_unavailable' })
    );
  });

  it('returns the alert list for the alerts endpoint', async () => {
    alerting.getAlerts.mockReturnValue([{ id: '1', component: 'database' }]);

    const req = { query: {} };
    const res = mockRes();
    await getHealthAlerts(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ alerts: [{ id: '1', component: 'database' }] });
  });
});
