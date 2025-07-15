import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API functions
export const apiService = {
  // Health check
  async checkHealth() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('Backend server is not available');
    }
  },

  // Find matching talents
  async findMatches(requirements) {
    try {
      const response = await api.post('/api/match', requirements);
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error(error.response.data.details?.join(', ') || 'Invalid request');
      }
      throw new Error('Failed to find matches. Please try again.');
    }
  },

  // Get all talents
  async getTalents(params = {}) {
    try {
      const response = await api.get('/api/talents', { params });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch talents');
    }
  },

  // Get talent statistics
  async getTalentStats() {
    try {
      const response = await api.get('/api/stats');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch statistics');
    }
  },

  // Get specific talent
  async getTalent(id) {
    try {
      const response = await api.get(`/api/talents/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Talent not found');
    }
  },

  // Fetch all gigs (sample briefs)
  async getGigs() {
    try {
      const response = await api.get('/api/gigs');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch gigs');
    }
  },

  // Get match history feedback for a talent
  async getMatchHistory(talentId) {
    try {
      const response = await api.get('/api/match-history', { params: { talentId } });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch match history');
    }
  },

  // Post feedback to match history
  async postMatchFeedback(feedback) {
    try {
      const response = await api.post('/api/match-history', feedback);
      return response.data;
    } catch (error) {
      throw new Error('Failed to save feedback');
    }
  }
};

export default api;