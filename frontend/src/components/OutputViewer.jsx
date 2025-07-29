import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Share2, Download, Eye, Smartphone, Monitor } from 'lucide-react';

const OutputViewer = ({ outputs, onShare }) => {
  const [activeTab, setActiveTab] = useState('video');
  const [isPlaying, setIsPlaying] = useState(false);

  const tabs = [
    { id: 'video', name: 'Video', icon: Play },
    { id: 'timeline', name: 'Timeline', icon: Monitor },
    { id: 'ar', name: 'AR Experience', icon: Smartphone }
  ];

  const handleShare = (platform) => {
    onShare(platform);
  };

  const renderVideoOutput = () => (
    <div className="space-y-4">
      <div className="bg-black rounded-xl overflow-hidden">
        {outputs.video ? (
          <video
            controls
            className="w-full h-64 object-cover"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src={`data:video/mp4;base64,${outputs.video}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="w-full h-64 bg-gray-800 flex items-center justify-center">
            <div className="text-center text-white">
              <Play className="w-12 h-12 mx-auto mb-2" />
              <p>Video generation in progress...</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {outputs.video ? '1080p MP4 • 2-3MB' : 'Generating...'}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleShare('twitter')}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            <Share2 className="w-4 h-4" />
            Share on X
          </button>
          <button
            onClick={() => handleShare('instagram')}
            className="flex items-center gap-2 px-3 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm"
          >
            <Share2 className="w-4 h-4" />
            Instagram
          </button>
        </div>
      </div>
    </div>
  );

  const renderTimelineOutput = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
        <h4 className="font-semibold text-gray-800 mb-4">Interactive Timeline</h4>
        {outputs.timeline ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Total Events: {outputs.timeline.events?.length || 0}</span>
              <span>Duration: {outputs.timeline.duration?.toFixed(1) || 0}s</span>
            </div>
            
            <div className="space-y-2">
              {outputs.timeline.events?.slice(0, 5).map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-3 rounded-lg border-l-4 border-blue-500"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800">{event.title}</h5>
                      <p className="text-sm text-gray-600">{event.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <Monitor className="w-12 h-12 mx-auto mb-2" />
            <p>Timeline generation in progress...</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {outputs.timeline ? 'Three.js • 60 FPS' : 'Generating...'}
        </div>
        <button
          onClick={() => handleShare('email')}
          className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
        >
          <Share2 className="w-4 h-4" />
          Email Link
        </button>
      </div>
    </div>
  );

  const renderAROutput = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
        <h4 className="font-semibold text-gray-800 mb-4">AR Experience</h4>
        {outputs.arScene ? (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-800">Virtual Room Scene</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Experience your story in augmented reality. Point your device at a flat surface to place the virtual room.
              </p>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-purple-100 p-2 rounded">
                  <span className="font-medium text-purple-800">Entities:</span>
                  <p className="text-purple-700">{outputs.arScene.scene?.entities?.length || 0}</p>
                </div>
                <div className="bg-pink-100 p-2 rounded">
                  <span className="font-medium text-pink-800">Scene Type:</span>
                  <p className="text-pink-700">Virtual Room</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> AR experience requires WebXR-compatible device. 
                On mobile, use AR mode in your browser.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <Smartphone className="w-12 h-12 mx-auto mb-2" />
            <p>AR scene generation in progress...</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {outputs.arScene ? 'A-Frame • WebXR' : 'Generating...'}
        </div>
        <button
          onClick={() => handleShare('email')}
          className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
        >
          <Share2 className="w-4 h-4" />
          Share AR Link
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'video':
        return renderVideoOutput();
      case 'timeline':
        return renderTimelineOutput();
      case 'ar':
        return renderAROutput();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>

      {/* Download Options */}
      <div className="bg-gray-50 p-4 rounded-xl">
        <h4 className="font-medium text-gray-800 mb-3">Download Options</h4>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
            <Download className="w-4 h-4" />
            Video (MP4)
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
            <Download className="w-4 h-4" />
            Timeline (JSON)
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
            <Download className="w-4 h-4" />
            AR Scene (GLB)
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutputViewer; 