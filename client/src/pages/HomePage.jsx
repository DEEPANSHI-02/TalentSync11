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

      {/* Main Content */}
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

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center flex flex-col items-center gap-2">
            <p className="text-gray-600 mb-2">
              TalentSync &copy; {new Date().getFullYear()} &mdash; Empowering Creative Connections
            </p>
            <div className="flex justify-center gap-4 mt-2">
              <a href="https://github.com/deepanshikadian" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 transition-colors" title="GitHub">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.338 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .267.18.579.688.481C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/></svg>
              </a>
              <a href="https://linkedin.com/in/deepanshikadian" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-700 transition-colors" title="LinkedIn">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z"/></svg>
              </a>
              <a href="mailto:deepanshikadian@gmail.com" className="text-gray-500 hover:text-red-600 transition-colors" title="Email">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 13.065l-11.985-7.065v14c0 1.104.896 2 2 2h19.97c1.104 0 2-.896 2-2v-14l-11.985 7.065zm11.985-9.065c0-1.104-.896-2-2-2h-19.97c-1.104 0-2 .896-2 2v.217l12 7.083 11.97-7.083v-.217z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;