import React from 'react';
import { Star, MapPin, Clock, ExternalLink, Award, TrendingUp } from 'lucide-react';

const MatchResults = ({ results, searchParams }) => {
  if (!results || !results.matches || results.matches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
        <p className="text-gray-500">Try adjusting your search criteria or budget range</p>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    if (score >= 4) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreBadge = (score) => {
    if (score >= 9) return { label: 'Perfect Match', color: 'bg-green-500' };
    if (score >= 7) return { label: 'Great Match', color: 'bg-blue-500' };
    if (score >= 5) return { label: 'Good Match', color: 'bg-yellow-500' };
    return { label: 'Potential Match', color: 'bg-gray-500' };
  };

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🎯 Found {results.matches.length} Perfect Match{results.matches.length > 1 ? 'es' : ''}
            </h2>
            <p className="text-gray-600">
              Evaluated {results.metadata.total_evaluated} talents in {results.metadata.processing_time_ms}ms
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Searching for</div>
            <div className="font-medium text-gray-900">{searchParams.location}</div>
            <div className="text-sm text-gray-600">₹{searchParams.budget.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Match Cards */}
      <div className="grid gap-6">
        {results.matches.map((match, index) => {
          const scoreBadge = getScoreBadge(match.score);
          
          return (
            <div key={index} className="card relative overflow-hidden">
              {/* Rank Badge */}
              <div className="absolute top-4 right-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${scoreBadge.color} text-white`}>
                    #{index + 1} {scoreBadge.label}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                {/* Avatar */}
                <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {match.name.split(' ').map(n => n[0]).join('')}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{match.name}</h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(match.score)}`}>
                      {match.score} points
                    </div>
                  </div>

                  {/* Matching Breakdown */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Match Breakdown:</span>
                    </div>
                    <p className="text-sm text-gray-600">{match.reason}</p>
                  </div>

                  {/* Portfolio */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      <span>Portfolio: {match.portfolio}</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      <span>Professional Creative</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 flex space-x-3">
                    <button className="btn-primary flex items-center space-x-2">
                      <span>View Full Profile</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button className="btn-secondary">
                      Contact Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search Again */}
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Not finding what you're looking for?</p>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="btn-primary"
        >
          Refine Your Search
        </button>
      </div>
    </div>
  );
};

export default MatchResults;