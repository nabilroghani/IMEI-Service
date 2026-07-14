const express = require('express');
const router = express.Router();
const { 
  getServices, 
  createService, 
  updateService, 
  deleteService 
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

// Public route to list services, and admin route to create a service
router.route('/')
  .get(getServices)
  .post(protect, authorize('admin'), createService);

// Admin routes to edit and delete services
router.route('/:id')
  .put(protect, authorize('admin'), updateService)
  .delete(protect, authorize('admin'), deleteService);

module.exports = router;
