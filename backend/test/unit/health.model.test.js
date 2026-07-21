import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../config/database.js', () => ({
  testConnection: vi.fn(),
}));

vi.mock('../../config/env.js', () => ({
  env: { GEMINI_API_KEY: 'test-key' },
}));

import { testConnection } from '../../config/database.js';
import { env } from '../../config/env.js';
import { checkDatabase, checkGemini, getHealth } from '../../model/health.model.js';

describe('health model', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    env.GEMINI_API_KEY = 'test-key';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkDatabase', () => {
    it('reports healthy when the connection succeeds', async () => {
      testConnection.mockResolvedValue({ ok: true, message: 'connected' });
      const result = await checkDatabase();
      expect(result.status).toBe('healthy');
    });

    it('reports unhealthy when the connection fails', async () => {
      testConnection.mockResolvedValue({ ok: false, message: 'tables missing' });
      const result = await checkDatabase();
      expect(result.status).toBe('unhealthy');
    });

    it('reports unhealthy when testConnection throws', async () => {
      testConnection.mockRejectedValue(new Error('db down'));
      const result = await checkDatabase();
      expect(result.status).toBe('unhealthy');
      expect(result.message).toContain('db down');
    });
  });

  describe('checkGemini', () => {
    it('reports unhealthy when the API key is missing', async () => {
      env.GEMINI_API_KEY = '';
      const result = await checkGemini();
      expect(result.status).toBe('unhealthy');
      expect(result.message).toMatch(/not configured/i);
    });

    it('reports healthy when the API responds ok', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
      const result = await checkGemini();
      expect(result.status).toBe('healthy');
    });

    it('reports unhealthy when the API responds with an error status', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });
      const result = await checkGemini();
      expect(result.status).toBe('unhealthy');
      expect(result.message).toContain('500');
    });

    it('reports unhealthy when the request times out / fails', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('network down'));
      const result = await checkGemini();
      expect(result.status).toBe('unhealthy');
      expect(result.message).toContain('network down');
    });
  });

  describe('getHealth', () => {
    it('returns ok when both components are healthy', async () => {
      testConnection.mockResolvedValue({ ok: true, message: 'connected' });
      global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });

      const health = await getHealth();
      expect(health.status).toBe('ok');
      expect(health.components.database.status).toBe('healthy');
      expect(health.components.gemini.status).toBe('healthy');
      expect(health.timestamp).toBeDefined();
    });

    it('returns service_unavailable when a component is down', async () => {
      testConnection.mockResolvedValue({ ok: false, message: 'down' });
      global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });

      const health = await getHealth();
      expect(health.status).toBe('service_unavailable');
      expect(health.components.database.status).toBe('unhealthy');
    });
  });
});
