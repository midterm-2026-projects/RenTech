import { describe, test, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../App.js';
import * as loginService from '../../service/login.service.js';

// Note: keep the module path consistent with your codebase
vi.mock('../../service/login.service.js');

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Authentication API Behavioral Tests', () => {

  describe('Registration', () => {

    test('POST /register - should create a new user and return 201', async () => {
      vi.spyOn(loginService, 'registerUser').mockResolvedValue({ id: '123' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password',
          username: 'testuser'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    test('POST /register - should prevent duplicate registration and return 400', async () => {
      vi.spyOn(loginService, 'registerUser')
        .mockRejectedValue(new Error('User already exists'));

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password',
          username: 'testuser'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('POST /register - missing email returns 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          password: 'password',
          username: 'testuser'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('POST /register - invalid email format returns 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password',
          username: 'testuser'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('POST /register - missing password returns 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('POST /register - missing username returns 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('POST /register - empty or whitespace fields return 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: '   ',
          password: '',
          username: '   '
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('POST /register - short password returns 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
          username: 'testuser'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('POST /register - invalid username returns 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password',
          username: 'x'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

  });

  describe('Login', () => {

    test('POST /login - should return session for valid credentials', async () => {
      vi.spyOn(loginService, 'loginUser')
        .mockResolvedValue({ access_token: 'fake-token' });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password'
        });

      expect(response.status).toBe(200);
      expect(response.body.session).toBeDefined();
    });

    test('POST /login - missing email returns 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('POST /login - missing password returns 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('POST /login - invalid email format returns 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'not-an-email',
          password: 'password'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('POST /login - email with leading spaces returns 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: '  test@example.com',
          password: 'password'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('POST /login - wrong credentials return 401', async () => {
      vi.spyOn(loginService, 'loginUser')
        .mockRejectedValue(new Error('Invalid credentials'));

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('POST /login - non-existent user returns 401', async () => {
      vi.spyOn(loginService, 'loginUser')
        .mockRejectedValue(new Error('User not found'));

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nouser@example.com',
          password: 'password'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('POST /login - numeric email returns 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 12345,
          password: 'password'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('POST /login - service error returns 401', async () => {
      vi.spyOn(loginService, 'loginUser')
        .mockRejectedValue(new Error('Database connection failed'));

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

  });

});