import { validateRequest } from '../middleware/requestValidator.js';
import * as bookingController from '../controller/bookingController.js';

export function registerBookingRoutes(router) {
  router.get('/bookings', bookingController.getAllBookings);
  router.get('/bookings/:id', bookingController.getBookingById);

  router.post(
    '/bookings',
    validateRequest([
      { name: 'item_name', type: 'string', required: true },
      { name: 'total_price', type: 'number', required: true },
      { name: 'booking_type', type: 'string', required: true },
      { name: 'rental_date', type: 'string', required: true },
      { name: 'size_selected', type: 'string', required: true },
      { name: 'downpayment', type: 'number', required: true },
      { name: 'remaining_balance', type: 'number', required: true },
      { name: 'payment_method', type: 'string', required: true },
    ]),
    bookingController.createBookingTransaction
  );

  router.patch(
    '/bookings/:id/status',
    validateRequest([
      { name: 'status', type: 'string', required: true },
    ]),
    bookingController.updateBookingStatus
  );
}