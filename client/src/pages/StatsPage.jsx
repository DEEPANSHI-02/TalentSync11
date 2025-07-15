import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { BarChart3, Users, MapPin, Star, TrendingUp, Award } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTalentStats();
      setStats(response);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load statistics</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={loadStats}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Talent Database Statistics</h1>
          <p className="text-gray-600">Insights into our creative professional network</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Talents</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalTalents || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cities</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.cityDistribution?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unique Skills</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.uniqueSkills || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unique Style Tags</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.uniqueStyleTags || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Popular Skills */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <TrendingUp className="w-5 h-5 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Most Popular Skills</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {stats?.topSkills?.map((skill) => (
                <span key={skill.skill} className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                  {skill.skill} <span className="ml-1 text-xs text-primary-500">({skill.count})</span>
                </span>
              ))}
            </div>
          </div>

          {/* Popular Styles */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Star className="w-5 h-5 text-secondary-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Popular Style Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {stats?.topStyleTags?.map((tag) => (
                <span key={tag.tag} className="inline-block bg-secondary-100 text-secondary-700 px-3 py-1 rounded-full text-sm font-medium">
                  {tag.tag} <span className="ml-1 text-xs text-secondary-500">({tag.count})</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* City & Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* City Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <MapPin className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">City Distribution</h3>
            </div>
            <Bar
              data={{
                labels: stats?.cityDistribution?.map((c) => c.city),
                datasets: [
                  {
                    label: 'Talents',
                    data: stats?.cityDistribution?.map((c) => c.count),
                    backgroundColor: 'rgba(34,197,94,0.7)',
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: { display: false },
                },
                scales: {
                  x: { title: { display: false } },
                  y: { beginAtZero: true, title: { display: false } },
                },
              }}
              height={250}
            />
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Award className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Category Distribution</h3>
            </div>
            <Bar
              data={{
                labels: stats?.categoryDistribution?.map((c) => c.category),
                datasets: [
                  {
                    label: 'Talents',
                    data: stats?.categoryDistribution?.map((c) => c.count),
                    backgroundColor: 'rgba(168,85,247,0.7)',
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: { display: false },
                },
                scales: {
                  x: { title: { display: false } },
                  y: { beginAtZero: true, title: { display: false } },
                },
              }}
              height={250}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;