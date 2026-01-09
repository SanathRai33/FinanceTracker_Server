const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user.routes');
const transactionRoutes = require('./routes/transaction.routes');
const savingsGoalRoutes = require('./routes/savingsGoal.routes');
const debtRecordRoutes = require('./routes/debtRecord.routes');
const categoryRoutes = require('./routes/category.routes');
const authRoutes = require('./routes/auth.routes');
const analyticRoutes = require('./routes/analytic.routes');
const { firebaseSessionMiddleware } = require('./middlewares/auth.middleware');
const { apiLimiter, authLimiter, writeLimiter } = require('./middlewares/rateLimit.middleware');
const { cacheMiddleware } = require('./middlewares/cache.middleware');
const logger = require('./config/logger');
const env = require('./config/env');

const app = express();

// Trust proxy for production (behind load balancer)
if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Compression
app.use(compression());

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
  origin: env.FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// Write operations rate limiting
app.use('/api/', (req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return writeLimiter(req, res, next);
  }
  next();
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Firebase session middleware
app.use(firebaseSessionMiddleware);

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Custom logging middleware
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Root Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    data: {
      message: "Finance Tracker API",
      version: "1.0.0",
      status: "operational",
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        transactions: '/api/transactions',
        savingsGoals: '/api/savings-goals',
        debtRecords: '/api/debt-records',
        categories: '/api/categories',
        analytics: '/api/analytics',
      }
    }
  });
});

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: "Server is healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/savings-goals', savingsGoalRoutes);
app.use('/api/debt-records', debtRecordRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/analytics', analyticRoutes);

// Error Handling
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err);
  
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;