import { describe, it, expect, vi } from 'vitest';
import bookingService from '../../service/booking.service';
import bookingModel from '../../model/booking.model';


vi.mock('../../model/booking.model', () => {
  return {
    default: {
      find: vi.fn(),
      create: vi.fn(),
    },
  };
});

describe('Booking Service', () => {

 
  describe('Get Bookings', () => {
    it('should read a booking from the list', async () => {
     
      bookingModel.find.mockResolvedValue([
        { customerName: 'Alice', phone: '09998887777' }
      ]);

      
      const result = await bookingService.getBookings();
      
      expect(result.length).toBe(1);
      expect(result[0].customerName).toBe('Alice');
    });
  });


  describe('Create Booking', () => {
    
    describe('Check input validation', () => {
      const validPhone = '09998887777';

      it('should throw an error if customer name is not provided', async () => {
        await expect(bookingService.createBooking({ phone: validPhone, paymentMethod: 'GCash' }))
          .rejects
          .toThrow(/Invalid customer name or missing fields/i);
      });

      it('should throw an error if phone number is empty', async () => {
        await expect(bookingService.createBooking({ customerName: 'Bob', phone: '', paymentMethod: 'GCash' }))
          .rejects
          .toThrow(/Invalid phone number/i);
      });

      it('should throw an error if the phone number is not 11 digits', async () => {
        await expect(bookingService.createBooking({ customerName: 'Bob', phone: '12345', paymentMethod: 'GCash' }))
          .rejects
          .toThrow(/Invalid phone number/i);
      });

      it('should throw an error if payment method is empty', async () => {
        await expect(bookingService.createBooking({ customerName: 'Bob', phone: validPhone, paymentMethod: '' }))
          .rejects
          .toThrow(/Invalid payment method/i);
      });
    });

    describe('Successful creation', () => {
      it('should add a new booking successfully if all inputs are valid', async () => {
        const newBooking = { 
          customerName: 'Bob', 
          phone: '09998887777', 
          rentalDate: '2026-07-15', 
          size: 'L', 
          paymentMethod: 'GCash' 
        };

        bookingModel.create.mockResolvedValue(newBooking);

        const result = await bookingService.createBooking(newBooking);

        expect(result.customerName).toBe('Bob');
        expect(result.paymentMethod).toBe('GCash'); 
      });
    });

  });

});