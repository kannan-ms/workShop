const express = require('express');
const mongoose = require('mongoose');
const JobCard = require('../models/JobCard');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Helper to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Create job card (Service Advisor only)
router.post('/', auth, authorize('service_advisor', 'manager'), async (req, res) => {
  try {
    const { customerName, vehicleType, vehicleNo } = req.body;

    if (!customerName || !vehicleType || !vehicleNo) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['2W', '4W'].includes(vehicleType)) {
      return res.status(400).json({ message: 'Vehicle type must be 2W or 4W' });
    }

    const jobCard = new JobCard({
      customerName,
      vehicleType,
      vehicleNo,
      createdBy: req.user._id,
      status: 'new'
    });

    await jobCard.save();
    await jobCard.populate('createdBy', 'username email role');

    res.status(201).json(jobCard);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all job cards
router.get('/', auth, async (req, res) => {
  try {
    const jobCards = await JobCard.find()
      .populate('createdBy', 'username email role')
      .populate('updates.updatedBy', 'username role')
      .sort({ createdAt: -1 });

    res.json(jobCards);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get job card by ID
router.get('/:id', auth, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid job card ID' });
    }

    const jobCard = await JobCard.findById(req.params.id)
      .populate('createdBy', 'username email role')
      .populate('updates.updatedBy', 'username role');

    if (!jobCard) {
      return res.status(404).json({ message: 'Job card not found' });
    }

    res.json(jobCard);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add update (Technician only)
router.post('/:id/updates', auth, authorize('technician', 'manager'), async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid job card ID' });
    }

    const { status, note, criticalIssue } = req.body;

    if (!status || !note) {
      return res.status(400).json({ message: 'Status and note are required' });
    }

    if (!['new', 'in_progress', 'waiting_auth', 'done'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const jobCard = await JobCard.findById(req.params.id);
    if (!jobCard) {
      return res.status(404).json({ message: 'Job card not found' });
    }

    // Determine final status: if criticalIssue is true, set to waiting_auth
    let finalStatus = status;
    if (criticalIssue === true) {
      finalStatus = 'waiting_auth';
    }

    // Add update
    jobCard.updates.push({
      status: finalStatus,
      note,
      criticalIssue: criticalIssue || false,
      updatedBy: req.user._id
    });

    // Update job card status
    jobCard.status = finalStatus;

    await jobCard.save();
    await jobCard.populate('updates.updatedBy', 'username role');

    res.json(jobCard);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add parts (Cashier only)
router.post('/:id/parts', auth, authorize('cashier', 'manager'), async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid job card ID' });
    }

    const { inventoryCode, name, quantity, unitPrice } = req.body;

    if (!inventoryCode || !name || !quantity || !unitPrice) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (quantity <= 0 || unitPrice < 0) {
      return res.status(400).json({ message: 'Invalid quantity or price' });
    }

    const jobCard = await JobCard.findById(req.params.id);
    if (!jobCard) {
      return res.status(404).json({ message: 'Job card not found' });
    }

    jobCard.parts.push({
      inventoryCode,
      name,
      quantity,
      unitPrice
    });

    await jobCard.save();
    res.json(jobCard);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get bill (any authenticated user)
router.get('/:id/bill', auth, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid job card ID' });
    }

    const jobCard = await JobCard.findById(req.params.id);
    if (!jobCard) {
      return res.status(404).json({ message: 'Job card not found' });
    }

    // Calculate parts total
    const partsTotal = jobCard.parts.reduce((sum, part) => {
      return sum + (part.quantity * part.unitPrice);
    }, 0);

    // Labour charge (fixed)
    const labourCharge = jobCard.labourCharge || 500;

    // Subtotal
    const subtotal = partsTotal + labourCharge;

    // GST (18%)
    const gst = subtotal * 0.18;

    // Total
    const total = subtotal + gst;

    res.json({
      jobCardId: jobCard._id,
      customerName: jobCard.customerName,
      vehicleNo: jobCard.vehicleNo,
      parts: jobCard.parts,
      partsTotal: parseFloat(partsTotal.toFixed(2)),
      labourCharge: parseFloat(labourCharge.toFixed(2)),
      subtotal: parseFloat(subtotal.toFixed(2)),
      gst: parseFloat(gst.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update job card status (Manager or Service Advisor - for authorization)
router.patch('/:id/status', auth, authorize('manager', 'service_advisor'), async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid job card ID' });
    }

    const { status } = req.body;

    if (!['new', 'in_progress', 'waiting_auth', 'done'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const jobCard = await JobCard.findById(req.params.id);
    if (!jobCard) {
      return res.status(404).json({ message: 'Job card not found' });
    }

    jobCard.status = status;
    await jobCard.save();

    res.json(jobCard);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

