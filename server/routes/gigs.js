const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// GET /api/gigs - Return all gigs
router.get('/', (req, res) => {
  try {
    const gigsPath = path.join(__dirname, '../data/Gigs Dataset.json');
    const gigs = JSON.parse(fs.readFileSync(gigsPath, 'utf-8'));
    res.json({ success: true, data: gigs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load gigs', message: error.message });
  }
});

module.exports = router; 