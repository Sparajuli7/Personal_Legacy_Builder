import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Share2, 
  Download, 
  Globe, 
  Users,
  Trophy,
  BookOpen,
  Heart,
  Star
} from 'lucide-react';
import io from 'socket.io-client';
import axios from 'axios';
import CryptoJS from 'crypto-js';

// Import components
import OnboardingTutorial from './components/OnboardingTutorial';
import StoryInput from './components/StoryInput';
import QueryInterface from './components/QueryInterface';
import OutputViewer from './components/OutputViewer';
import CustomizationPanel from './components/CustomizationPanel';
import CollaborationRoom from './components/CollaborationRoom';
import Timeline from './components/Timeline';
import ARViewer from './components/ARViewer';
import { initializeAuth, signInWithGoogle, signOut } from './auth';
import { saveToIndexedDB, loadFromIndexedDB } from './storage';

// Initialize Socket.IO
const socket = io('http://localhost:5000');

function App() {
  const [currentStep, setCurrentStep] = useState('onboarding');
  const [user, setUser] = useState(null);
  const [storyContent, setStoryContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [aiQuestions, setAiQuestions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('North America');
  const [outputs, setOutputs] = useState({
    video: null,
    timeline: null,
    arScene: null
  });
  const [badges, setBadges] = useState([]);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 0, text: '' });

  // Initialize Firebase Auth
  useEffect(() => {
    const initApp = async () => {
      try {
        await initializeAuth();
        // Check for existing user session
        const savedUser = localStorage.getItem('legacy_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          setCurrentStep('main');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
    };
    initApp();
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    handleOnlineStatus();

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  // Socket.IO event handlers
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('story_updated', (data) => {
      console.log('Story updated:', data);
      // Handle real-time story updates
    });

    socket.on('user_joined', (data) => {
      console.log('User joined:', data);
    });

    return () => {
      socket.off('connect');
      socket.off('story_updated');
      socket.off('user_joined');
    };
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await signInWithGoogle();
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL
      };
      setUser(userData);
      localStorage.setItem('legacy_user', JSON.stringify(userData));
      setCurrentStep('main');
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      localStorage.removeItem('legacy_user');
      setCurrentStep('onboarding');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleStorySubmit = async (content) => {
    try {
      setStoryContent(content);
      
      // Save to IndexedDB for offline mode
      await saveToIndexedDB('stories', {
        id: Date.now(),
        content,
        timestamp: new Date().toISOString()
      });

      // Process with AI
      const response = await axios.post('/api/prompt', {
        text: content
      });

      if (response.data.story_id) {
        // Generate AI questions
        const questionsResponse = await axios.post('/api/query', {
          content,
          region: selectedRegion
        });

        setAiQuestions(questionsResponse.data.questions);
        setCurrentStep('queries');

        // Award badge for first story
        if (!badges.find(b => b.name === 'Story Teller')) {
          setBadges(prev => [...prev, { name: 'Story Teller', earned: true, icon: BookOpen }]);
        }
      }
    } catch (error) {
      console.error('Story submission error:', error);
      // Handle offline mode
      if (isOffline) {
        setCurrentStep('queries');
      }
    }
  };

  const handleGenerateOutputs = async () => {
    try {
      const response = await axios.post('/api/generate', {
        content: storyContent,
        story_id: Date.now()
      });

      setOutputs({
        video: response.data.video,
        timeline: response.data.timeline,
        arScene: response.data.ar_scene
      });

      setCurrentStep('outputs');

      // Award badge for multimedia creation
      if (!badges.find(b => b.name === 'Multimedia Creator')) {
        setBadges(prev => [...prev, { name: 'Multimedia Creator', earned: true, icon: Play }]);
      }
    } catch (error) {
      console.error('Output generation error:', error);
    }
  };

  const handleShare = async (platform) => {
    try {
      const response = await axios.post('/api/share', {
        story_id: Date.now(),
        platform
      });

      // Create shareable link
      const shareUrl = response.data.share_url;
      
      if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=Check out my legacy story!&url=${encodeURIComponent(shareUrl)}`);
      } else if (platform === 'instagram') {
        // Instagram sharing (would need to be implemented with Instagram API)
        alert('Instagram sharing coming soon!');
      } else {
        // Email sharing
        window.open(`mailto:?subject=My Legacy Story&body=Check out my legacy story: ${shareUrl}`);
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleFeedback = async () => {
    try {
      await axios.post('/api/feedback', {
        story_id: Date.now(),
        rating: feedback.rating,
        feedback_text: feedback.text
      });

      // Award badge for feedback
      if (!badges.find(b => b.name === 'Feedback Provider')) {
        setBadges(prev => [...prev, { name: 'Feedback Provider', earned: true, icon: Heart }]);
      }
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'onboarding':
        return (
          <OnboardingTutorial 
            onComplete={() => setCurrentStep('auth')}
          />
        );

      case 'auth':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50"
          >
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
              <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
                Personal Legacy Builder
              </h1>
              <p className="text-gray-600 text-center mb-8">
                Create your digital legacy with AI-powered storytelling
              </p>
              <button
                onClick={handleGoogleSignIn}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Globe className="w-5 h-5" />
                Continue with Google
              </button>
            </div>
          </motion.div>
        );

      case 'main':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                  <h1 className="text-2xl font-bold text-gray-800">
                    Legacy Builder
                  </h1>
                  <div className="flex items-center gap-4">
                    {isOffline && (
                      <span className="text-orange-600 text-sm">Offline Mode</span>
                    )}
                    <div className="flex items-center gap-2">
                      {badges.map((badge, index) => (
                        <motion.div
                          key={badge.name}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-yellow-100 p-2 rounded-full"
                          title={badge.name}
                        >
                          <badge.icon className="w-4 h-4 text-yellow-600" />
                        </motion.div>
                      ))}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Story Input */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h2 className="text-xl font-semibold mb-4">Tell Your Story</h2>
                  <StoryInput 
                    onSubmit={handleStorySubmit}
                    isRecording={isRecording}
                    setIsRecording={setIsRecording}
                  />
                </div>

                {/* AI Questions */}
                {aiQuestions.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h2 className="text-xl font-semibold mb-4">AI-Generated Questions</h2>
                    <QueryInterface 
                      questions={aiQuestions}
                      region={selectedRegion}
                      onRegionChange={setSelectedRegion}
                    />
                  </div>
                )}

                {/* Outputs */}
                {outputs.video && (
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h2 className="text-xl font-semibold mb-4">Your Legacy Outputs</h2>
                    <OutputViewer 
                      outputs={outputs}
                      onShare={handleShare}
                    />
                  </div>
                )}

                {/* Collaboration */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h2 className="text-xl font-semibold mb-4">Collaborate</h2>
                  <CollaborationRoom 
                    isActive={isCollaborating}
                    onToggle={() => setIsCollaborating(!isCollaborating)}
                    socket={socket}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-center gap-4">
                {storyContent && (
                  <button
                    onClick={handleGenerateOutputs}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Generate Legacy
                  </button>
                )}
                
                <button
                  onClick={() => setCurrentStep('customization')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Star className="w-5 h-5" />
                  Customize
                </button>
              </div>
            </main>
          </div>
        );

      case 'customization':
        return (
          <CustomizationPanel 
            outputs={outputs}
            onBack={() => setCurrentStep('main')}
            onSave={handleFeedback}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="App">
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
}

export default App; 