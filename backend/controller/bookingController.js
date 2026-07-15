import bookingService from '../service/booking.service.js';

export async function getBookings(req, res) {
  const { data, error } = await bookingService.getBookings();
  
  if (error) {
    return res.status(400).json({ status: 'error', message: error.message });
  }

  res.json({
    status: 'success',
    message: 'Bookings retrieved successfully',
    count: data ? data.length : 0,
    data: data || [],
    timestamp: new Date().toISOString()
  });
}

export async function createBooking(req, res) {
  try {
    const { data, error } = await bookingService.createBooking(req.body);
    
    if (error) {
      // Handles conflict errors (e.g., gown already rented) and Supabase failures
      return res.status(400).json({ status: 'error', message: error.message });
    }

    res.json({
      status: 'success',
      message: 'Booking created successfully',
      data: data && data.length > 0 ? data[0] : null,
      timestamp: new Date().toISOString()
    });
  } catch (validationError) {
    res.status(400).json({ status: 'error', message: validationError.message });
  }
}
