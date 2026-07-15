import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';

import bookingService from './service/booking.service.js';
import transactionService from './service/transaction.service.js';
import { registerForecastRoute } from './route/forecastRoute.js';
import { registerAiRoutes } from './route/aiRoutes.js';
import { registerAnalyticsRoutes } from './route/analyticsRoute.js';
import analyticsModel from './model/analytics.model.js';
import { register, login } from './controller/loginController.js';
import { getRentalHistory, getTransactionSummary, calculateTransactionCosts } from './service/transactionMonitoring.service.js';
import { getTemplates, updateTemplate, resetTemplate, resetAllTemplates } from './service/SystemSetting.service.js';
import { getStaffList, addStaff, removeStaff } from './service/staffManagement.service.js';

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
const analyticsRouter = express.Router();
const settingsRoutes = express.Router();
const staffRoutes = express.Router();
registerAnalyticsRoutes(analyticsRouter);

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

transactionRoutes.get('/transactions/history', async (req, res) => {
  try {
    const { username, status, itemName } = req.query;
    const filters = {};
    
    if (username) filters.username = username;
    if (status) filters.status = status;
    if (itemName) filters.itemName = itemName;
    
    const history = await getRentalHistory(filters);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

transactionRoutes.get('/transactions/summary', async (req, res) => {
  try {
    const { username } = req.query;
    const summary = await getTransactionSummary(username || null);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

transactionRoutes.get('/transactions/costs', async (req, res) => {
  try {
    const { transactionId } = req.query;
    const costData = await calculateTransactionCosts(transactionId || null);
    res.json(costData);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
loginRoutes.post('/register', register);
loginRoutes.post('/login', login);

// ====================
// Settings/Template Endpoints
// ====================
settingsRoutes.get('/templates', async (req, res) => {
  try {
    const templates = await getTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

settingsRoutes.put('/templates/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    if (!value || !value.trim()) {
      return res.status(400).json({ error: "Template content cannot be blank or empty." });
    }
    
    const updated = await updateTemplate(key, value.trim());
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

settingsRoutes.post('/templates/reset/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const reverted = await resetTemplate(key);
    res.json(reverted);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

settingsRoutes.post('/templates/reset-all', async (req, res) => {
  try {
    const freshTemplates = await resetAllTemplates();
    res.json(freshTemplates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====================
// Staff Management Endpoints
// ====================
staffRoutes.get('/staff', async (req, res) => {
  try {
    const staffList = await getStaffList();
    res.json(staffList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

staffRoutes.post('/staff', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !username.trim() || !password || !password.trim()) {
      return res.status(400).json({ error: "Both username and password are required." });
    }
    
    const newStaff = await addStaff({ username: username.trim(), password: password.trim() });
    res.status(201).json(newStaff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

staffRoutes.delete('/staff/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const result = await removeStaff(username);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
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
app.use('/api/analytics', analyticsRouter);
app.use('/api/auth', loginRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', staffRoutes);

const isMainModule = process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);
if (isMainModule) {
  app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
  });
}

export default app;