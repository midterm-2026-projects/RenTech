import { describe, it, expect, vi } from 'vitest';
import { validateRequest } from '../../middleware/requestValidator.js';

function makeMockReqRes(body) {
  const req = { body };
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  const next = vi.fn();
  return { req, res, next };
}

describe('Request Validator Middleware', () => {
  describe('required field validation', () => {
    const rules = [{ name: 'question', type: 'string', required: true }];

    it('returns 400 when a required field is missing', () => {
      const { req, res, next } = makeMockReqRes({});

      validateRequest(rules)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/question/),
          code: 'MISSING_FIELD',
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 400 when a required field is null', () => {
      const { req, res, next } = makeMockReqRes({ question: null });

      validateRequest(rules)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'MISSING_FIELD' })
      );
    });

    it('returns 400 when a required field is an empty string', () => {
      const { req, res, next } = makeMockReqRes({ question: '' });

      validateRequest(rules)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'MISSING_FIELD' })
      );
    });
  });

  describe('type validation', () => {
    it('returns 400 when a field has the wrong type (string vs number)', () => {
      const rules = [{ name: 'amount', type: 'number', required: true }];
      const { req, res, next } = makeMockReqRes({ amount: 'not-a-number' });

      validateRequest(rules)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/must be of type number/),
          code: 'WRONG_TYPE',
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 400 when a boolean field gets a string', () => {
      const rules = [{ name: 'active', type: 'boolean', required: true }];
      const { req, res, next } = makeMockReqRes({ active: 'yes' });

      validateRequest(rules)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'WRONG_TYPE' })
      );
    });

    it('returns 400 when an array field gets a string', () => {
      const rules = [{ name: 'tags', type: 'array', required: true }];
      const { req, res, next } = makeMockReqRes({ tags: 'not-an-array' });

      validateRequest(rules)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'WRONG_TYPE' })
      );
    });

    it('accepts a valid number', () => {
      const rules = [{ name: 'amount', type: 'number', required: true }];
      const { req, res, next } = makeMockReqRes({ amount: 42 });

      validateRequest(rules)(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('accepts a valid boolean', () => {
      const rules = [{ name: 'active', type: 'boolean', required: true }];
      const { req, res, next } = makeMockReqRes({ active: false });

      validateRequest(rules)(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('accepts a valid array', () => {
      const rules = [{ name: 'tags', type: 'array', required: true }];
      const { req, res, next } = makeMockReqRes({ tags: ['a', 'b'] });

      validateRequest(rules)(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('valid request passes through', () => {
    it('does not modify the request and calls next for valid data', () => {
      const rules = [
        { name: 'question', type: 'string', required: true },
        { name: 'amount', type: 'number', required: false },
      ];
      const { req, res, next } = makeMockReqRes({ question: 'hello', amount: 100 });

      validateRequest(rules)(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.body).toEqual({ question: 'hello', amount: 100 });
    });

    it('allows optional fields to be absent', () => {
      const rules = [
        { name: 'question', type: 'string', required: true },
        { name: 'tags', type: 'array', required: false },
      ];
      const { req, res, next } = makeMockReqRes({ question: 'hello' });

      validateRequest(rules)(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('multiple field rules', () => {
    it('returns 400 on the first field that fails', () => {
      const rules = [
        { name: 'name', type: 'string', required: true },
        { name: 'age', type: 'number', required: true },
      ];
      const { req, res, next } = makeMockReqRes({ name: 'Alice' });

      validateRequest(rules)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ field: 'age' })
      );
    });
  });
});
