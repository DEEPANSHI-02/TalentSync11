import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Search, Filter, MapPin, Star, ExternalLink, Users } from 'lucide-react';

const BrowsePage = () => {
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    city: '',
    skills: '',
    category: ''
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 12,
    offset: 0,
    hasMore: false
  });

  useEffect(() => {
    loadTalents();
  }, [filters]);

  const loadTalents = async (loadMore = false) => {
    try {
      setLoading(true);
      const offset = loadMore ? pagination.offset + pagination.limit : 0;
      
      const response = await apiService.getTalents({
        ...filters,
        limit: pagination.limit,
        offset: offset
      });

      if (loadMore) {
        setTalents(prev => [...prev, ...response.data]);
      } else {
        setTalents(response.data);
      }

      setPagination(response.pagination);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      skills: '',
      category: ''
    });
  };

  const cities = ['Mumbai', 'Delhi', 'Goa', 'Chennai', 'Bangalore', 'Hyderabad', 'Pune', 'Kolkata'];
  const categories = ['Photographer', 'Director', 'Editor', 'Designer', 'Videographer', 'Animator', 'Stylist'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse All Talents</h1>
          <p className="text-gray-600">Explore our network of creative professionals</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
              <input
                type="text"
                value={filters.skills}
                onChange={(e) => handleFilterChange('skills', e.target.value)}
                placeholder="e.g., Fashion, Wedding"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2 text-gray-600">
            <Users className="w-5 h-5" />
            <span>Showing {talents.length} of {pagination.total} talents</span>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && talents.length === 0 && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading talents...</p>
          </div>
        )}

        {/* Talents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {talents.map((talent) => (
            <div key={talent.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
              {/* Avatar */}
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                {talent.name.split(' ').map(n => n[0]).join('')}
              </div>

              {/* Basic Info */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{talent.name}</h3>
              
              <div className="flex items-center text-gray-600 mb-3">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{talent.city}</span>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-1 mb-3">
                {talent.categories?.map((category) => (
                  <span key={category} className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                    {category}
                  </span>
                ))}
              </div>

              {/* Skills */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {talent.skills?.slice(0, 3).map((skill) => (
                    <span key={skill} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                  {talent.skills?.length > 3 && (
                    <span className="text-xs text-gray-500">+{talent.skills.length - 3} more</span>
                  )}
                </div>
              </div>

              {/* Budget & Experience */}
              <div className="text-sm text-gray-600 mb-4">
                <div>Budget: {talent.budget_range}</div>
                <div>Experience: {talent.experience_years} years</div>
              </div>

              {/* Platforms */}
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <ExternalLink className="w-4 h-4 mr-1" />
                <span>{talent.platforms?.join(', ') || 'Portfolio available'}</span>
              </div>

              {/* Action Button */}
              <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md transition-colors">
                View Profile
              </button>
            </div>
          ))}
        </div>

        {/* Load More */}
        {pagination.hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={() => loadTalents(true)}
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md disabled:opacity-50 transition-colors"
            >
              {loading ? 'Loading...' : 'Load More Talents'}
            </button>
          </div>
        )}

        {/* No Results */}
        {!loading && talents.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No talents found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;