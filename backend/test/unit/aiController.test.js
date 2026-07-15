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

  it('getAiInsights returns the operational status from the service', async () => {
    const payload = { status: 'success', message: 'operational', timestamp: 't' };
    aiService.getInsights.mockReturnValue(payload);
    const res = mockRes();

    await getAiInsights({}, res);

    expect(aiService.getInsights).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(payload);
  });

  it('postAiAssistant forwards the question to the service and echoes it', async () => {
    const answer = { status: 'success', answer: 'Placeholder: Your question "hi" has been received.' };
    aiService.postAssistant.mockReturnValue(answer);
    const res = mockRes();

    await postAiAssistant({ body: { question: 'hi' } }, res);

    expect(aiService.postAssistant).toHaveBeenCalledWith('hi');
    expect(res.json).toHaveBeenCalledWith(answer);
  });

  it('postAiAssistant passes along an empty/missing question', async () => {
    aiService.postAssistant.mockReturnValue({ status: 'success' });
    const res = mockRes();

    await postAiAssistant({ body: {} }, res);

    expect(aiService.postAssistant).toHaveBeenCalledWith(undefined);
  });
});
