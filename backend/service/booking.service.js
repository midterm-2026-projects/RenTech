import bookingModel from '../model/booking.model.js';

export default {
  
  async getBookings() {
    return await bookingModel.find();
  },

  
  async createBooking(bookingData) {
    
    if (!bookingData.full_name || bookingData.full_name.trim() === "") {
      throw new Error('Invalid customer name or missing fields');
    }
    
    
    if (!bookingData.phone_number || bookingData.phone_number.length !== 11) {
      throw new Error('Invalid phone number');
    }

    
    if (!bookingData.payment_method || bookingData.payment_method.trim() === "") {
      throw new Error('Invalid payment method');
    }

    
    return await bookingModel.create(bookingData);
  }
};