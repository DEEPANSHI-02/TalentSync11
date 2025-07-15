const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const historyPath = path.join(__dirname, '../data/Match History.json');

// GET /api/match-history?talentId=... - Fetch feedback for a talent
router.get('/', (req, res) => {
  try {
    const { talentId } = req.query;
    const all = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    const filtered = talentId ? all.filter(entry => entry.talent_id === talentId) : all;
    res.json({ success: true, data: filtered });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load match history', message: error.message });
  }
});

// POST /api/match-history - Save feedback
router.post('/', (req, res) => {
  try {
    const entry = req.body;
    if (!entry.talent_id) return res.status(400).json({ success: false, error: 'talent_id is required' });
    const all = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    all.push({ ...entry, timestamp: new Date().toISOString() });
    fs.writeFileSync(historyPath, JSON.stringify(all, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save feedback', message: error.message });
  }
});

module.exports = router; 