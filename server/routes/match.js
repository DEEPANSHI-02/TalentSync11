const express = require('express');
const { calculateMatches, validateClientRequirements } = require('../utils/matchingAlgorithm');
const { logMatchRequest } = require('../utils/logger');
const router = express.Router();

// Input validation middleware
const validateMatchInput = (req, res, next) => {
  const errors = validateClientRequirements(req.body);
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
      example: {
        location: "Goa",
        skills: ["Fashion Shoots", "Weddings"],
        budget: 75000,
        style_preferences: ["documentary", "candid"]
      }
    });
  }
  
  next();
};

// POST /api/match endpoint
router.post('/', validateMatchInput, (req, res) => {
  const startTime = Date.now();
  
  try {
    const { location, skills, budget, style_preferences } = req.body;
    const talentProfiles = req.app.get('talentProfiles');
    
    if (!talentProfiles || talentProfiles.length === 0) {
      return res.status(503).json({
        success: false,
        error: 'No talent profiles available',
        message: 'The talent database is currently unavailable. Please try again later.'
      });
    }
    
    // Calculate matches using the algorithm
    const matches = calculateMatches(talentProfiles, {
      location,
      skills,
      budget,
      style_preferences
    });
    
    // Return top 3 matches as per assignment requirements
    const topMatches = matches.slice(0, 3);
    
    // Log the request for analytics
    logMatchRequest(req.body, topMatches.length, Date.now() - startTime);
    
    // Format response exactly as per BreadButter assignment specification
    const response = {
      success: true,
      matches: topMatches.map(match => ({
        id: match.id, // Include the id field for frontend routing
        name: match.name,
        score: match.score,
        reason: match.reason,
        portfolio: match.portfolio
      })),
      metadata: {
        total_evaluated: talentProfiles.length,
        processing_time_ms: Date.now() - startTime,
        request_timestamp: new Date().toISOString(),
        client_requirements: {
          location,
          skills,
          budget: `₹${budget.toLocaleString('en-IN')}`,
          style_preferences
        }
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error in /api/match endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process match request',
      message: error.message
    });
  }
});

// GET /api/match/test - Test endpoint with sample data
router.get('/test', (req, res) => {
  const sampleRequest = {
    location: "Goa",
    skills: ["Fashion Shoots", "Weddings"],
    budget: 75000,
    style_preferences: ["documentary", "candid"]
  };
  
  res.json({
    message: 'Test the matching API with this sample request',
    method: 'POST',
    endpoint: '/api/match',
    sampleRequest,
    instructions: 'Send a POST request to /api/match with the sample request body'
  });
});

module.exports = router;