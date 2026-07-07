import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../App.js';

describe('GET Request', () => {
  it('/api/ai/insights - returns operational status', async () => {
    const result = await request(app).get('/api/ai/insights');
    expect(result.status).toEqual(200);
    expect(result.body).toMatchObject({
      status: 'success',
      message: expect.stringMatching(/operational/),
    });
    expect(result.body).toHaveProperty('timestamp');
  });

  it('/api/ai/insights?foo=bar - ignores query parameters', async () => {
    const result = await request(app).get('/api/ai/insights?foo=bar');
    expect(result.status).toEqual(200);
    expect(result.body.status).toEqual('success');
  });

  it('/api/ai/assistant - returns 404 (no GET route)', async () => {
    const result = await request(app).get('/api/ai/assistant');
    expect(result.status).toEqual(404);
  });

  it('/api/ai/nonexistent - returns 404 (unknown route)', async () => {
    const result = await request(app).get('/api/ai/nonexistent');
    expect(result.status).toEqual(404);
  });
});

describe('POST Request', () => {
  const endpoint = '/api/ai/assistant';

  it(`${endpoint} - creates placeholder answer with question`, async () => {
    const question = 'What is the revenue trend?';
    const result = await request(app).post(endpoint).send({ question });
    expect(result.status).toEqual(200);
    expect(result.body).toMatchObject({
      status: 'success',
      answer: expect.stringContaining(question),
    });
    expect(result.body).toHaveProperty('timestamp');
  });

  it(`${endpoint} - handles very long question (10k chars)`, async () => {
    const question = 'a'.repeat(10000);
    const result = await request(app).post(endpoint).send({ question });
    expect(result.status).toEqual(200);
    expect(result.body.answer).toContain(question);
  });

  it(`${endpoint} - handles question with numbers`, async () => {
    const question = 'Total revenue 12345.67 for 2026';
    const result = await request(app).post(endpoint).send({ question });
    expect(result.status).toEqual(200);
    expect(result.body.answer).toContain('12345.67');
  });

  it(`${endpoint} - ignores extra fields in body`, async () => {
    const question = 'test';
    const result = await request(app).post(endpoint).send({ question, extra: 'ignored' });
    expect(result.status).toEqual(200);
    expect(result.body.status).toEqual('success');
  });

  it(`${endpoint} - returns 400 when question is missing`, async () => {
    const result = await request(app).post(endpoint).send({});
    expect(result.status).toEqual(400);
    expect(result.body).toMatchObject({
      error: expect.stringContaining('Missing required field'),
    });
  });

  it(`${endpoint} - returns 400 when question is empty string`, async () => {
    const result = await request(app).post(endpoint).send({ question: '' });
    expect(result.status).toEqual(400);
    expect(result.body).toMatchObject({
      error: expect.stringContaining('Missing required field'),
    });
  });

  it(`${endpoint} - returns 400 when question has wrong type (number)`, async () => {
    const result = await request(app).post(endpoint).send({ question: 123 });
    expect(result.status).toEqual(400);
    expect(result.body).toMatchObject({
      error: expect.stringContaining('must be of type string'),
    });
  });

  it(`${endpoint} - returns 400 when question is null`, async () => {
    const result = await request(app).post(endpoint).send({ question: null });
    expect(result.status).toEqual(400);
    expect(result.body).toMatchObject({
      error: expect.stringContaining('Missing required field'),
    });
  });

  it('/api/ai/insights - returns 404 (no POST route)', async () => {
    const result = await request(app).post('/api/ai/insights');
    expect(result.status).toEqual(404);
  });
});
