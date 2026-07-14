const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a service name'],
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Please specify the device brand (e.g., Apple, Samsung)'],
    trim: true
  },
  serviceType: {
    type: String,
    required: [true, 'Please select service type'],
    enum: ['Network Unlock', 'iCloud Unlock', 'FRP Unlock', 'Blacklist Check'],
    default: 'Network Unlock'
  },
  price: {
    type: Number,
    required: [true, 'Please specify service price in USD']
  },
  estTime: {
    type: String,
    required: [true, 'Please specify estimated completion time (e.g., 1-2 Days)'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Service', ServiceSchema);
