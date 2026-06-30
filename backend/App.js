import express from 'express';
import cors from 'cors';
import bookingRoutes from './route/booking.route.js';
import productRoutes from './route/product.route.js';
import loginRoutes from './route/login.route.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', bookingRoutes);
app.use('/api', productRoutes);
app.use('/api', loginRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Standalone backend server running at http://localhost:${PORT}`);
});