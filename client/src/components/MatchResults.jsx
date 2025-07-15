import React from 'react';
import { Star, MapPin, Clock, ExternalLink, Award, TrendingUp, ThumbsUp, ThumbsDown, Bookmark, BookmarkCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const getFeedback = (id) => {
  const stored = localStorage.getItem('talentFeedback');
  if (!stored) return {};
  return JSON.parse(stored)[id] || {};
};

const setFeedback = (id, feedback) => {
  const stored = localStorage.getItem('talentFeedback');
  let all = stored ? JSON.parse(stored) : {};
  all[id] = feedback;
  localStorage.setItem('talentFeedback', JSON.stringify(all));
};

const MatchResults = ({ results, searchParams }) => {
  const [feedbackMap, setFeedbackMap] = useState({});
  const [showModal, setShowModal] = useState(null); // talent id or null
  const [toast, setToast] = useState('');
  // Fetch feedback for all matches on mount
  useEffect(() => {
    const fetchAllFeedback = async () => {
      if (!results?.matches) return;
      const map = {};
      await Promise.all(results.matches.map(async (match) => {
        try {
          const res = await apiService.getMatchHistory(match.id);
          if (res.success && res.data.length > 0) {
            // Use the most recent feedback
            map[match.id] = res.data[res.data.length - 1];
          }
        } catch {}
      }));
      setFeedbackMap(map);
    };
    fetchAllFeedback();
  }, [results]);

  const handleFeedback = async (match, type) => {
    const feedback = {
      talent_id: match.id,
      feedback_type: type, // 'like', 'dislike', 'bookmark'
      timestamp: new Date().toISOString()
    };
    if (type === 'bookmark') {
      feedback.bookmark = !(feedbackMap[match.id]?.bookmark);
    }
    if (type === 'like') {
      feedback.like = true;
      feedback.dislike = false;
    }
    if (type === 'dislike') {
      feedback.like = false;
      feedback.dislike = true;
    }
    await apiService.postMatchFeedback(feedback);
    // Refresh feedback for this match
    const res = await apiService.getMatchHistory(match.id);
    if (res.success && res.data.length > 0) {
      setFeedbackMap(f => ({ ...f, [match.id]: res.data[res.data.length - 1] }));
    }
  };

  const handleContactSubmit = (e, match) => {
    e.preventDefault();
    setShowModal(null);
    setToast('Message sent!');
    setTimeout(() => setToast(''), 2000);
  };

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

  // Helper to extract and highlight matched skills/styles from reason
  const parseMatchReason = (reason, searchParams) => {
    const skillMatch = reason.match(/(\d+) skill[s]? matched \(\+\d+\)/);
    const styleMatch = reason.match(/(\d+) style[s]? matched \(\+\d+\)/);
    let matchedSkills = [];
    let matchedStyles = [];
    if (skillMatch && searchParams?.skills) {
      // Show all searched skills as matched if any skill match
      matchedSkills = searchParams.skills;
    }
    if (styleMatch && searchParams?.style_preferences) {
      matchedStyles = searchParams.style_preferences;
    }
    return { matchedSkills, matchedStyles };
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
          const { matchedSkills, matchedStyles } = parseMatchReason(match.reason, searchParams);
          const feedback = feedbackMap[match.id] || {};
          
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
                    <p className="text-sm text-gray-600 mb-2">{match.reason}</p>
                    {/* Highlight matched skills */}
                    {matchedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-1">
                        {matchedSkills.map(skill => (
                          <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{skill}</span>
                        ))}
                      </div>
                    )}
                    {/* Highlight matched styles */}
                    {matchedStyles.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {matchedStyles.map(style => (
                          <span key={style} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">{style}</span>
                        ))}
                      </div>
                    )}
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
                  <div className="mt-4 flex space-x-3 items-center">
                    <Link to={`/profile/${match.id}`} className="btn-primary flex items-center space-x-2">
                      <span>View Full Profile</span>
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button className="btn-secondary" onClick={() => setShowModal(match.id)}>
                      Contact Now
                    </button>
                    {/* Feedback/Bookmark */}
                    <button
                      className={`ml-2 p-2 rounded-full ${feedback.like ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100 text-gray-400'}`}
                      title="Thumbs Up"
                      onClick={() => handleFeedback(match, 'like')}
                    >
                      <ThumbsUp className="w-5 h-5" />
                    </button>
                    <button
                      className={`ml-1 p-2 rounded-full ${feedback.dislike ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100 text-gray-400'}`}
                      title="Thumbs Down"
                      onClick={() => handleFeedback(match, 'dislike')}
                    >
                      <ThumbsDown className="w-5 h-5" />
                    </button>
                    <button
                      className={`ml-1 p-2 rounded-full ${feedback.bookmark ? 'bg-yellow-100 text-yellow-700' : 'hover:bg-gray-100 text-gray-400'}`}
                      title={feedback.bookmark ? 'Bookmarked' : 'Bookmark'}
                      onClick={() => handleFeedback(match, 'bookmark')}
                    >
                      {feedback.bookmark ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                    </button>
                  </div>
                  {/* Show past feedback if available */}
                  {feedback.feedback_type && (
                    <div className="mt-2 text-xs text-gray-500">Last feedback: {feedback.feedback_type}{feedback.bookmark ? ' (bookmarked)' : ''}</div>
                  )}
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

      {/* Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative animate-fade-in">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowModal(null)}>&times;</button>
            <h3 className="text-xl font-bold mb-4">Contact {results.matches.find(m => m.id === showModal)?.name}</h3>
            <form onSubmit={e => handleContactSubmit(e, results.matches.find(m => m.id === showModal))} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Your Name</label>
                <input type="text" className="form-input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Your Email</label>
                <input type="email" className="form-input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea className="form-input" rows={3} required></textarea>
              </div>
              <button type="submit" className="btn-primary w-full">Send Message</button>
            </form>
          </div>
        </div>
      )}
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50">
          {toast}
        </div>
      )}
    </div>
  );
};

export default MatchResults;