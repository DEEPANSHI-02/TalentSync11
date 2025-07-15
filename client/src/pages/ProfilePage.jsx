import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { ArrowLeft, ExternalLink } from 'lucide-react';

const ProfilePage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await apiService.getTalent(id);
        setProfile(data.data); // Fix: set profile to the actual talent object
      } catch (err) {
        setError('Profile not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{error}</h3>
          <Link to="/browse" className="btn-primary inline-flex items-center mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <Link to="/browse" className="btn-secondary inline-flex items-center mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Browse
        </Link>
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-xl flex items-center justify-center text-white text-3xl font-bold">
            {profile.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">{profile.name}</h2>
            <div className="text-gray-600 mb-1">{profile.city}</div>
            <div className="flex flex-wrap gap-2 mb-2">
              {profile.categories?.map((cat) => (
                <span key={cat} className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">{cat}</span>
              ))}
            </div>
            <div className="text-sm text-gray-500">Experience: {profile.experience_years} years</div>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills?.map(skill => (
              <span key={skill} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">{skill}</span>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Style Tags</h3>
          <div className="flex flex-wrap gap-2">
            {profile.style_tags?.map(tag => (
              <span key={tag} className="bg-secondary-100 text-secondary-800 text-xs px-2 py-1 rounded">{tag}</span>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget Range</h3>
          <div className="text-gray-700">{profile.budget_range}</div>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Portfolio</h3>
          <ul className="list-disc pl-6">
            {Array.isArray(profile.portfolio) && profile.portfolio.length > 0 ? (
              profile.portfolio.map((item, idx) => (
                <li key={idx} className="mb-2">
                  <span className="font-medium">{item.title}</span> - Tags: {item.tags?.join(', ')}; Keywords: {item.keywords?.join(', ')}
                </li>
              ))
            ) : (
              <li>No portfolio projects listed.</li>
            )}
          </ul>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Platforms</h3>
          <div className="flex flex-wrap gap-2">
            {profile.platforms?.map(platform => (
              <span key={platform} className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded flex items-center">
                <ExternalLink className="w-3 h-3 mr-1" /> {platform}
              </span>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Languages</h3>
          <div className="flex flex-wrap gap-2">
            {profile.languages?.map(lang => (
              <span key={lang} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">{lang}</span>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Endorsements</h3>
          <div className="flex flex-wrap gap-2">
            {profile.endorsements?.map(endorsement => (
              <span key={endorsement} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">{endorsement}</span>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Soft Skills</h3>
          <ul className="list-disc pl-6">
            {profile.soft_skills && Object.entries(profile.soft_skills).map(([skill, value]) => (
              <li key={skill}>{skill}: {value}</li>
            ))}
          </ul>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Software Skills</h3>
          <ul className="list-disc pl-6">
            {profile.software_skills && Object.entries(profile.software_skills).map(([skill, value]) => (
              <li key={skill}>{skill}: {value}</li>
            ))}
          </ul>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Past Credits</h3>
          <ul className="list-disc pl-6">
            {profile.past_credits?.map(credit => (
              <li key={credit}>{credit}</li>
            ))}
          </ul>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Interest Tags</h3>
          <div className="flex flex-wrap gap-2">
            {profile.interest_tags?.map(tag => (
              <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 