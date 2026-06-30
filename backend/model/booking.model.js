const bookingsInMemory = [];

export default {
  async find() {
    return bookingsInMemory;
  },

  async create(bookingData) {
    const newBooking = {
      id: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
      productName: bookingData.productName || "Emerald Silk Mermaid Evening Gown",
      price: bookingData.price || 4500,
      downpayment: bookingData.downpayment || 2250,
      balance: bookingData.balance || 2250,
      customerName: bookingData.customerName,
      phone: bookingData.phone,
      rentalDate: bookingData.rentalDate,
      size: bookingData.size,
      paymentMethod: bookingData.paymentMethod,
      status: 'Pending Downpayment',
      createdAt: new Date().toISOString()
    };

    bookingsInMemory.push(newBooking);
    console.log("Successfully saved booking! Total memory list:", bookingsInMemory);
    return newBooking;
  }
};