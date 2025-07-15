import React, { useState, useEffect } from 'react';
import { Search, MapPin, DollarSign, Palette, Plus, X } from 'lucide-react';

const SearchForm = ({ onSubmit, loading, initialValues }) => {
  const [formData, setFormData] = useState(initialValues || {
    location: '',
    skills: [],
    budget: '',
    style_preferences: []
  });

  useEffect(() => {
    if (initialValues) {
      setFormData({
        location: initialValues.location || '',
        skills: initialValues.skills || [],
        budget: initialValues.budget || '',
        style_preferences: initialValues.style_preferences || []
      });
    }
  }, [initialValues]);

  const [skillInput, setSkillInput] = useState('');
  const [styleInput, setStyleInput] = useState('');

  const commonSkills = [
    'Fashion Shoots', 'Weddings', 'Corporate Shoots', 'Portrait', 
    'Documentaries', 'Branding', 'Social Media', 'Lifestyle'
  ];

  const commonStyles = [
    'documentary', 'candid', 'editorial', 'bold', 'minimal', 
    'cinematic', 'vibrant', 'classic', 'natural', 'artistic'
  ];

  const cities = [
    'Mumbai', 'Delhi', 'Goa', 'Chennai', 'Bangalore', 
    'Hyderabad', 'Pune', 'Kolkata'
  ];

  const handleAddSkill = (skill) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      setSkillInput('');
    }
  };

  const handleAddStyle = (style) => {
    if (style && !formData.style_preferences.includes(style)) {
      setFormData(prev => ({
        ...prev,
        style_preferences: [...prev.style_preferences, style]
      }));
      setStyleInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const removeStyle = (styleToRemove) => {
    setFormData(prev => ({
      ...prev,
      style_preferences: prev.style_preferences.filter(style => style !== styleToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.location || formData.skills.length === 0 || !formData.budget || formData.style_preferences.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit({
      ...formData,
      budget: parseInt(formData.budget)
    });
  };

  return (
    <div className="card max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Find Your Perfect Creative Match</h2>
        <p className="text-gray-600">Tell us what you're looking for and we'll find the best talent for your project</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location */}
        <div>
          <label className="form-label">
            <MapPin className="w-4 h-4 inline mr-2" />
            Location *
          </label>
          <select
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="form-input"
            required
          >
            <option value="">Select a city</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Skills */}
        <div>
          <label className="form-label">
            <Search className="w-4 h-4 inline mr-2" />
            Required Skills * ({formData.skills.length} selected)
          </label>
          
          {/* Selected Skills */}
          {formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.skills.map(skill => (
                <span key={skill} className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm flex items-center">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Skill Input */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Type a skill or select from below"
              className="form-input flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill(skillInput);
                }
              }}
            />
            <button
              type="button"
              onClick={() => handleAddSkill(skillInput)}
              className="btn-primary"
              disabled={!skillInput}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Common Skills */}
          <div className="flex flex-wrap gap-2">
            {commonSkills.filter(skill => !formData.skills.includes(skill)).map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => handleAddSkill(skill)}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
              >
                + {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="form-label">
            <DollarSign className="w-4 h-4 inline mr-2" />
            Budget (₹) *
          </label>
          <input
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
            placeholder="e.g., 75000"
            className="form-input"
            min="1000"
            max="10000000"
            required
          />
          <p className="text-sm text-gray-500 mt-1">Enter your project budget in Indian Rupees</p>
        </div>

        {/* Style Preferences */}
        <div>
          <label className="form-label">
                        <Palette className="w-4 h-4 inline mr-2" />
            Style Preferences * ({formData.style_preferences.length} selected)
          </label>
          
          {/* Selected Styles */}
          {formData.style_preferences.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.style_preferences.map(style => (
                <span key={style} className="bg-secondary-100 text-secondary-800 px-3 py-1 rounded-full text-sm flex items-center">
                  {style}
                  <button
                    type="button"
                    onClick={() => removeStyle(style)}
                    className="ml-2 text-secondary-600 hover:text-secondary-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Style Input */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={styleInput}
              onChange={(e) => setStyleInput(e.target.value)}
              placeholder="Type a style or select from below"
              className="form-input flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddStyle(styleInput);
                }
              }}
            />
            <button
              type="button"
              onClick={() => handleAddStyle(styleInput)}
              className="btn-primary"
              disabled={!styleInput}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Common Styles */}
          <div className="flex flex-wrap gap-2">
            {commonStyles.filter(style => !formData.style_preferences.includes(style)).map(style => (
              <button
                key={style}
                type="button"
                onClick={() => handleAddStyle(style)}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
              >
                + {style}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Finding Perfect Matches...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Find My Creative Match</span>
            </div>
          )}
        </button>
      </form>
    </div>
  );
};

export default SearchForm;