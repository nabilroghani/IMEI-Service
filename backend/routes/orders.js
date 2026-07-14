const express = require('express');
const router = express.Router();
const { getMyOrders, createOrder, trackOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { orderSubmissionLimiter } = require('../middleware/rateLimiter');

// Create a new IMEI order (Requires client login + submission rate limit)
router.post('/', protect, orderSubmissionLimiter, createOrder);

// Get authenticated user's order logs
router.get('/', protect, getMyOrders);

// Guest order tracking status check
router.get('/track/:orderId', trackOrder);

module.exports = router;
