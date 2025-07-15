import React, { useState, useEffect } from 'react';
import SearchForm from '../components/SearchForm';
import MatchResults from '../components/MatchResults';
import { apiService } from '../services/api';
import { AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const HomePage = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');
  const [searchParamsURL, setSearchParamsURL] = useSearchParams();
  const [resetForm, setResetForm] = useState(false);
  // Recent Searches
  const [recentSearches, setRecentSearches] = useState([]);
  // Gigs (sample briefs)
  const [gigs, setGigs] = useState([]);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('recentTalentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Save to localStorage when a new search is performed
  const saveRecentSearch = (searchData) => {
    const newEntry = {
      location: searchData.location,
      skills: searchData.skills,
      budget: searchData.budget,
      style_preferences: searchData.style_preferences,
      timestamp: Date.now()
    };
    const stored = localStorage.getItem('recentTalentSearches');
    let prev = stored ? JSON.parse(stored) : [];
    let updated = [newEntry, ...prev.filter(s => JSON.stringify(s) !== JSON.stringify(newEntry))];
    if (updated.length > 5) updated = updated.slice(0, 5); // Keep only 5 recent
    setRecentSearches(updated);
    localStorage.setItem('recentTalentSearches', JSON.stringify(updated));
  };

  // Check server status on mount
  useEffect(() => {
    checkServerHealth();
  }, []);

  // On mount, if query params exist, auto-search and prefill form
  useEffect(() => {
    const location = searchParamsURL.get('location');
    const skills = searchParamsURL.get('skills');
    const budget = searchParamsURL.get('budget');
    const style_preferences = searchParamsURL.get('style_preferences');
    if (location && skills && budget && style_preferences) {
      const searchData = {
        location,
        skills: skills.split(','),
        budget: parseInt(budget),
        style_preferences: style_preferences.split(',')
      };
      handleSearch(searchData, false); // Don't update URL again
    }
  }, []);

  // Fetch gigs on mount
  useEffect(() => {
    apiService.getGigs().then(res => {
      if (res.success) setGigs(res.data);
    }).catch(() => {});
  }, []);

  const checkServerHealth = async () => {
    try {
      await apiService.checkHealth();
      setServerStatus('online');
    } catch (error) {
      setServerStatus('offline');
      setError('Backend server is not running. Please start your server with "npm start"');
    }
  };

  // Modified handleSearch to save recent searches
  const handleSearch = async (searchData, updateURL = true) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await apiService.findMatches(searchData);
      setResults(response);
      setSearchParams(searchData);
      if (updateURL) {
        setSearchParamsURL({
          location: searchData.location,
          skills: searchData.skills.join(','),
          budget: searchData.budget,
          style_preferences: searchData.style_preferences.join(',')
        });
      }
      saveRecentSearch(searchData);
    } catch (error) {
      setError(error.message || 'Failed to find matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handler to re-run a recent search
  const handleRecentSearch = (search) => {
    handleSearch(search);
  };

  // Handler to pick a sample brief
  const handlePickBrief = (gig) => {
    const searchData = {
      location: gig.city,
      skills: [], // You may map category or other fields if needed
      budget: typeof gig.budget === 'number' ? gig.budget : '',
      style_preferences: gig.style_tags || []
    };
    setSearchParams(searchData);
    setResetForm(r => !r); // Reset form with new values
  };

  // Add clearSearch function
  const clearSearch = () => {
    setResults(null);
    setSearchParams(null);
    setSearchParamsURL({}); // Remove all query params
    setResetForm(r => !r); // Toggle to trigger form reset
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Server Status Banner */}
      {serverStatus === 'offline' && (
        <div className="bg-red-50 border-b border-red-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center space-x-3">
            <WifiOff className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">Server Offline</span>
            <span className="text-red-600">Please start your backend server</span>
            <button 
              onClick={checkServerHealth}
              className="text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {serverStatus === 'online' && !error && (
        <div className="bg-green-50 border-b border-green-200 p-2">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-green-800 text-sm">Connected to BreadButter API</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your Perfect
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600"> Creative Match</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Connect with talented photographers, directors, and creative professionals across India. 
            Powered by smart matching technology.
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>200+ Active Talents</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>8 Major Cities</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Smart AI Matching</span>
            </div>
          </div>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="mb-6 max-w-4xl mx-auto">
            <div className="font-semibold text-gray-700 mb-2">Recent Searches:</div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRecentSearch(s)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm border border-gray-200"
                  title={`Location: ${s.location}, Skills: ${s.skills.join(', ')}, Budget: ₹${s.budget}, Styles: ${s.style_preferences.join(', ')}`}
                >
                  {s.location} | {s.skills.join(', ')} | ₹{s.budget} | {s.style_preferences.join(', ')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sample Briefs Dropdown */}
        {gigs.length > 0 && (
          <div className="mb-6 max-w-4xl mx-auto">
            <label className="font-semibold text-gray-700 mr-2">Pick a Sample Brief:</label>
            <select
              className="form-input w-auto inline-block"
              defaultValue=""
              onChange={e => {
                const gig = gigs.find(g => g.id === e.target.value);
                if (gig) handlePickBrief(gig);
              }}
            >
              <option value="">Select a brief...</option>
              {gigs.slice(0, 10).map(gig => (
                <option key={gig.id} value={gig.id}>{gig.title} ({gig.city}, ₹{gig.budget})</option>
              ))}
            </select>
          </div>
        )}

        {/* Search Form */}
        <SearchForm
          key={JSON.stringify(searchParams) + resetForm} // force remount on change
          onSubmit={handleSearch}
          loading={loading}
          initialValues={searchParams}
          resetForm={resetForm}
        />

        {/* Clear Search Button */}
        {(results || searchParams) && (
          <div className="flex justify-center mt-4">
            <button
              onClick={clearSearch}
              className="btn-secondary px-6 py-2 text-base font-medium"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-medium text-red-800">Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-3 bg-white rounded-lg px-6 py-4 shadow-lg">
              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700 font-medium">Searching through 200+ talents...</span>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="mt-8">
                        <MatchResults results={results} searchParams={searchParams} />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;