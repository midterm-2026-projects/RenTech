import { describe, it, expect, vi } from 'vitest';
import { getAiInsights, postAiAssistant } from '../../route/aiRoutes.js';

function makeMockReqRes(overrides = {}) {
  const req = { body: overrides.body || {} };
  const res = {
    json: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
  };
  return { req, res };
}

describe('AI Express Routes', () => {
  describe('GET /api/ai/insights', () => {
    it('responds with a success status and standard JSON', async () => {
      const { req, res } = makeMockReqRes();
      await getAiInsights(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: expect.stringMatching(/operational/),
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe('POST /api/ai/assistant', () => {
    it('responds with a placeholder answer when a question is provided', async () => {
      const { req, res } = makeMockReqRes({ body: { question: 'What is the revenue trend?' } });
      await postAiAssistant(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          answer: expect.stringContaining('What is the revenue trend?'),
          timestamp: expect.any(String),
        })
      );
    });
  });
});
