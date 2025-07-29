import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle, Play, Mic, Share2 } from 'lucide-react';

const OnboardingTutorial = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Your Legacy Builder",
      description: "Create meaningful digital stories that will be cherished by future generations.",
      icon: CheckCircle,
      color: "bg-blue-500"
    },
    {
      title: "Tell Your Story",
      description: "Share your memories through text or voice. Our AI will help you explore deeper themes.",
      icon: Mic,
      color: "bg-green-500"
    },
    {
      title: "AI-Powered Insights",
      description: "Get personalized questions and cultural context to enrich your narrative.",
      icon: Play,
      color: "bg-purple-500"
    },
    {
      title: "Create & Share",
      description: "Generate beautiful videos, interactive timelines, and AR experiences to share with loved ones.",
      icon: Share2,
      color: "bg-orange-500"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600">Step {currentStep + 1} of {steps.length}</span>
            <button
              onClick={handleSkip}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Skip Tutorial
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${steps[currentStep].color} mb-6`}>
            <steps[currentStep].icon className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {steps[currentStep].title}
          </h2>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {steps[currentStep].description}
          </p>

          {/* Accessibility Features */}
          <div className="bg-blue-50 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-blue-800 mb-2">Accessibility Features</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• High contrast text and large buttons</li>
              <li>• Voice input support for hands-free storytelling</li>
              <li>• Keyboard navigation for all features</li>
              <li>• Screen reader compatible interface</li>
            </ul>
          </div>
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Keyboard Navigation Hints */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Use arrow keys to navigate • Press Enter to continue</p>
        </div>
      </div>
    </motion.div>
  );
};

export default OnboardingTutorial; 