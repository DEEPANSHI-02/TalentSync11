function logMatchRequest(requirements, matchCount, processingTime) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    type: 'MATCH_REQUEST',
    location: requirements.location,
    skills_count: requirements.skills.length,
    budget: requirements.budget,
    style_preferences_count: requirements.style_preferences.length,
    matches_found: matchCount,
    processing_time_ms: processingTime
  };
  
  console.log(' Match Request:', JSON.stringify(logEntry, null, 2));
}

function logError(error, context = '') {
  const timestamp = new Date().toISOString();
  console.error(` [${timestamp}] Error ${context}:`, error.message);
  if (error.stack) {
    console.error('Stack trace:', error.stack);
  }
}

function logInfo(message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(` [${timestamp}] ${message}`);
  if (data) {
    console.log('   Data:', JSON.stringify(data, null, 2));
  }
}

module.exports = {
  logMatchRequest,
  logError,
  logInfo
};