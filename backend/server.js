const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config();

const app = express();

// Trust proxy for Vercel and reverse proxies (needed for express-rate-limit)
app.set('trust proxy', 1);

// Body parser
app.use(express.json());

// Global CORS Configuration
const corsOrigin = process.env.CORS_ORIGIN || '*';
const corsOptions = {
  origin: corsOrigin === '*' ? true : corsOrigin.split(',').map(s => s.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Ensure DB is connected and seed initial data safely
let isSeeded = false;
app.use(async (req, res, next) => {
  try {
    await connectDB();
    if (!isSeeded) {
      isSeeded = true;
      const seedData = require('./utils/seeder');
      seedData().catch(err => console.error('Seed error:', err.message));
    }
    next();
  } catch (error) {
    console.error('Database connection error in middleware:', error.message);
    return res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

const { apiLimiter } = require('./middleware/rateLimiter');

// Apply rate limiting globally to all API routes
app.use('/api', apiLimiter);

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// Root & Health check routes
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'IMEI Service API is live and running' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy and running' });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    console.error(`Unhandled Rejection Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
}

module.exports = app;

