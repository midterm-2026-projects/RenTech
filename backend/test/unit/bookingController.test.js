import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock the booking service before importing routes
const mockBookingService = vi.hoisted(() => ({
  getBookings: vi.fn(),
  createBooking: vi.fn(),
}));

vi.mock('../../service/booking.service.js', () => ({
  __esModule: true,
  default: mockBookingService,
}));

import { getBookings, createBooking } from '../../controller/bookingController.js';

// Create a test Express app
const app = express();
app.use(express.json());
app.get('/api/bookings', getBookings);
app.post('/api/bookings', createBooking);

function mockRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => {
    if (res.status.mock.calls.length === 0) {
      res.status(200);
    }
    return res;
  });
  return res;
}

describe('Booking Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============ UNIT TESTS (Direct Function Calls) ============
  describe('Unit Tests - Direct Controller Functions', () => {
    describe('getBookings', () => {
      it('should return 200 and success status with bookings data list', async () => {
        const payload = {
          data: [{ id: 'BK-123456', item_name: 'Emerald Silk Evening Gown' }],
          error: null
        };
        mockBookingService.getBookings.mockResolvedValue(payload);
        const res = mockRes();

        await getBookings({}, res);

        expect(mockBookingService.getBookings.mock.calls.length).toBe(1);
        expect(res.status.mock.calls[0][0]).toBe(200);
        expect(res.json.mock.calls[0][0]).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Bookings retrieved successfully',
            count: 1,
            data: payload.data
          })
        );
      });

      it('should return 400 when service layer returns a query error', async () => {
        const payload = {
          data: null,
          error: new Error('Database query failed')
        };
        mockBookingService.getBookings.mockResolvedValue(payload);
        const res = mockRes();

        await getBookings({}, res);

        expect(mockBookingService.getBookings.mock.calls.length).toBe(1);
        expect(res.status.mock.calls[0][0]).toBe(400);
        expect(res.json.mock.calls[0][0]).toEqual({
          status: 'error',
          message: 'Database query failed'
        });
      });

      it('should handle empty data array', async () => {
        mockBookingService.getBookings.mockResolvedValue({
          data: [],
          error: null
        });
        const res = mockRes();

        await getBookings({}, res);

        expect(res.json.mock.calls[0][0]).toEqual(
          expect.objectContaining({
            status: 'success',
            count: 0,
            data: []
          })
        );
      });

      it('should include timestamp in response', async () => {
        mockBookingService.getBookings.mockResolvedValue({
          data: [],
          error: null
        });
        const res = mockRes();

        await getBookings({}, res);

        const callArgs = res.json.mock.calls[0][0];
        expect(callArgs.timestamp).toBeDefined();
        expect(typeof callArgs.timestamp).toBe('string');
      });
    });

    describe('createBooking', () => {
      const validBody = {
        item_name: 'Emerald Silk Evening Gown',
        total_price: 4500,
        booking_type: 'Me',
        full_name: 'Bob',
        phone_number: '09998887777',
        rental_date: '2026-07-15',
        size_selected: 'Small (S)',
        payment_method: 'GCash'
      };

      it('should return successful creation payload structure', async () => {
        const payload = {
          data: [validBody],
          error: null
        };
        mockBookingService.createBooking.mockResolvedValue(payload);
        const res = mockRes();

        await createBooking({ body: validBody }, res);

        expect(mockBookingService.createBooking.mock.calls[0][0]).toBe(validBody);
        expect(res.status.mock.calls[0][0]).toBe(200);
        expect(res.json.mock.calls[0][0]).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Booking created successfully',
            data: validBody
          })
        );
      });

      it('should return 400 status if service layer returns a custom database/collision error', async () => {
        const payload = {
          data: null,
          error: new Error('The gown is already reserved for this date.')
        };
        mockBookingService.createBooking.mockResolvedValue(payload);
        const res = mockRes();

        await createBooking({ body: validBody }, res);

        expect(mockBookingService.createBooking.mock.calls[0][0]).toBe(validBody);
        expect(res.status.mock.calls[0][0]).toBe(400);
        expect(res.json.mock.calls[0][0]).toEqual({
          status: 'error',
          message: 'The gown is already reserved for this date.'
        });
      });

      it('should catch validation throws safely in the catch block', async () => {
        mockBookingService.createBooking.mockRejectedValue(new Error('Invalid phone number'));
        const res = mockRes();

        await createBooking({ body: validBody }, res);

        expect(mockBookingService.createBooking.mock.calls[0][0]).toBe(validBody);
        expect(res.status.mock.calls[0][0]).toBe(400);
        expect(res.json.mock.calls[0][0]).toEqual({
          status: 'error',
          message: 'Invalid phone number'
        });
      });

      it('should extract first item from data array', async () => {
        const payload = {
          data: [validBody, { id: 'BK-999' }],
          error: null
        };
        mockBookingService.createBooking.mockResolvedValue(payload);
        const res = mockRes();

        await createBooking({ body: validBody }, res);

        const callArgs = res.json.mock.calls[0][0];
        expect(callArgs.data).toEqual(validBody);
      });

      it('should return null data when service returns empty array', async () => {
        const payload = {
          data: [],
          error: null
        };
        mockBookingService.createBooking.mockResolvedValue(payload);
        const res = mockRes();

        await createBooking({ body: validBody }, res);

        const callArgs = res.json.mock.calls[0][0];
        expect(callArgs.data).toBeNull();
      });

      it('should include timestamp in success response', async () => {
        mockBookingService.createBooking.mockResolvedValue({
          data: [validBody],
          error: null
        });
        const res = mockRes();

        await createBooking({ body: validBody }, res);

        const callArgs = res.json.mock.calls[0][0];
        expect(callArgs.timestamp).toBeDefined();
        expect(typeof callArgs.timestamp).toBe('string');
      });
    });
  });

  // ============ INTEGRATION TESTS (HTTP Endpoint Tests) ============
  describe('Integration Tests - HTTP Endpoints', () => {
    describe('GET /api/bookings', () => {
      it('should return 200 with bookings data when successful', async () => {
        const mockData = [
          { id: 'BK-123456', item_name: 'Emerald Silk Evening Gown' },
          { id: 'BK-789012', item_name: 'Crystal Beaded Dress' }
        ];

        mockBookingService.getBookings.mockResolvedValue({
          data: mockData,
          error: null
        });

        const response = await request(app)
          .get('/api/bookings')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Bookings retrieved successfully',
            count: 2,
            data: mockData
          })
        );
        expect(response.body.timestamp).toBeDefined();
      });

      it('should return 200 with empty data when no bookings exist', async () => {
        mockBookingService.getBookings.mockResolvedValue({
          data: [],
          error: null
        });

        const response = await request(app)
          .get('/api/bookings')
          .expect(200);

        expect(response.body).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Bookings retrieved successfully',
            count: 0,
            data: []
          })
        );
      });

      it('should return 400 when database query fails', async () => {
        mockBookingService.getBookings.mockResolvedValue({
          data: null,
          error: new Error('Database query failed')
        });

        const response = await request(app)
          .get('/api/bookings')
          .expect(400);

        expect(response.body).toEqual({
          status: 'error',
          message: 'Database query failed'
        });
      });

      it('should return 400 when connection timeout occurs', async () => {
        mockBookingService.getBookings.mockResolvedValue({
          data: null,
          error: new Error('Connection timeout')
        });

        const response = await request(app)
          .get('/api/bookings')
          .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Connection timeout');
      });

      it('should have correct content-type header', async () => {
        mockBookingService.getBookings.mockResolvedValue({
          data: [],
          error: null
        });

        await request(app)
          .get('/api/bookings')
          .expect('Content-Type', /json/);
      });
    });

    describe('POST /api/bookings', () => {
      const validPayload = {
        item_name: 'Emerald Silk Evening Gown',
        total_price: 4500,
        booking_type: 'Me',
        full_name: 'Bob',
        phone_number: '09998887777',
        rental_date: '2026-07-15',
        size_selected: 'Small (S)',
        payment_method: 'GCash'
      };

      it('should return 200 when booking is created successfully', async () => {
        mockBookingService.createBooking.mockResolvedValue({
          data: [validPayload],
          error: null
        });

        const response = await request(app)
          .post('/api/bookings')
          .send(validPayload)
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Booking created successfully',
            data: validPayload
          })
        );
        expect(response.body.timestamp).toBeDefined();
        expect(mockBookingService.createBooking).toHaveBeenCalledWith(validPayload);
      });

      it('should return 400 when item is already reserved for the date', async () => {
        mockBookingService.createBooking.mockResolvedValue({
          data: null,
          error: new Error('The gown is already reserved for this date.')
        });

        const response = await request(app)
          .post('/api/bookings')
          .send(validPayload)
          .expect(400);

        expect(response.body).toEqual({
          status: 'error',
          message: 'The gown is already reserved for this date.'
        });
      });

      it('should return 400 when item does not exist', async () => {
        mockBookingService.createBooking.mockResolvedValue({
          data: null,
          error: new Error('Item not found')
        });

        const response = await request(app)
          .post('/api/bookings')
          .send(validPayload)
          .expect(400);

        expect(response.body).toEqual({
          status: 'error',
          message: 'Item not found'
        });
      });

      it('should return 400 when validation throws an error', async () => {
        mockBookingService.createBooking.mockRejectedValue(
          new Error('Invalid phone number format')
        );

        const response = await request(app)
          .post('/api/bookings')
          .send(validPayload)
          .expect(400);

        expect(response.body).toEqual({
          status: 'error',
          message: 'Invalid phone number format'
        });
      });

      it('should return 400 when required fields are missing', async () => {
        const incompletePayload = { item_name: 'Emerald Silk Evening Gown' };

        mockBookingService.createBooking.mockRejectedValue(
          new Error('Missing required fields: total_price, booking_type, full_name, phone_number')
        );

        const response = await request(app)
          .post('/api/bookings')
          .send(incompletePayload)
          .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Missing required fields');
      });

      it('should return 400 when payment method is invalid', async () => {
        const invalidPayload = { ...validPayload, payment_method: 'InvalidMethod' };

        mockBookingService.createBooking.mockRejectedValue(
          new Error('Invalid payment method. Accepted methods: GCash, BankTransfer')
        );

        const response = await request(app)
          .post('/api/bookings')
          .send(invalidPayload)
          .expect(400);

        expect(response.body.message).toContain('Invalid payment method');
      });

      it('should handle database errors gracefully', async () => {
        mockBookingService.createBooking.mockResolvedValue({
          data: null,
          error: new Error('Database connection lost')
        });

        const response = await request(app)
          .post('/api/bookings')
          .send(validPayload)
          .expect(400);

        expect(response.body).toEqual({
          status: 'error',
          message: 'Database connection lost'
        });
      });

      it('should have correct content-type header', async () => {
        mockBookingService.createBooking.mockResolvedValue({
          data: [validPayload],
          error: null
        });

        await request(app)
          .post('/api/bookings')
          .send(validPayload)
          .expect('Content-Type', /json/);
      });
    });
  });
});
