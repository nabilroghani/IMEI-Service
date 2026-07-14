const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config();

// Connect to database
connectDB().then(() => {
  const seedData = require('./utils/seeder');
  seedData();
});

const app = express();

// Body parser
app.use(express.json());

// Global CORS Configuration
// Enabled globally here. Can be easily changed by modifying CORS_ORIGIN in .env
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const corsOptions = {
  origin: corsOrigin === '*' ? '*' : corsOrigin.split(','),
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const { apiLimiter } = require('./middleware/rateLimiter');

// Apply rate limiting globally to all API routes
app.use('/api', apiLimiter);

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy and running' });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
