import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';

import bookingService from './service/booking.service.js';
import transactionService from './service/transaction.service.js';
import { registerForecastRoute } from './route/forecastRoute.js';
import { registerAiRoutes } from './route/aiRoutes.js';
import analyticsModel from './model/analytics.model.js';

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ====================
// Forecast Routes
// ====================
const forecastRouter = express.Router();
registerForecastRoute(forecastRouter);

// ====================
// AI Routes
// ====================
const aiRouter = express.Router();
registerAiRoutes(aiRouter);

// ====================
// Other Routers
// ====================
const bookingRoutes = express.Router();
const productRoutes = express.Router();
const loginRoutes = express.Router();
const transactionRoutes = express.Router();

// ====================
// Booking Endpoints
// ====================
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

// ====================
// Transaction Endpoints
// ====================
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

// ====================
// Product Endpoints
// ====================
productRoutes.get('/products', (req, res) => {
  res.json([]);
});

// ====================
// Login Endpoints
// ====================
loginRoutes.post('/login', (req, res) => {
  res.json({ success: true });
});

// ====================
// Migration Endpoint
// ====================
app.post('/api/migrations/run', async (req, res) => {
  try {
    const result = await analyticsModel.runMigration();
    if (result.error) {
      const details = result.error.errors
        ? result.error.errors.map(e => e.message || String(e)).join('; ')
        : result.error.message || String(result.error);
      return res.status(500).json({ error: details });
    }
    res.json({ status: 'success', message: 'Migration completed successfully' });
  } catch (error) {
    const details = error.errors
      ? error.errors.map(e => e.message || String(e)).join('; ')
      : error.message || String(error);
    res.status(500).json({ error: details });
  }
});

// ====================
// Health Check
// ====================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ====================
// Register Routes
// ====================
app.use('/api', bookingRoutes);
app.use('/api', productRoutes);
app.use('/api', loginRoutes);
app.use('/api', transactionRoutes);
app.use('/api', forecastRouter);
app.use('/api', aiRouter);

// ====================
// Start Server
// ====================
const isMainModule = process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);
if (isMainModule) {
  app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
  });
}

export default app;