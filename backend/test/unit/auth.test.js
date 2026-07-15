import { describe, it, expect, vi, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { verifyToken, requireAuth } from '../../middleware/auth.js';

function mockRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe('verifyToken', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('verifies a real JWT when JWT_SECRET is set', () => {
    vi.stubEnv('JWT_SECRET', 'secret');
    const token = jwt.sign({ role: 'Admin', username: 'a' }, 'secret');
    expect(verifyToken(token)).toMatchObject({ role: 'Admin' });
  });

  it('throws on a tampered/invalid JWT', () => {
    vi.stubEnv('JWT_SECRET', 'secret');
    expect(() => verifyToken('not.a.jwt')).toThrow();
  });

  it('accepts the frontend base64 dev token when no JWT_SECRET is set', () => {
    vi.stubEnv('JWT_SECRET', '');
    const token = Buffer.from('admin:Admin:123').toString('base64');
    expect(verifyToken(token)).toMatchObject({ role: 'Admin' });
  });

  it('throws on a malformed dev token', () => {
    vi.stubEnv('JWT_SECRET', '');
    expect(() => verifyToken('???')).toThrow();
  });
});

describe('requireAuth middleware', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('returns 401 when the Authorization header is missing', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 on an invalid token', () => {
    vi.stubEnv('JWT_SECRET', 'secret');
    const req = { headers: { authorization: 'Bearer bad.token' } };
    const res = mockRes();
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next and sets req.user on a valid token', () => {
    vi.stubEnv('JWT_SECRET', 'secret');
    const token = jwt.sign({ role: 'Admin' }, 'secret');
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ role: 'Admin' });
  });
});
