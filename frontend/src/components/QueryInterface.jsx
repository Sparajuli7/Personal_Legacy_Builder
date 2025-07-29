import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, ChevronDown, ChevronUp, Lightbulb, Users, Heart } from 'lucide-react';

const QueryInterface = ({ questions, region, onRegionChange }) => {
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const regions = [
    { id: 'North America', name: 'North America', icon: '🇺🇸' },
    { id: 'Asia-Pacific', name: 'Asia-Pacific', icon: '🌏' },
    { id: 'Europe', name: 'Europe', icon: '🇪🇺' },
    { id: 'Africa', name: 'Africa', icon: '🌍' },
    { id: 'Latin America', name: 'Latin America', icon: '🌎' }
  ];

  const culturalContexts = {
    'North America': {
      tone: 'Individualist',
      focus: 'Personal achievements and family values',
      icon: Users
    },
    'Asia-Pacific': {
      tone: 'Collectivist',
      focus: 'Family traditions and community support',
      icon: Heart
    },
    'Europe': {
      tone: 'Balanced',
      focus: 'Historical context and cultural experiences',
      icon: Globe
    },
    'Africa': {
      tone: 'Community-focused',
      focus: 'Extended family and traditional practices',
      icon: Users
    },
    'Latin America': {
      tone: 'Family-oriented',
      focus: 'Migration stories and cultural celebrations',
      icon: Heart
    }
  };

  const toggleQuestion = (index) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const toggleQuestionSelection = (question) => {
    setSelectedQuestions(prev => {
      if (prev.includes(question)) {
        return prev.filter(q => q !== question);
      } else {
        return [...prev, question];
      }
    });
  };

  const currentContext = culturalContexts[region];

  return (
    <div className="space-y-6">
      {/* Region Selector */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <Globe className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Cultural Context</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {regions.map((reg) => (
            <button
              key={reg.id}
              onClick={() => onRegionChange(reg.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                region === reg.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{reg.icon}</span>
              {reg.name}
            </button>
          ))}
        </div>

        {/* Cultural Context Info */}
        <div className="mt-4 p-3 bg-white rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <currentContext.icon className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-800">{currentContext.tone} Approach</span>
          </div>
          <p className="text-sm text-gray-600">{currentContext.focus}</p>
        </div>
      </div>

      {/* AI Questions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-6 h-6 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-800">AI-Generated Questions</h3>
        </div>

        <div className="space-y-3">
          {questions.map((question, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <span className="font-medium text-gray-800">{question}</span>
                </div>
                {expandedQuestions.has(index) ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedQuestions.has(index) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-4"
                >
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800 mb-3">
                      This question is designed to help you explore deeper themes in your story.
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`question-${index}`}
                        checked={selectedQuestions.includes(question)}
                        onChange={() => toggleQuestionSelection(question)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`question-${index}`} className="text-sm text-blue-700">
                        Include this question in my story
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Selected Questions Summary */}
      {selectedQuestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 p-4 rounded-xl"
        >
          <h4 className="font-medium text-green-800 mb-2">
            Selected Questions ({selectedQuestions.length})
          </h4>
          <ul className="space-y-1">
            {selectedQuestions.map((question, index) => (
              <li key={index} className="text-sm text-green-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {question}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Cultural Sensitivity Note */}
      <div className="bg-yellow-50 p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-yellow-600" />
          <span className="font-medium text-yellow-800">Cultural Sensitivity</span>
        </div>
        <p className="text-sm text-yellow-700">
          Our AI adapts questions based on cultural context to ensure your story resonates with your heritage and values.
        </p>
      </div>
    </div>
  );
};

export default QueryInterface; 