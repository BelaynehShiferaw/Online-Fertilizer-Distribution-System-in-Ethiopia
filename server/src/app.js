const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const requestRoutes = require('./routes/requestRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const procurementRoutes = require('./routes/procurementRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const priceRoutes = require('./routes/priceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const distributionRoutes = require('./routes/distributionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const financialRoutes = require('./routes/financialRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Security and utility middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in development for ease of testing
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'Online Fertilizer Distribution Management System (OFDMS)',
    country: 'Ethiopia',
    timestamp: new Date().toISOString(),
  });
});

// API Routes mounting under /api/v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/farmers', farmerRoutes);
app.use('/api/v1/plots', farmerRoutes);
app.use('/api/v1/crops', farmerRoutes);
app.use('/api/v1/fertilizer-requests', requestRoutes);
app.use('/api/v1/recommendations', recommendationRoutes);
app.use('/api/v1/procurement-requests', procurementRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/fertilizer-prices', priceRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/distribution-orders', distributionRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/financial', financialRoutes);
app.use('/api/v1/reports', reportRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on OFDMS API.`,
  });
});

// Global Centralized Error Handler
app.use(errorHandler);

module.exports = app;
