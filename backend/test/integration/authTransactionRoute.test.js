import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';

const transactionService = vi.hoisted(() => ({
  getTransactions: vi.fn(),
  createTransaction: vi.fn(),
}));

const loginService = vi.hoisted(() => ({
  authenticateUser: vi.fn(),
}));

vi.mock('../../service/transaction.service.js', () => ({ default: transactionService }));
vi.mock('../../service/login.service.js', () => ({ ...loginService }));

// Bypass requireRole so we can test requireAuth + routing in isolation.
vi.mock('../../middleware/auth.js', async () => {
  const actual = await vi.importActual('../../middleware/auth.js');
  return { ...actual, requireRole: () => (req, res, next) => next() };
});

import { requireAuth } from '../../middleware/auth.js';

function makeApp() {
  const app = express();
  app.use(express.json());

  const loginRouter = express.Router();
  loginRouter.post('/login', async (req, res) => {
    const user = await loginService.authenticateUser(req.body.username, req.body.password);
    if (!user) return res.status(401).json({ error: 'Invalid' });
    const token = Buffer.from(`${user.username}:${user.role}`).toString('base64');
    res.json({ token, ...user });
  });
  app.use('/api', loginRouter);

  const router = express.Router();
  router.use(requireAuth);

  router.get('/transactions', async (req, res) => {
    res.json(await transactionService.getTransactions());
  });
  router.post('/transactions', async (req, res) => {
    const created = await transactionService.createTransaction(req.body);
    res.status(201).json(created);
  });
  app.use('/api', router);

  return app;
}

const devToken = (role = 'Admin') =>
  'Bearer ' + Buffer.from(`user:${role}`).toString('base64');

describe('POST /api/login', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns a token for valid credentials', async () => {
    loginService.authenticateUser.mockResolvedValue({ username: 'admin', role: 'Admin' });
    const res = await request(makeApp()).post('/api/login').send({ username: 'admin', password: 'admin' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.role).toBe('Admin');
  });

  it('returns 401 for invalid credentials', async () => {
    loginService.authenticateUser.mockResolvedValue(null);
    const res = await request(makeApp()).post('/api/login').send({ username: 'admin', password: 'bad' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/transactions (protected)', () => {
  it('returns 401 without a token', async () => {
    const res = await request(makeApp()).get('/api/transactions');
    expect(res.status).toBe(401);
  });

  it('returns the list when authenticated', async () => {
    transactionService.getTransactions.mockResolvedValue([{ id: 'TX-1' }]);
    const res = await request(makeApp()).get('/api/transactions').set('Authorization', devToken());
    expect(res.status).toBe(200);
    expect(res.body[0].id).toBe('TX-1');
  });
});

describe('POST /api/transactions (protected)', () => {
  it('creates a transaction when authenticated', async () => {
    transactionService.createTransaction.mockResolvedValue({ id: 'TX-9' });
    const res = await request(makeApp())
      .post('/api/transactions')
      .set('Authorization', devToken())
      .send({ item: 'Gown', amount: 2000 });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe('TX-9');
  });
});