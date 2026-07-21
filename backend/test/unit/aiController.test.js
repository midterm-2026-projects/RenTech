import { describe, it, expect, vi, beforeEach } from 'vitest';

const aiService = vi.hoisted(() => ({
  getInsights: vi.fn(),
  postAssistant: vi.fn(),
}));

vi.mock('../../service/aiService.js', () => ({
  __esModule: true,
  ...aiService,
  default: aiService,
}));

import { getAiInsights, postAiAssistant } from '../../controller/aiController.js';

function mockRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe('AI controller (unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAiInsights returns the result from the service with kpis', async () => {
    const payload = { status: 'success', insights: ['insight1'], timestamp: 't' };
    aiService.getInsights.mockResolvedValue(payload);
    const res = mockRes();

    await getAiInsights({ body: { kpis: { revenue: 1000 } } }, res);

    expect(aiService.getInsights).toHaveBeenCalledWith({ revenue: 1000 });
    expect(res.json).toHaveBeenCalledWith(payload);
  });

  it('getAiInsights handles empty body', async () => {
    const payload = { status: 'success', insights: [] };
    aiService.getInsights.mockResolvedValue(payload);
    const res = mockRes();

    await getAiInsights({ body: {} }, res);

    expect(aiService.getInsights).toHaveBeenCalledWith({});
    expect(res.json).toHaveBeenCalledWith(payload);
  });

  it('getAiInsights handles service errors', async () => {
    aiService.getInsights.mockRejectedValue(new Error('Service error'));
    const res = mockRes();

    await getAiInsights({ body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error' })
    );
  });

  it('postAiAssistant forwards the question and context to the service', async () => {
    const answer = { status: 'success', answer: 'AI response' };
    aiService.postAssistant.mockResolvedValue(answer);
    const res = mockRes();

    await postAiAssistant({ body: { question: 'hi', context: { revenue: 1000 } } }, res);

    expect(aiService.postAssistant).toHaveBeenCalledWith('hi', { revenue: 1000 });
    expect(res.json).toHaveBeenCalledWith(answer);
  });

  it('postAiAssistant handles missing context', async () => {
    const answer = { status: 'success', answer: 'AI response' };
    aiService.postAssistant.mockResolvedValue(answer);
    const res = mockRes();

    await postAiAssistant({ body: { question: 'test' } }, res);

    expect(aiService.postAssistant).toHaveBeenCalledWith('test', {});
    expect(res.json).toHaveBeenCalledWith(answer);
  });

  it('postAiAssistant handles service errors', async () => {
    aiService.postAssistant.mockRejectedValue(new Error('Service error'));
    const res = mockRes();

    await postAiAssistant({ body: { question: 'test' } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error' })
    );
  });
});
