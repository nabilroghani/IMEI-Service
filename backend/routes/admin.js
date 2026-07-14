const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  getAdminOrders, 
  updateOrderStatus, 
  getRegisteredUsers 
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Apply Admin protections globally to all sub-routes
router.use(protect);
router.use(authorize('admin'));

// Admin Dashboard stats
router.get('/stats', getDashboardStats);

// Orders review list & status modifications
router.get('/orders', getAdminOrders);
router.put('/orders/:id', updateOrderStatus);

// User lists
router.get('/users', getRegisteredUsers);

module.exports = router;
