const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DATA_PATH = path.join(__dirname, '../data/TalentProfiles.json');

router.get('/', (req, res) => {
  fs.readFile(DATA_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read data' });
    let profiles;
    try {
      profiles = JSON.parse(data);
    } catch (e) {
      return res.status(500).json({ error: 'Invalid JSON' });
    }

    // Total talents
    const totalTalents = profiles.length;

    // Unique skills and counts
    const skillCounts = {};
    // Unique style tags and counts
    const styleTagCounts = {};
    // Category distribution
    const categoryCounts = {};
    // City distribution
    const cityCounts = {};

    profiles.forEach(profile => {
      // Skills
      (profile.skills || []).forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
      // Style tags
      (profile.style_tags || []).forEach(tag => {
        styleTagCounts[tag] = (styleTagCounts[tag] || 0) + 1;
      });
      // Categories
      (profile.categories || []).forEach(cat => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
      // Cities
      if (profile.city) {
        cityCounts[profile.city] = (cityCounts[profile.city] || 0) + 1;
      }
    });

    // Top 5 skills
    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill, count]) => ({ skill, count }));
    // Top 5 style tags
    const topStyleTags = Object.entries(styleTagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
    // Category distribution as array
    const categoryDistribution = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
    // City distribution as array
    const cityDistribution = Object.entries(cityCounts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      totalTalents,
      uniqueSkills: Object.keys(skillCounts).length,
      topSkills,
      uniqueStyleTags: Object.keys(styleTagCounts).length,
      topStyleTags,
      categoryDistribution,
      cityDistribution
    });
  });
});

module.exports = router; 