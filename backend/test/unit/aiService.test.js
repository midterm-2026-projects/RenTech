import { describe, it, expect } from 'vitest';
import { getInsights, postAssistant } from '../../service/aiService.js';

describe('AI Service', () => {
  describe('getInsights', () => {
    it('returns success status and operational message', () => {
      const result = getInsights();

      expect(result).toMatchObject({
        status: 'success',
        message: expect.stringMatching(/operational/),
      });
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.timestamp).toBe('string');
    });

    it('returns a fresh timestamp', () => {
      const before = Date.now();
      const result = getInsights();
      const after = Date.now();
      const ts = new Date(result.timestamp).getTime();
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after);
    });

    it('always returns the same shape', () => {
      const result = getInsights();
      expect(Object.keys(result).sort()).toEqual(['message', 'status', 'timestamp']);
    });
  });

  describe('postAssistant', () => {
    it('returns placeholder answer containing the question', () => {
      const result = postAssistant('What is the revenue trend?');

      expect(result).toMatchObject({
        status: 'success',
        answer: expect.stringContaining('What is the revenue trend?'),
      });
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.timestamp).toBe('string');
    });

    it('handles empty question string', () => {
      const result = postAssistant('');

      expect(result).toMatchObject({
        status: 'success',
        answer: expect.stringContaining(''),
      });
    });

    it('handles question with special characters', () => {
      const result = postAssistant('test!@#$%');

      expect(result.answer).toContain('test!@#$%');
    });

    it('handles question with numbers', () => {
      const result = postAssistant('Revenue was 12345.67');

      expect(result.answer).toContain('12345.67');
    });

    it('handles very long questions', () => {
      const long = 'a'.repeat(10000);
      const result = postAssistant(long);
      expect(result.answer).toContain(long);
    });

    it('handles unicode characters', () => {
      const result = postAssistant('¿Cómo estás? 你好');

      expect(result.answer).toContain('¿Cómo estás? 你好');
    });

    it('always returns the same shape', () => {
      const result = postAssistant('test');
      expect(Object.keys(result).sort()).toEqual(['answer', 'status', 'timestamp']);
    });
  });
});
