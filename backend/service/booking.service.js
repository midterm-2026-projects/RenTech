import bookingModel from '../model/booking.model.js';

export default {
  
  async getBookings() {
    return await bookingModel.find();
  },

  
  async createBooking(bookingData) {
    
    if (!bookingData.customerName || bookingData.customerName.trim() === "") {
      throw new Error('Invalid customer name or missing fields');
    }
    
    
    if (!bookingData.phone || bookingData.phone.length !== 11) {
      throw new Error('Invalid phone number');
    }

    
    if (!bookingData.paymentMethod || bookingData.paymentMethod.trim() === "") {
      throw new Error('Invalid payment method');
    }

    
    return await bookingModel.create(bookingData);
  }
};