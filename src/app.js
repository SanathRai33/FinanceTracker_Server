const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user.routes');
const transactionRoutes = require('./routes/transaction.routes');
const savingsGoalRoutes = require('./routes/savingsGoal.routes');
const debtRecordRoutes = require('./routes/debtRecord.routes');
const categoryRoutes = require('./routes/category.routes');
const authRoutes = require('./routes/auth.routes');
const analyticRoutes = require('./routes/analytic.routes');

const app = express();

app.use(helmet({
  contentSecurityPolicy: false 
}));

// Acess points
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip} - ${new Date().toISOString()}`);
  next();
});

// Root Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Devashya Naturals API",
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