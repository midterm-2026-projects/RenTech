import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../../App.js';

const AUTH_TOKEN = Buffer.from('admin:Admin:1740000000000').toString('base64');
const auth = { Authorization: `Bearer ${AUTH_TOKEN}` };

const DEFAULTS = {
  bookingConfirmation: "Hi {customerName}, your booking for {itemName} on {rentalDate} is confirmed! Show this QR when you pick up your item: {qrCode}. Thank you for choosing RENTECH.",
  returnReminder: "Hi {customerName}, this is a friendly reminder to return your rented item '{itemName}' by {returnDate}. Late returns are subject to penalties. - RENTECH",
  overdueAlert: "URGENT: {customerName}, your rental for '{itemName}' is overdue. Please return it immediately to avoid additional charges. - RENTECH",
  paymentConfirmation: "Hi {customerName}, we received your downpayment of ₱{downpaymentAmount} for '{itemName}'. Remaining balance ₱{balanceAmount} is due at pickup. - RENTECH",
};

function buildSupabase() {
  let prefix = '';
  const q = {
    from: () => q,
    select: () => q,
    ilike: (_col, val) => { prefix = val.replace('%', ''); return q; },
    upsert: async ({ key, value }) => { DEFAULTS[key] = value; return { error: null }; },
    order: () => q,
    range: () => q,
    then: (fn) => {
      const entries = Object.entries(DEFAULTS)
        .filter(([k]) => k.startsWith(prefix))
        .map(([key, value]) => ({ key, value }));
      return Promise.resolve({ data: entries, error: null }).then(fn);
    },
  };
  return q;
}

vi.mock('../../config/supabaseClient.js', () => ({
  getSupabase: () => buildSupabase(),
}));

describe('Settings / Template Management API (Integration)', () => {
  describe('GET /api/settings/templates', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app).get('/api/settings/templates');
      expect(res.status).toBe(401);
    });

    it('should return all four template keys with auth', async () => {
      const res = await request(app).get('/api/settings/templates').set(auth);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('bookingConfirmation');
      expect(res.body).toHaveProperty('returnReminder');
      expect(res.body).toHaveProperty('overdueAlert');
      expect(res.body).toHaveProperty('paymentConfirmation');
    });

    it('should return default template values matching baseline', async () => {
      const res = await request(app).get('/api/settings/templates').set(auth);
      expect(res.status).toBe(200);
      expect(res.body.bookingConfirmation).toContain('{customerName}');
      expect(res.body.overdueAlert).toContain('URGENT:');
      expect(res.body.paymentConfirmation).toContain('downpayment');
    });
  });

  describe('PUT /api/settings/templates/:key', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .put('/api/settings/templates/bookingConfirmation')
        .send({ value: 'test' });
      expect(res.status).toBe(401);
    });

    it('should update a template and persist the new value', async () => {
      const newValue = 'Custom booking message for {customerName}';
      const res = await request(app)
        .put('/api/settings/templates/bookingConfirmation')
        .set(auth)
        .send({ value: newValue });
      expect(res.status).toBe(200);
      expect(res.body.bookingConfirmation).toBe(newValue);
    });

    it('should return 400 when value is blank or empty', async () => {
      const res = await request(app)
        .put('/api/settings/templates/returnReminder')
        .set(auth)
        .send({ value: '   ' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('blank or empty');
    });

    it('should return 400 when key does not exist', async () => {
      const res = await request(app)
        .put('/api/settings/templates/nonExistentKey')
        .set(auth)
        .send({ value: 'some text' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Template not found');
    });
  });

  describe('POST /api/settings/templates/reset/:key', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app).post('/api/settings/templates/reset/overdueAlert');
      expect(res.status).toBe(401);
    });

    it('should reset a single modified template back to default', async () => {
      const resetRes = await request(app).post('/api/settings/templates/reset/overdueAlert').set(auth);
      expect(resetRes.status).toBe(200);
      expect(resetRes.body.overdueAlert).toContain('URGENT:');
    });

    it('should return 400 when resetting a non-existent key', async () => {
      const res = await request(app).post('/api/settings/templates/reset/ghostKey').set(auth);
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Template not found');
    });
  });

  describe('POST /api/settings/templates/reset-all', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app).post('/api/settings/templates/reset-all');
      expect(res.status).toBe(401);
    });

    it('should reset all templates to defaults after modifications', async () => {
      const resetRes = await request(app).post('/api/settings/templates/reset-all').set(auth);
      expect(resetRes.status).toBe(200);
      expect(resetRes.body.bookingConfirmation).toContain('{customerName}');
      expect(resetRes.body.paymentConfirmation).toContain('downpayment');
    });
  });
});