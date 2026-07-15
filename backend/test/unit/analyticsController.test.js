import { describe, it, expect, vi, beforeEach } from 'vitest';

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

import {
  getAnalyticsSummaries,
  getAnalyticsForecasts,
  getAnalyticsKpis,
  getAnalyticsRevenueProjections,
} from '../../controller/analyticsController.js';

function mockRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

const HANDLERS = [
  ['/summaries', getAnalyticsSummaries, model.getAnalyticsSummaries],
  ['/forecasts', getAnalyticsForecasts, model.getForecasts],
  ['/kpis', getAnalyticsKpis, model.getKpiStorage],
  ['/revenue-projections', getAnalyticsRevenueProjections, model.getRevenueProjections],
];

describe('analytics controller (unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    HANDLERS.forEach(([, , fn]) => fn.mockResolvedValue({ data: [], error: null }));
  });

  it.each(HANDLERS)(
    '%s handler responds 200 with the model array',
    async (_label, handler, fn) => {
      fn.mockResolvedValue({ data: [{ id: 1 }], error: null });
      const res = mockRes();

      await handler({}, res);

      expect(fn).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
      expect(res.status).not.toHaveBeenCalledWith(500);
    }
  );

  it('returns an empty array when the model has no rows', async () => {
    model.getAnalyticsSummaries.mockResolvedValue({ data: null, error: null });
    const res = mockRes();

    await getAnalyticsSummaries({}, res);

    expect(res.json).toHaveBeenCalledWith([]);
  });

  it('responds 500 with an error body when the model fails', async () => {
    model.getAnalyticsSummaries.mockResolvedValue({
      data: null,
      error: new Error('db down'),
    });
    const res = mockRes();

    await getAnalyticsSummaries({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'db down' });
  });
});
