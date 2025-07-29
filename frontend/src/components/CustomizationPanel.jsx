import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Heart, MessageSquare, Save } from 'lucide-react';

const CustomizationPanel = ({ outputs, onBack, onSave }) => {
  const [feedback, setFeedback] = useState({ rating: 0, text: '' });
  const [customizations, setCustomizations] = useState({
    videoStyle: 'modern',
    timelineTheme: 'blue',
    arScene: 'room'
  });

  const videoStyles = [
    { id: 'modern', name: 'Modern', description: 'Clean, minimalist design' },
    { id: 'vintage', name: 'Vintage', description: 'Classic, nostalgic feel' },
    { id: 'dramatic', name: 'Dramatic', description: 'High contrast, bold colors' },
    { id: 'soft', name: 'Soft', description: 'Gentle, warm tones' }
  ];

  const timelineThemes = [
    { id: 'blue', name: 'Ocean Blue', color: 'bg-blue-500' },
    { id: 'purple', name: 'Royal Purple', color: 'bg-purple-500' },
    { id: 'green', name: 'Forest Green', color: 'bg-green-500' },
    { id: 'orange', name: 'Sunset Orange', color: 'bg-orange-500' }
  ];

  const arScenes = [
    { id: 'room', name: 'Virtual Room', description: 'Cozy indoor setting' },
    { id: 'garden', name: 'Memory Garden', description: 'Peaceful outdoor space' },
    { id: 'library', name: 'Story Library', description: 'Classic book-filled space' },
    { id: 'timeline', name: 'Timeline Hall', description: 'Interactive timeline corridor' }
  ];

  const handleRatingChange = (rating) => {
    setFeedback(prev => ({ ...prev, rating }));
  };

  const handleSave = () => {
    onSave(feedback);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Main
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Customize Your Legacy</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Customization */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-600" />
              Video Style
            </h2>
            
            <div className="space-y-3">
              {videoStyles.map((style) => (
                <label
                  key={style.id}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    customizations.videoStyle === style.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="videoStyle"
                    value={style.id}
                    checked={customizations.videoStyle === style.id}
                    onChange={(e) => setCustomizations(prev => ({ ...prev, videoStyle: e.target.value }))}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      customizations.videoStyle === style.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`} />
                    <div>
                      <h3 className="font-medium text-gray-800">{style.name}</h3>
                      <p className="text-sm text-gray-600">{style.description}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Timeline Customization */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-blue-600" />
              Timeline Theme
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              {timelineThemes.map((theme) => (
                <label
                  key={theme.id}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    customizations.timelineTheme === theme.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="timelineTheme"
                    value={theme.id}
                    checked={customizations.timelineTheme === theme.id}
                    onChange={(e) => setCustomizations(prev => ({ ...prev, timelineTheme: e.target.value }))}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${theme.color}`} />
                    <span className="font-medium text-gray-800">{theme.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* AR Scene Customization */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-purple-600" />
              AR Scene
            </h2>
            
            <div className="space-y-3">
              {arScenes.map((scene) => (
                <label
                  key={scene.id}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    customizations.arScene === scene.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="arScene"
                    value={scene.id}
                    checked={customizations.arScene === scene.id}
                    onChange={(e) => setCustomizations(prev => ({ ...prev, arScene: e.target.value }))}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      customizations.arScene === scene.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`} />
                    <div>
                      <h3 className="font-medium text-gray-800">{scene.name}</h3>
                      <p className="text-sm text-gray-600">{scene.description}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Feedback Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-600" />
              Share Your Feedback
            </h2>
            
            <div className="space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How would you rate your experience?
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingChange(star)}
                      className={`p-2 rounded-lg transition-colors ${
                        feedback.rating >= star
                          ? 'text-yellow-500 bg-yellow-50'
                          : 'text-gray-300 hover:text-yellow-400'
                      }`}
                    >
                      <Star className="w-6 h-6" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Feedback */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional comments (optional)
                </label>
                <textarea
                  value={feedback.text}
                  onChange={(e) => setFeedback(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Tell us what you think about your legacy creation experience..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                  rows={4}
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Customizations & Feedback
              </button>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-green-600" />
            Preview Your Customizations
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Video Style</h3>
              <p className="text-sm text-gray-600">
                {videoStyles.find(s => s.id === customizations.videoStyle)?.name}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Timeline Theme</h3>
              <p className="text-sm text-gray-600">
                {timelineThemes.find(t => t.id === customizations.timelineTheme)?.name}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">AR Scene</h3>
              <p className="text-sm text-gray-600">
                {arScenes.find(s => s.id === customizations.arScene)?.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CustomizationPanel; 