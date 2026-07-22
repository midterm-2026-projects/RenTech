import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';

import bookingService from './service/booking.service.js';
import transactionService from './service/transaction.service.js';
import productService from './service/product.service.js';
import { registerForecastRoute } from './route/forecastRoute.js';
import { registerAiRoutes } from './route/aiRoutes.js';
import { registerAnalyticsRoutes } from './route/analyticsRoute.js';
import { registerProductRoutes } from './route/productRoute.js';
import { registerHealthRoutes } from './route/healthRoute.js';
import { requestLogger, errorLogger } from './middleware/requestLogger.js';
import { requireAuth } from './middleware/auth.js';
import analyticsModel from './model/analytics.model.js';
import { register, login, signup, signin } from './controller/loginController.js';
import { getRentalHistory, getTransactionSummary, calculateTransactionCosts } from './service/transactionMonitoring.service.js';
import { getTemplates, updateTemplate, resetTemplate, resetAllTemplates } from './service/SystemSetting.service.js';
import { getStaffList, addStaff, removeStaff } from './service/staffManagement.service.js';

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

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
registerProductRoutes(productRoutes);
const loginRoutes = express.Router();
const transactionRoutes = express.Router();
const analyticsRouter = express.Router();
const settingsRoutes = express.Router();
const staffRoutes = express.Router();
registerAnalyticsRoutes(analyticsRouter);

// ====================
// Booking Endpoints
// ====================
bookingRoutes.get('/bookings', requireAuth, async (req, res) => {
  try {
    const bookings = await bookingService.getBookings();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

bookingRoutes.post('/bookings', requireAuth, async (req, res) => {
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
transactionRoutes.get('/transactions', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { search, status } = req.query;

    const { data, total, error } = await transactionService.getTransactions({
      page,
      limit,
      search: search || '',
      status: status || '',
    });

    if (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }

    res.json({
      status: 'success',
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

transactionRoutes.patch('/transactions/:id', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await transactionService.updateTransactionStatus(req.params.id, status);
    if (updated.error) {
      return res.status(500).json({ status: 'error', message: updated.error.message });
    }
    if (!updated.data) {
      return res.status(404).json({ status: 'error', message: 'Transaction not found' });
    }
    res.json({ status: 'success', data: updated.data });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

transactionRoutes.post('/transactions', requireAuth, async (req, res) => {
  try {
    const newTransaction = await transactionService.createTransaction(req.body);
    if (req.body.item) {
      const result = await productService.updateProductStatusByName(req.body.item, 'Rented');
      if (result.error) {
        console.error('Warning: Failed to update product status:', result.error.message || result.error);
      }
    }
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

transactionRoutes.get('/transactions/history', requireAuth, async (req, res) => {
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

transactionRoutes.get('/transactions/summary', requireAuth, async (req, res) => {
  try {
    const { username } = req.query;
    const summary = await getTransactionSummary(username || null);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

transactionRoutes.get('/transactions/costs', requireAuth, async (req, res) => {
  try {
    const { transactionId } = req.query;
    const costData = await calculateTransactionCosts(transactionId || null);
    res.json(costData);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
});

// ====================
// Login Endpoints
// ====================
loginRoutes.post('/register', register);
loginRoutes.post('/login', login);
loginRoutes.post('/signup', signup);
loginRoutes.post('/signin', signin);

// ====================
// Settings/Template Endpoints
// ====================
settingsRoutes.get('/templates', requireAuth, async (req, res) => {
  try {
    const templates = await getTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

settingsRoutes.put('/templates/:key', requireAuth, async (req, res) => {
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

settingsRoutes.post('/templates/reset/:key', requireAuth, async (req, res) => {
  try {
    const { key } = req.params;
    const reverted = await resetTemplate(key);
    res.json(reverted);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

settingsRoutes.post('/templates/reset-all', requireAuth, async (req, res) => {
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
staffRoutes.get('/staff', requireAuth, async (req, res) => {
  try {
    const staffList = await getStaffList();
    res.json(staffList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

staffRoutes.post('/staff', requireAuth, async (req, res) => {
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

staffRoutes.delete('/staff/:username', requireAuth, async (req, res) => {
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
app.post('/api/migrations/run', requireAuth, async (req, res) => {
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
// Health Check & Monitoring
// ====================
const healthRouter = express.Router();
registerHealthRoutes(healthRouter);

// ====================
// Register Routes
// ====================
app.use('/api', healthRouter);
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

// ====================
// Global Error Handler (logging)
// ====================
app.use(errorLogger);

const isMainModule = process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);
if (isMainModule) {
  app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
  });
}

export default app;