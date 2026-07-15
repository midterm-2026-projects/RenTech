import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

// Mock the analytics model so no Supabase connection is needed. The route
// imports the model as a default export and calls its named functions.
const model = vi.hoisted(() => ({
  getAnalyticsSummaries: vi.fn(),
  getForecasts: vi.fn(),
  getKpiStorage: vi.fn(),
  getRevenueProjections: vi.fn(),
}));

vi.mock('../../model/analytics.model.js', () => ({
  __esModule: true,
  ...model,
  default: model,
}));

import { registerAnalyticsRoutes } from '../../route/analyticsRoute.js';

const JWT_SECRET = 'test-secret';

function makeApp() {
  const app = express();
  const router = express.Router();
  registerAnalyticsRoutes(router);
  app.use('/api/analytics', router);
  return app;
}

const validToken = () => 'Bearer ' + jwt.sign({ role: 'Admin' }, JWT_SECRET);

const ROUTES = [
  ['/api/analytics/summaries', model.getAnalyticsSummaries],
  ['/api/analytics/forecasts', model.getForecasts],
  ['/api/analytics/kpis', model.getKpiStorage],
  ['/api/analytics/revenue-projections', model.getRevenueProjections],
];

describe('analytics routes (behavioral, authenticated)', () => {
  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', JWT_SECRET);
    vi.clearAllMocks();
    ROUTES.forEach(([, fn]) => fn.mockResolvedValue({ data: [], error: null }));
  });

  afterEach(() => vi.unstubAllEnvs());

  it('rejects requests without an Authorization header (401)', async () => {
    const res = await request(makeApp()).get('/api/analytics/summaries');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it.each(ROUTES)(
    'GET %s returns 200 with the model array when authenticated',
    async (path, fn) => {
      fn.mockResolvedValue({ data: [{ id: 1 }], error: null });

      const res = await request(makeApp()).get(path).set('Authorization', validToken());

      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id: 1 }]);
      expect(fn).toHaveBeenCalled();
    }
  );

  it('returns an empty array when the model has no rows', async () => {
    model.getAnalyticsSummaries.mockResolvedValue({ data: null, error: null });

    const res = await request(makeApp())
      .get('/api/analytics/summaries')
      .set('Authorization', validToken());

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('responds with 500 and an error body when the model fails', async () => {
    model.getAnalyticsSummaries.mockResolvedValue({
      data: null,
      error: new Error('db down'),
    });

    const res = await request(makeApp())
      .get('/api/analytics/summaries')
      .set('Authorization', validToken());

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('maps each endpoint to its own model function (no cross-wiring)', async () => {
    for (const [path, fn] of ROUTES) {
      vi.clearAllMocks();
      ROUTES.forEach(([, other]) => other.mockResolvedValue({ data: [], error: null }));

      await request(makeApp()).get(path).set('Authorization', validToken());

      expect(fn).toHaveBeenCalledTimes(1);
    }
  });
});
