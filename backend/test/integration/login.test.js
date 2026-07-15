import { test, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../../App.js';
import * as loginService from '../../service/login.service.js';

vi.mock('../service/login.service.js');

test('POST /register - should create a new user and return 201', async () => {
    vi.spyOn(loginService, 'registerUser').mockResolvedValue({ id: '123' });

    const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password', username: 'testuser' });

    expect(response.status).toBe(201); 
    expect(response.body.success).toBe(true);
});

test('POST /register - should prevent duplicate registration and return 400', async () => {
    vi.spyOn(loginService, 'registerUser').mockRejectedValue(new Error('User already exists'));

    const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password', username: 'testuser' });

    expect(response.status).toBe(400); 
    expect(response.body.success).toBe(false);
});

test('POST /login - should return session for valid credentials', async () => {

    vi.spyOn(loginService, 'loginUser').mockResolvedValue({ access_token: 'fake-token' });

    const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password' });

    expect(response.status).toBe(200); // Verification of status code requirement[cite: 1]
    expect(response.body.session).toBeDefined(); // Verification of session persistence[cite: 1]
});