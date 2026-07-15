import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../App.js';
import { resetAllTemplates } from '../../service/SystemSetting.service.js';

describe('Settings / Template Management API (Integration)', () => {

  beforeEach(async () => {
    await resetAllTemplates();
  });

  // GET /api/settings/templates
  describe('GET /api/settings/templates', () => {
    it('should return all four template keys', async () => {
      const res = await request(app).get('/api/settings/templates');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('bookingConfirmation');
      expect(res.body).toHaveProperty('returnReminder');
      expect(res.body).toHaveProperty('overdueAlert');
      expect(res.body).toHaveProperty('paymentConfirmation');
    });

    it('should return default template values matching baseline', async () => {
      const res = await request(app).get('/api/settings/templates');
      expect(res.status).toBe(200);
      expect(res.body.bookingConfirmation).toContain('{customerName}');
      expect(res.body.overdueAlert).toContain('URGENT:');
      expect(res.body.paymentConfirmation).toContain('downpayment');
    });
  });

  // PUT /api/settings/templates/:key
  describe('PUT /api/settings/templates/:key', () => {
    it('should update a template and persist the new value', async () => {
      const newValue = 'Custom booking message for {customerName}';
      const res = await request(app)
        .put('/api/settings/templates/bookingConfirmation')
        .send({ value: newValue });

      expect(res.status).toBe(200);
      expect(res.body.bookingConfirmation).toBe(newValue);

      const verify = await request(app).get('/api/settings/templates');
      expect(verify.body.bookingConfirmation).toBe(newValue);
    });

    it('should return 400 when value is blank or empty', async () => {
      const res = await request(app)
        .put('/api/settings/templates/returnReminder')
        .send({ value: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('blank or empty');
    });

    it('should return 400 when key does not exist', async () => {
      const res = await request(app)
        .put('/api/settings/templates/nonExistentKey')
        .send({ value: 'some text' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Template not found');
    });
  });

  // POST /api/settings/templates/reset/:key
  describe('POST /api/settings/templates/reset/:key', () => {
    it('should reset a single modified template back to default', async () => {
      await request(app)
        .put('/api/settings/templates/overdueAlert')
        .send({ value: 'Modified overdue text' });

      const resetRes = await request(app).post('/api/settings/templates/reset/overdueAlert');
      expect(resetRes.status).toBe(200);
      expect(resetRes.body.overdueAlert).toContain('URGENT:');

      const verify = await request(app).get('/api/settings/templates');
      expect(verify.body.overdueAlert).toContain('URGENT:');
    });

    it('should return 400 when resetting a non-existent key', async () => {
      const res = await request(app).post('/api/settings/templates/reset/ghostKey');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Template not found');
    });
  });

  // POST /api/settings/templates/reset-all
  describe('POST /api/settings/templates/reset-all', () => {
    it('should reset all templates to defaults after modifications', async () => {
      await request(app)
        .put('/api/settings/templates/bookingConfirmation')
        .send({ value: 'Poisoned Booking' });
      await request(app)
        .put('/api/settings/templates/paymentConfirmation')
        .send({ value: 'Poisoned Payment' });

      const resetRes = await request(app).post('/api/settings/templates/reset-all');
      expect(resetRes.status).toBe(200);
      expect(resetRes.body.bookingConfirmation).toContain('{customerName}');
      expect(resetRes.body.paymentConfirmation).toContain('downpayment');

      const verify = await request(app).get('/api/settings/templates');
      expect(verify.body.bookingConfirmation).not.toBe('Poisoned Booking');
      expect(verify.body.paymentConfirmation).not.toBe('Poisoned Payment');
    });
  });
});
