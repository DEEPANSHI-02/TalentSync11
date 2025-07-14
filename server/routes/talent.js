const express = require('express');
const router = express.Router();

// GET /api/talents - Get all talent profiles with optional filtering
router.get('/', (req, res) => {
  try {
    const talentProfiles = req.app.get('talentProfiles');
    const { city, skills, category, limit = 50, offset = 0 } = req.query;
    
    let filteredTalents = [...talentProfiles];
    
    // Apply filters
    if (city) {
      filteredTalents = filteredTalents.filter(talent => 
        talent.city && talent.city.toLowerCase().includes(city.toLowerCase())
      );
    }
    
    if (skills) {
      const skillArray = Array.isArray(skills) ? skills : [skills];
      filteredTalents = filteredTalents.filter(talent =>
        talent.skills && skillArray.some(skill => 
          talent.skills.some(talentSkill => 
            talentSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }
    
    if (category) {
      filteredTalents = filteredTalents.filter(talent =>
        talent.categories && talent.categories.some(cat => 
          cat.toLowerCase().includes(category.toLowerCase())
        )
      );
    }
    
    // Pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedTalents = filteredTalents.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedTalents,
      pagination: {
        total: filteredTalents.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: endIndex < filteredTalents.length
      },
      filters: { city, skills, category }
    });
    
  } catch (error) {
    console.error('Error in /api/talents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch talent profiles',
      message: error.message
    });
  }
});

// GET /api/talents/stats - Get talent statistics
router.get('/stats', (req, res) => {
  try {
    const talentProfiles = req.app.get('talentProfiles');
    
    // Calculate statistics
    const stats = {
      total_talents: talentProfiles.length,
      cities: [...new Set(talentProfiles.map(t => t.city))].sort(),
      skills: [...new Set(talentProfiles.flatMap(t => t.skills || []))].sort(),
      categories: [...new Set(talentProfiles.flatMap(t => t.categories || []))].sort(),
      style_tags: [...new Set(talentProfiles.flatMap(t => t.style_tags || []))].sort(),
      experience_distribution: getExperienceDistribution(talentProfiles),
      city_distribution: getCityDistribution(talentProfiles),
      budget_range_stats: getBudgetStats(talentProfiles)
    };
    
    res.json({
            success: true,
      statistics: stats,
      generated_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in /api/talents/stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate statistics',
      message: error.message
    });
  }
});

// GET /api/talents/:id - Get specific talent profile
router.get('/:id', (req, res) => {
  try {
    const talentProfiles = req.app.get('talentProfiles');
    const { id } = req.params;
    
    const talent = talentProfiles.find(t => t.id === id);
    
    if (!talent) {
      return res.status(404).json({
        success: false,
        error: 'Talent not found',
        message: `No talent found with ID: ${id}`
      });
    }
    
    res.json({
      success: true,
      data: talent
    });
    
  } catch (error) {
    console.error('Error in /api/talents/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch talent profile',
      message: error.message
    });
  }
});

// Helper functions for statistics
function getExperienceDistribution(talents) {
  const distribution = {};
  talents.forEach(talent => {
    const years = talent.experience_years || 0;
    const range = getExperienceRange(years);
    distribution[range] = (distribution[range] || 0) + 1;
  });
  return distribution;
}

function getExperienceRange(years) {
  if (years <= 1) return '0-1 years';
  if (years <= 3) return '2-3 years';
  if (years <= 5) return '4-5 years';
  if (years <= 8) return '6-8 years';
  return '8+ years';
}

function getCityDistribution(talents) {
  const distribution = {};
  talents.forEach(talent => {
    const city = talent.city || 'Unknown';
    distribution[city] = (distribution[city] || 0) + 1;
  });
  return distribution;
}

function getBudgetStats(talents) {
  const budgets = [];
  talents.forEach(talent => {
    if (talent.budget_range) {
      const parsed = parseBudgetRange(talent.budget_range);
      if (parsed) {
        budgets.push(parsed);
      }
    }
  });
  
  if (budgets.length === 0) return null;
  
  const minBudgets = budgets.map(b => b.min);
  const maxBudgets = budgets.map(b => b.max);
  
  return {
    min_budget_range: {
      lowest: Math.min(...minBudgets),
      highest: Math.max(...minBudgets),
      average: Math.round(minBudgets.reduce((a, b) => a + b, 0) / minBudgets.length)
    },
    max_budget_range: {
      lowest: Math.min(...maxBudgets),
      highest: Math.max(...maxBudgets),
      average: Math.round(maxBudgets.reduce((a, b) => a + b, 0) / maxBudgets.length)
    }
  };
}

function parseBudgetRange(budgetRange) {
  const match = budgetRange.match(/₹(\d+).*?₹(\d+)/);
  if (match) {
    return {
      min: parseInt(match[1]),
      max: parseInt(match[2])
    };
  }
  return null;
}

module.exports = router;