import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyToken, requireAuth, requireRole } from '../../middleware/auth.js';

describe('verifyToken', () => {
  it('decodes a dev token of the form base64("user:role")', () => {
    const token = Buffer.from('admin:Admin').toString('base64');
    const payload = verifyToken(token);
    expect(payload).toEqual({ username: 'admin', role: 'Admin' });
  });

  it('throws when the token has no role segment', () => {
    const token = Buffer.from('admin').toString('base64');
    expect(() => verifyToken(token)).toThrow(/Invalid dev token/i);
  });

  it('throws on a missing token', () => {
    expect(() => verifyToken()).toThrow(/Missing token/i);
  });
});

describe('requireAuth', () => {
  const next = vi.fn();
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

  it('returns 401 when the Authorization header is missing', () => {
    requireAuth({ headers: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when the scheme is not Bearer', () => {
    requireAuth({ headers: { authorization: 'Basic abc' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('attaches the payload to req.user and calls next on a valid token', () => {
    const token = Buffer.from('admin:Admin').toString('base64');
    const req = { headers: { authorization: `Bearer ${token}` } };
    requireAuth(req, res, next);
    expect(req.user).toEqual({ username: 'admin', role: 'Admin' });
    expect(next).toHaveBeenCalled();
  });
});

describe('requireRole', () => {
  let next;
  let res;

  beforeEach(() => {
    next = vi.fn();
    res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
  });

  it('allows a user whose role is in the allowed list', () => {
    const req = { user: { role: 'Admin' } };
    requireRole('Admin', 'Staff')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 403 when the role is not allowed', () => {
    const req = { user: { role: 'Customer' } };
    requireRole('Admin', 'Staff')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when there is no user', () => {
    requireRole('Admin')({}, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});