const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null if submitted as guest
  },
  imei: {
    type: String,
    required: [true, 'Please enter a 15-digit IMEI number'],
    length: [15, 'IMEI must be exactly 15 digits'],
    match: [/^\d{15}$/, 'IMEI must contain only numbers']
  },
  brand: {
    type: String,
    required: [true, 'Please specify the device brand']
  },
  model: {
    type: String,
    required: [true, 'Please specify the device model']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  serviceNameSnapshot: {
    type: String,
    required: true
  },
  priceSnapshot: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Failed'],
    default: 'Pending'
  },
  customerEmail: {
    type: String,
    required: [true, 'Please enter a contact email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  customerPhone: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp on save
OrderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
