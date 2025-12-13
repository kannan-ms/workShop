const express = require('express');
const JobCard = require('../models/JobCard');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get kanban grouped job cards
router.get('/', auth, async (req, res) => {
  try {
    const jobCards = await JobCard.find()
      .populate('createdBy', 'username email role')
      .populate('updates.updatedBy', 'username role')
      .sort({ createdAt: -1 });

    // Group by status
    const grouped = {
      new: [],
      in_progress: [],
      waiting_auth: [],
      done: []
    };

    jobCards.forEach(card => {
      if (grouped[card.status]) {
        grouped[card.status].push(card);
      }
    });

    res.json(grouped);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

