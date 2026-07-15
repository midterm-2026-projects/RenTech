import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockBookingService = vi.hoisted(() => ({
  getBookings: vi.fn(),
  createBooking: vi.fn(),
}));

vi.mock('../../service/booking.service.js', () => ({
  __esModule: true,
  ...mockBookingService,
  default: mockBookingService,
}));

import { getBookings, createBooking } from '../../controller/bookingController.js';

function mockRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe('Booking controller (unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBookings', () => {
    it('should return 200 and success status with bookings data list', async () => {
      const payload = {
        data: [{ id: 'BK-999999', item_name: 'Gown A' }],
        error: null
      };
      mockBookingService.getBookings.mockResolvedValue(payload);
      const res = mockRes();

      await getBookings({}, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: 'Bookings retrieved successfully',
          count: 1
        })
      );
    });

    it('should return 400 when service layer returns a query error', async () => {
      const payload = {
        data: null,
        error: new Error('Database disconnect error')
      };
      mockBookingService.getBookings.mockResolvedValue(payload);
      const res = mockRes();

      await getBookings({}, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Database disconnect error'
        })
      );
    });
  });

  describe('createBooking', () => {
    it('should return successful creation payload structure', async () => {
      const payload = {
        data: [{ item_name: 'Emerald Silk Evening Gown' }],
        error: null
      };
      mockBookingService.createBooking.mockResolvedValue(payload);
      const res = mockRes();

      await createBooking({ body: {} }, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: 'Booking created successfully'
        })
      );
    });

    it('should catch validation throws or date collision conflicts safely', async () => {
      mockBookingService.createBooking.mockRejectedValue(new Error('Invalid phone number'));
      const res = mockRes();

      await createBooking({ body: {} }, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid phone number'
      });
    });
  });
});