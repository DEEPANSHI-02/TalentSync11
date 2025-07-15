/**
 * BreadButter Talent Matching Algorithm
 * Scoring: Location +3, Budget +2, Skills +2 each, Style +1 each
 */

function calculateMatches(talentProfiles, clientRequirements) {
  const { location, skills, budget, style_preferences } = clientRequirements;
  
  const matches = talentProfiles.map(profile => {
    let score = 0;
    let reasonParts = [];
    
    // 1. Location match (+3 points) - using "city" field from BreadButter data
    if (profile.city && 
        profile.city.toLowerCase().trim() === location.toLowerCase().trim()) {
      score += 3;
      reasonParts.push('Location match (+3)');
    }
    
    // 2. Budget within creator range (+2 points)
    if (profile.budget_range) {
      const budgetMatch = isBudgetInRange(profile.budget_range, budget);
      if (budgetMatch) {
        score += 2;
        reasonParts.push('Budget match (+2)');
      }
    }
    
    // 3. Skills matching (+2 points each)
    let matchingSkills = 0;
    if (profile.skills && Array.isArray(profile.skills) && Array.isArray(skills)) {
      const profileSkills = profile.skills.map(skill => skill.toLowerCase().trim());
      const clientSkills = skills.map(skill => skill.toLowerCase().trim());
      
      matchingSkills = clientSkills.filter(skill => 
        profileSkills.some(profileSkill => 
          profileSkill.includes(skill) || skill.includes(profileSkill)
        )
      ).length;
      
      if (matchingSkills > 0) {
        const skillPoints = matchingSkills * 2;
        score += skillPoints;
        reasonParts.push(`${matchingSkills} skill${matchingSkills > 1 ? 's' : ''} matched (+${skillPoints})`);
      }
    }
    
    // 4. Style preferences in tags or portfolio (+1 point each)
    let matchingStyles = 0;
    if (style_preferences && Array.isArray(style_preferences)) {
      const searchText = [
        ...(profile.style_tags || []),
        ...(profile.interest_tags || []),
        JSON.stringify(profile.portfolio || [])
      ].join(' ').toLowerCase();
      
      matchingStyles = style_preferences.filter(style => 
        searchText.includes(style.toLowerCase().trim())
      ).length;
      
      if (matchingStyles > 0) {
        score += matchingStyles;
        reasonParts.push(`${matchingStyles} style${matchingStyles > 1 ? 's' : ''} matched (+${matchingStyles})`);
      }
    }
    
    // Cap the score at 10 as per assignment rules
    score = Math.min(score, 10);
    
    const reason = reasonParts.length > 0 ? reasonParts.join(', ') : 'No specific matches found';
    
    return {
      id: profile.id,
      name: profile.name,
      score: score,
      reason: reason,
      portfolio: getPortfolioInfo(profile),
      // Additional details for enhanced matching
      city: profile.city,
      skills: profile.skills,
      style_tags: profile.style_tags,
      budget_range: profile.budget_range,
      experience_years: profile.experience_years,
      categories: profile.categories,
      tier_tags: profile.tier_tags
    };
  });
  
  // Sort by score (highest first), then by experience as tiebreaker
  return matches.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b.experience_years || 0) - (a.experience_years || 0);
  });
}

/**
 * Parse budget range from BreadButter format "₹33546–₹66470"
 */
function parseBudgetRange(budgetRange) {
  const cleanRange = budgetRange.replace(/[^\d₹–-]/g, '');
  const match = cleanRange.match(/₹(\d+)[–-]₹(\d+)/);
  
  if (match) {
    return {
      min: parseInt(match[1]),
      max: parseInt(match[2])
    };
  }
  return null;
}

/**
 * Check if client budget falls within talent's budget range
 */
function isBudgetInRange(budgetRange, clientBudget) {
  const parsed = parseBudgetRange(budgetRange);
  if (parsed) {
    return clientBudget >= parsed.min && clientBudget <= parsed.max;
  }
  return false;
}

