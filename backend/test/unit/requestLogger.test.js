import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';

import { requestLogger, errorLogger, redactSensitive } from '../../middleware/requestLogger.js';

describe('requestLogger middleware', () => {
  let app;
  let logSpy;
  let errorSpy;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(requestLogger);

    app.get('/ok', (req, res) => res.status(200).json({ hello: 'world' }));
    app.post('/login', (req, res) => res.status(200).json({ token: 'abc' }));
    app.get('/fail', (req, res) => res.status(500).json({ error: 'boom' }));
    app.get('/throw', (req, res) => {
      throw new Error('unhandled failure');
    });

    app.use(errorLogger);

    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('attaches an X-Request-Id header and logs method/path/status', async () => {
    const res = await request(app).get('/ok');
    expect(res.headers['x-request-id']).toBeDefined();

    expect(logSpy).toHaveBeenCalled();
    const entry = JSON.parse(logSpy.mock.calls[0][0]);
    expect(entry.method).toBe('GET');
    expect(entry.path).toBe('/ok');
    expect(entry.status).toBe(200);
    expect(typeof entry.durationMs).toBe('number');
    expect(entry.requestId).toBeDefined();
  });

  it('redacts passwords and tokens from the logged request body', async () => {
    await request(app)
      .post('/login')
      .send({ username: 'john', password: 'secret123' });

    const entry = JSON.parse(logSpy.mock.calls[0][0]);
    expect(entry.body.username).toBe('john');
    expect(entry.body.password).toBe('[REDACTED]');
  });

  it('includes the request id and error details for server errors (500+)', async () => {
    const res = await request(app).get('/fail');
    expect(res.status).toBe(500);

    expect(errorSpy).toHaveBeenCalled();
    const entry = JSON.parse(errorSpy.mock.calls[0][0]);
    expect(entry.level).toBe('error');
    expect(entry.requestId).toBeDefined();
    expect(entry.error).toBeDefined();
    expect(entry.error.error).toBe('boom');
  });

  it('logs full error detail (message + stack) when a route throws', async () => {
    const res = await request(app).get('/throw');
    expect(res.status).toBe(500);
    expect(res.body.requestId).toBeDefined();

    expect(errorSpy).toHaveBeenCalled();
    const entry = JSON.parse(errorSpy.mock.calls[0][0]);
    expect(entry.error.message).toBe('unhandled failure');
    expect(entry.error.stack).toBeDefined();
    expect(entry.requestId).toBe(res.body.requestId);
  });
});

describe('redactSensitive', () => {
  it('redacts nested sensitive keys but keeps other fields', () => {
    const input = {
      user: 'john',
      password: 'hunter2',
      nested: { apiKey: 'sk-123', note: 'keep' },
    };
    const out = redactSensitive(input);
    expect(out.user).toBe('john');
    expect(out.password).toBe('[REDACTED]');
    expect(out.nested.apiKey).toBe('[REDACTED]');
    expect(out.nested.note).toBe('keep');
  });
});
