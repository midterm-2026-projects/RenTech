import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  raiseAlert,
  checkAndAlert,
  getAlerts,
  clearAlerts,
} from '../../service/alertingService.js';

describe('alertingService', () => {
  beforeEach(() => {
    clearAlerts();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('raises an alert with an id, timestamp, and component', () => {
    const alert = raiseAlert({ component: 'database', message: 'down' });
    expect(alert.id).toBeDefined();
    expect(alert.timestamp).toBeDefined();
    expect(alert.component).toBe('database');
    expect(alert.severity).toBe('critical');
  });

  it('stores alerts and returns the most recent first', () => {
    raiseAlert({ component: 'database', message: 'a' });
    raiseAlert({ component: 'gemini', message: 'b' });

    const alerts = getAlerts();
    expect(alerts).toHaveLength(2);
    expect(alerts[0].component).toBe('gemini');
  });

  it('raises an alert for every unhealthy component in a health result', () => {
    const health = {
      status: 'service_unavailable',
      components: {
        database: { status: 'unhealthy', message: 'down' },
        gemini: { status: 'healthy', message: 'ok' },
      },
    };

    const unhealthy = checkAndAlert(health);
    expect(unhealthy).toHaveLength(1);
    expect(unhealthy[0][0]).toBe('database');

    const alerts = getAlerts();
    expect(alerts).toHaveLength(1);
    expect(alerts[0].component).toBe('database');
  });

  it('does not raise alerts when all components are healthy', () => {
    const health = {
      status: 'ok',
      components: {
        database: { status: 'healthy', message: 'ok' },
        gemini: { status: 'healthy', message: 'ok' },
      },
    };

    const unhealthy = checkAndAlert(health);
    expect(unhealthy).toHaveLength(0);
    expect(getAlerts()).toHaveLength(0);
  });
});
