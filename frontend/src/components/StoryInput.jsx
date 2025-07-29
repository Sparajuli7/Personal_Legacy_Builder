import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Send, Volume2, VolumeX } from 'lucide-react';

const StoryInput = ({ onSubmit, isRecording, setIsRecording }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const textareaRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        console.log('Voice recognition started');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('Voice recognition ended');
      };

      setRecognition(recognition);
    }
  }, []);

  const handleVoiceToggle = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser. Please use text input.');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const handleSubmit = () => {
    const content = text + (transcript ? ' ' + transcript : '');
    if (content.trim()) {
      onSubmit(content);
      setText('');
      setTranscript('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [text]);

  return (
    <div className="space-y-4">
      {/* Text Input */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Share your story... What memories do you want to preserve for future generations?"
          className="w-full p-4 border-2 border-gray-200 rounded-xl resize-none focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] text-lg"
          style={{ minHeight: '120px' }}
        />
        
        {/* Character count */}
        <div className="absolute bottom-2 right-2 text-sm text-gray-400">
          {text.length}/2000
        </div>
      </div>

      {/* Voice Input */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleVoiceToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isListening
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          {isListening ? 'Stop Recording' : 'Voice Input'}
        </button>

        {isListening && (
          <div className="flex items-center gap-2 text-red-600">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            Listening...
          </div>
        )}
      </div>

      {/* Transcript Display */}
      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 p-4 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Voice Transcript:</span>
          </div>
          <p className="text-blue-900">{transcript}</p>
        </motion.div>
      )}

      {/* Submit Button */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {text.length > 0 && (
            <span>Ready to create your legacy story</span>
          )}
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={!text.trim() && !transcript.trim()}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            text.trim() || transcript.trim()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Send className="w-5 h-5" />
          Create Story
        </button>
      </div>

      {/* Accessibility Features */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Accessibility Tips:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Press Enter to submit (Shift+Enter for new line)</li>
          <li>• Use voice input for hands-free storytelling</li>
          <li>• Large text and high contrast for easy reading</li>
          <li>• Keyboard navigation supported</li>
        </ul>
      </div>
    </div>
  );
};

export default StoryInput; 