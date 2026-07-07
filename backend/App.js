import express from 'express';
import cors from 'cors';

import bookingService from './service/booking.service.js';
import transactionService from './service/transaction.service.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const bookingRoutes = express.Router();
const productRoutes = express.Router();
const loginRoutes = express.Router();
const transactionRoutes = express.Router();

bookingRoutes.get('/bookings', async (req, res) => {
  try {
    const bookings = await bookingService.getBookings();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

bookingRoutes.post('/bookings', async (req, res) => {
  try {
    const newBooking = await bookingService.createBooking(req.body);
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

transactionRoutes.get('/transactions', async (req, res) => {
  try {
    const transactions = await transactionService.getTransactions();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

transactionRoutes.post('/transactions', async (req, res) => {
  try {
    const newTransaction = await transactionService.createTransaction(req.body);
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

productRoutes.get('/products', (req, res) => {
  res.json([]);
});

loginRoutes.post('/login', (req, res) => {
  res.json({ success: true });
});

app.use('/api', bookingRoutes);
app.use('/api', productRoutes);
app.use('/api', loginRoutes);
app.use('/api', transactionRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});