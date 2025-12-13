const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['new', 'in_progress', 'waiting_auth', 'done'],
    required: true
  },
  note: {
    type: String,
    required: true
  },
  criticalIssue: {
    type: Boolean,
    default: false
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const partSchema = new mongoose.Schema({
  inventoryCode: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  }
});

const jobCardSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ['2W', '4W'],
    required: true
  },
  vehicleNo: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'waiting_auth', 'done'],
    default: 'new'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updates: [updateSchema],
  parts: [partSchema],
  labourCharge: {
    type: Number,
    default: 500,
    min: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('JobCard', jobCardSchema);

