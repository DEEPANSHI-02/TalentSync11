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

  const checkServerHealth = async () => {
    try {
      await apiService.checkHealth();
      setServerStatus('online');
    } catch (error) {
      setServerStatus('offline');
      setError('Backend server is not running. Please start your server with "npm start"');
    }
  };

  // Modified handleSearch to optionally skip updating URL
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
    } catch (error) {
      setError(error.message || 'Failed to find matches. Please try again.');
    } finally {
      setLoading(false);
    }
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

        {/* Search Form */}
        <SearchForm onSubmit={handleSearch} loading={loading} initialValues={searchParams} />

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