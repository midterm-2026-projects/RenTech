import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerAiRoutes } from '../../route/aiRoutes.js';
import { resetRateLimit } from '../../middleware/aiSecurity.js';

vi.mock('../../service/geminiService.js', () => ({
  chatWithAi: vi.fn().mockResolvedValue({ reply: 'AI assistant response', source: 'ai' }),
  generateReport: vi.fn().mockResolvedValue({ report: 'AI generated insight for KPIs', source: 'ai' }),
}));

vi.mock('../../utils/promptBuilder.js', async () => {
  const actual = await vi.importActual('../../utils/promptBuilder.js');
  return {
    ...actual,
    buildKpiPrompt: vi.fn().mockReturnValue('Test KPI prompt'),
    buildAssistantPrompt: vi.fn().mockReturnValue('Test assistant prompt'),
    validatePrompt: vi.fn().mockReturnValue({ valid: true }),
  };
});

function createTestApp() {
  const app = express();
  app.use(express.json());
  const aiRouter = express.Router();
  registerAiRoutes(aiRouter);
  app.use('/api', aiRouter);
  return app;
}

describe('GET Request', () => {
  beforeEach(() => {
    resetRateLimit('::ffff:127.0.0.1');
  });

  it('/api/ai/insights - returns operational status with GET', async () => {
    const app = createTestApp();
    const result = await request(app).get('/api/ai/insights');
    expect(result.status).toEqual(200);
    expect(result.body).toMatchObject({
      status: 'success',
    });
    expect(result.body).toHaveProperty('timestamp');
  });

  it('/api/ai/assistant - returns 404 (no GET route)', async () => {
    const app = createTestApp();
    const result = await request(app).get('/api/ai/assistant');
    expect(result.status).toEqual(404);
  });

  it('/api/ai/nonexistent - returns 404 (unknown route)', async () => {
    const app = createTestApp();
    const result = await request(app).get('/api/ai/nonexistent');
    expect(result.status).toEqual(404);
  });
});

describe('POST Request', () => {
  beforeEach(() => {
    resetRateLimit('::ffff:127.0.0.1');
  });

  const endpoint = '/api/ai/assistant';

  it(`${endpoint} - creates response with question`, async () => {
    const app = createTestApp();
    const question = 'What is the revenue trend?';
    const result = await request(app).post(endpoint).send({ question });
    expect(result.status).toEqual(200);
    expect(result.body).toMatchObject({
      status: 'success',
      answer: expect.any(String),
    });
    expect(result.body).toHaveProperty('timestamp');
  });

  it(`${endpoint} - handles question with numbers`, async () => {
    const app = createTestApp();
    const question = 'Total revenue 12345.67 for 2026';
    const result = await request(app).post(endpoint).send({ question });
    expect(result.status).toEqual(200);
    expect(result.body.status).toEqual('success');
  });

  it(`${endpoint} - ignores extra fields in body`, async () => {
    const app = createTestApp();
    const question = 'test';
    const result = await request(app).post(endpoint).send({ question, extra: 'ignored' });
    expect(result.status).toEqual(200);
    expect(result.body.status).toEqual('success');
  });

  it(`${endpoint} - returns 400 when question is missing`, async () => {
    const app = createTestApp();
    const result = await request(app).post(endpoint).send({});
    expect(result.status).toEqual(400);
    expect(result.body).toMatchObject({
      error: expect.stringContaining('Missing required field'),
    });
  });

  it(`${endpoint} - returns 400 when question is empty string`, async () => {
    const app = createTestApp();
    const result = await request(app).post(endpoint).send({ question: '' });
    expect(result.status).toEqual(400);
    expect(result.body).toMatchObject({
      error: expect.stringContaining('Missing required field'),
    });
  });

  it(`${endpoint} - returns 400 when question has wrong type (number)`, async () => {
    const app = createTestApp();
    const result = await request(app).post(endpoint).send({ question: 123 });
    expect(result.status).toEqual(400);
    expect(result.body).toMatchObject({
      error: expect.stringContaining('must be of type string'),
    });
  });

  it(`${endpoint} - returns 400 when question is null`, async () => {
    const app = createTestApp();
    const result = await request(app).post(endpoint).send({ question: null });
    expect(result.status).toEqual(400);
    expect(result.body).toMatchObject({
      error: expect.stringContaining('Missing required field'),
    });
  });

  it(`${endpoint} - returns 400 for suspicious content with script tags`, async () => {
    const app = createTestApp();
    const result = await request(app).post(endpoint).send({
      question: '<script>alert("xss")</script>',
    });
    expect(result.status).toEqual(400);
    expect(result.body).toMatchObject({
      error: expect.stringContaining('Invalid input detected'),
    });
  });

  it(`${endpoint} - returns 400 for suspicious content with javascript:`, async () => {
    const app = createTestApp();
    const result = await request(app).post(endpoint).send({
      question: 'javascript:alert("xss")',
    });
    expect(result.status).toEqual(400);
    expect(result.body).toMatchObject({
      error: expect.stringContaining('Invalid input detected'),
    });
  });
});

describe('Rate Limiting', () => {
  it('blocks requests after 10 per minute', async () => {
    const app = createTestApp();
    resetRateLimit('::ffff:127.0.0.1');

    let lastResult;
    for (let i = 0; i < 11; i++) {
      lastResult = await request(app).post('/api/ai/assistant').send({
        question: `test ${i}`,
      });
    }

    expect(lastResult.status).toEqual(429);
    expect(lastResult.body).toMatchObject({
      error: expect.stringContaining('Too many requests'),
      code: 'RATE_LIMITED',
    });
  });
});

describe('POST /api/ai/insights', () => {
  beforeEach(() => {
    resetRateLimit('::ffff:127.0.0.1');
  });

  it('returns insights with KPIs', async () => {
    const app = createTestApp();
    const result = await request(app).post('/api/ai/insights').send({
      kpis: { revenue: 1000, rentals: 50 },
    });
    expect(result.status).toEqual(200);
    expect(result.body).toMatchObject({
      status: 'success',
      insights: expect.any(Array),
    });
    expect(result.body).toHaveProperty('prompt');
  });

  it('handles empty KPIs', async () => {
    const app = createTestApp();
    const result = await request(app).post('/api/ai/insights').send({});
    expect(result.status).toEqual(200);
    expect(result.body.status).toEqual('success');
  });
});