/**
 * Extract portfolio information from talent profile
 */
function getPortfolioInfo(profile) {
  // Check if they have portfolio array
  if (profile.portfolio && Array.isArray(profile.portfolio) && profile.portfolio.length > 0) {
    return `Portfolio: ${profile.portfolio.length} projects`;
  }
  
  // Check platforms
  if (profile.platforms && Array.isArray(profile.platforms) && profile.platforms.length > 0) {
    return profile.platforms.join(', ');
  }
  
  return 'Portfolio available on request';
}

/**
 * Validate client requirements input
 */
function validateClientRequirements(requirements) {
  const errors = [];
  const { location, skills, budget, style_preferences } = requirements;
  
  // Location validation
  if (!location) {
    errors.push('Location is required');
  } else if (typeof location !== 'string' || location.trim().length === 0) {
    errors.push('Location must be a non-empty string');
  }
  
  // Skills validation
  if (!skills) {
    errors.push('Skills is required');
  } else if (!Array.isArray(skills)) {
    errors.push('Skills must be an array');
  } else if (skills.length === 0) {
    errors.push('At least one skill is required');
  } else if (skills.some(skill => typeof skill !== 'string' || skill.trim().length === 0)) {
    errors.push('All skills must be non-empty strings');
  }
  
  // Budget validation
  if (!budget) {
    errors.push('Budget is required');
  } else if (typeof budget !== 'number') {
    errors.push('Budget must be a number');
  } else if (budget <= 0) {
    errors.push('Budget must be greater than 0');
  } else if (budget > 10000000) {
    errors.push('Budget seems unrealistically high (max: ₹1 crore)');
  }
  
  // Style preferences validation
  if (!style_preferences) {
    errors.push('Style preferences is required');
  } else if (!Array.isArray(style_preferences)) {
    errors.push('Style preferences must be an array');
  } else if (style_preferences.some(style => typeof style !== 'string' || style.trim().length === 0)) {
    errors.push('All style preferences must be non-empty strings');
  }
  
  return errors;
}

/**
 * Generate comprehensive statistics for the talent database
 */
function generateMatchingStats(talentProfiles) {
  const stats = {
    total_profiles: talentProfiles.length,
    data_overview: {
      cities: [...new Set(talentProfiles.map(p => p.city).filter(Boolean))],
      total_skills: [...new Set(talentProfiles.flatMap(p => p.skills || []))].length,
      total_categories: [...new Set(talentProfiles.flatMap(p => p.categories || []))].length,
      experience_range: {
        min: Math.min(...talentProfiles.map(p => p.experience_years || 0)),
        max: Math.max(...talentProfiles.map(p => p.experience_years || 0)),
        avg: Math.round(talentProfiles.reduce((sum, p) => sum + (p.experience_years || 0), 0) / talentProfiles.length)
      }
    },
    popular_skills: getTopItems(talentProfiles.flatMap(p => p.skills || []), 10),
    popular_styles: getTopItems(talentProfiles.flatMap(p => p.style_tags || []), 10),
    city_distribution: getCityStats(talentProfiles),
    category_distribution: getCategoryStats(talentProfiles)
  };
  
  return stats;
}

function getTopItems(items, limit = 10) {
  const counts = {};
  items.forEach(item => {
    counts[item] = (counts[item] || 0) + 1;
  });
  
  return Object.entries(counts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([item, count]) => ({ item, count }));
}

function getCityStats(profiles) {
  const cityCount = {};
  profiles.forEach(profile => {
    const city = profile.city || 'Unknown';
    cityCount[city] = (cityCount[city] || 0) + 1;
  });
  return cityCount;
}

function getCategoryStats(profiles) {
  const categoryCount = {};
  profiles.forEach(profile => {
    (profile.categories || []).forEach(category => {
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
  });
  return categoryCount;
}

module.exports = {
  calculateMatches,
  validateClientRequirements,
  generateMatchingStats,
  parseBudgetRange,
  isBudgetInRange
};