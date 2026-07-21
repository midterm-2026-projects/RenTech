import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getInsights, postAssistant } from '../../service/aiService.js';

vi.mock('../../service/geminiService.js', () => ({
  chatWithAi: vi.fn().mockResolvedValue({ reply: 'AI generated response', source: 'ai' }),
  generateReport: vi.fn().mockResolvedValue({ report: 'AI generated insight', source: 'ai' }),
}));

describe('AI Service', () => {
  describe('getInsights', () => {
    it('returns success status with insights array', async () => {
      const result = await getInsights({ revenue: 1000 });

      expect(result).toMatchObject({
        status: 'success',
        insights: expect.any(Array),
      });
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('prompt');
    });

    it('returns a fresh timestamp', async () => {
      const before = Date.now();
      const result = await getInsights({});
      const after = Date.now();
      const ts = new Date(result.timestamp).getTime();
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after);
    });

    it('handles empty KPIs object', async () => {
      const result = await getInsights({});
      expect(result.status).toBe('success');
      expect(result.insights).toBeDefined();
    });

    it('handles KPIs with zero values', async () => {
      const result = await getInsights({ revenue: 0, rentals: 0 });
      expect(result.status).toBe('success');
    });

    it('handles KPIs with missing values', async () => {
      const result = await getInsights({ revenue: undefined, rentals: null });
      expect(result.status).toBe('success');
    });
  });

  describe('postAssistant', () => {
    it('returns success status with answer', async () => {
      const result = await postAssistant('What is the revenue trend?');

      expect(result).toMatchObject({
        status: 'success',
        answer: expect.any(String),
      });
      expect(result).toHaveProperty('timestamp');
    });

    it('handles empty question string', async () => {
      const result = await postAssistant('');
      expect(result.status).toBe('success');
    });

    it('handles question with special characters', async () => {
      const result = await postAssistant('test!@#$%');
      expect(result.status).toBe('success');
    });

    it('handles question with numbers', async () => {
      const result = await postAssistant('Revenue was 12345.67');
      expect(result.status).toBe('success');
    });

    it('handles very long questions', async () => {
      const long = 'a'.repeat(1000);
      const result = await postAssistant(long);
      expect(result.status).toBe('success');
    });

    it('handles unicode characters', async () => {
      const result = await postAssistant('¿Cómo estás? 你好');
      expect(result.status).toBe('success');
    });

    it('accepts context parameter', async () => {
      const result = await postAssistant('test', { revenue: 1000 });
      expect(result.status).toBe('success');
    });
  });
});
