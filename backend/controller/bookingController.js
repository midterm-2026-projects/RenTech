import bookingService from '../service/booking.service.js';

import transactionService from '../service/transaction.service.js';

import productService from '../service/product.service.js'; // 1. Import your product service



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

      return res.status(400).json({ status: 'error', message: error.message });

    }



    const newBooking = data && data.length > 0 ? data[0] : null;



    if (newBooking) {

      // 2. Automatically update the product status in Supabase to 'Rented'/'Unavailable'

      try {

        if (productService && productService.updateProductStatusByName) {

          await productService.updateProductStatusByName(newBooking.item_name, 'Rented');

        }

      } catch (prodError) {

        console.error('Failed to update product status in Supabase:', prodError.message);

      }



      // Automatically record booking form info into the transactions table

      try {

        await transactionService.createTransaction({

          username: newBooking.full_name,

          item: newBooking.item_name,

          pricePerDay: newBooking.total_price,

          daysRented: 1,

          amount: newBooking.total_price,

          date: newBooking.rental_date,

          status: 'Reserved'

        });

      } catch (txError) {

        console.error('Failed to auto-record transaction from booking controller:', txError.message);

      }

    }



    res.json({

      status: 'success',

      message: 'Booking created successfully',

      data: newBooking,

      timestamp: new Date().toISOString()

    });

  } catch (validationError) {

    res.status(400).json({ status: 'error', message: validationError.message });

  }

}