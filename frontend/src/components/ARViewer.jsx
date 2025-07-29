import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Smartphone, AlertTriangle } from 'lucide-react';

const ARViewer = ({ arSceneData }) => {
  const [isWebXRAvailable, setIsWebXRAvailable] = useState(false);
  const [isARSupported, setIsARSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check WebXR support
    const checkWebXRSupport = async () => {
      if ('xr' in navigator) {
        try {
          const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
          setIsARSupported(isSupported);
          setIsWebXRAvailable(true);
        } catch (error) {
          console.log('WebXR not supported:', error);
          setIsARSupported(false);
          setIsWebXRAvailable(false);
        }
      } else {
        setIsWebXRAvailable(false);
        setIsARSupported(false);
      }
      setIsLoading(false);
    };

    checkWebXRSupport();
  }, []);

  const startARSession = () => {
    if (isARSupported) {
      // This would typically launch the AR session
      console.log('Starting AR session...');
    }
  };

  const renderARScene = () => {
    if (!arSceneData) {
      return (
        <div className="bg-gray-100 rounded-xl p-8 text-center">
          <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No AR scene data available</p>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">AR Scene Preview</h3>
          <p className="text-sm text-gray-600">
            Experience your story in augmented reality
          </p>
        </div>

        {/* A-Frame Scene */}
        <div className="relative bg-black rounded-lg overflow-hidden h-64">
          <a-scene
            embedded
            vr-mode-ui="enabled: false"
            arjs="sourceType: webcam; debugUIEnabled: false;"
            renderer="logarithmicDepthBuffer: true;"
            style={{ height: '100%' }}
          >
            {/* Camera */}
            <a-camera gps-camera rotation-reader></a-camera>

            {/* Scene Background */}
            <a-sky color="#f0f0f0"></a-sky>

            {/* Story Text */}
            {arSceneData.scene?.entities?.map((entity, index) => {
              if (entity.id === 'story-text') {
                return (
                  <a-text
                    key={index}
                    value={entity.text?.value || 'Your story here...'}
                    position={entity.position || "0 1.6 -2"}
                    color={entity.text?.color || "#333333"}
                    width={entity.text?.width || 3}
                    align="center"
                    font="kelsonsans"
                  ></a-text>
                );
              }
              return null;
            })}

            {/* Virtual Room */}
            {arSceneData.scene?.entities?.map((entity, index) => {
              if (entity.id === 'room') {
                return (
                  <a-box
                    key={index}
                    position={entity.position || "0 0 0"}
                    width={entity.geometry?.width || 10}
                    height={entity.geometry?.height || 5}
                    depth={entity.geometry?.depth || 10}
                    color={entity.material?.color || "#ffffff"}
                    transparent={entity.material?.transparent || true}
                    opacity={entity.material?.opacity || 0.1}
                  ></a-box>
                );
              }
              return null;
            })}

            {/* Lighting */}
            <a-light type="ambient" color="#ffffff" intensity="0.6"></a-light>
            <a-light type="directional" position="0 10 5" color="#ffffff" intensity="0.8"></a-light>

            {/* AR Markers */}
            <a-marker preset="hiro">
              <a-box position="0 0.5 0" material="color: yellow;"></a-box>
            </a-marker>

          </a-scene>

          {/* AR Controls Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black bg-opacity-50 rounded-lg p-3 text-white text-center">
              <p className="text-sm">Point your device at a flat surface</p>
            </div>
          </div>
        </div>

        {/* AR Scene Info */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white p-3 rounded-lg">
            <span className="text-gray-600">Entities:</span>
            <span className="ml-2 font-medium">{arSceneData.scene?.entities?.length || 0}</span>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <span className="text-gray-600">Scene Type:</span>
            <span className="ml-2 font-medium">Virtual Room</span>
          </div>
        </div>
      </div>
    );
  };

  const renderWebXRNotSupported = () => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-yellow-600" />
        <h3 className="text-lg font-semibold text-yellow-800">WebXR Not Supported</h3>
      </div>
      <p className="text-yellow-700 mb-4">
        Your device doesn't support WebXR AR experiences. You can still view the 3D scene in your browser.
      </p>
      <div className="space-y-2 text-sm text-yellow-600">
        <p>• Try using a mobile device with ARCore (Android) or ARKit (iOS)</p>
        <p>• Use a WebXR-compatible browser like Chrome or Firefox</p>
        <p>• Enable AR features in your browser settings</p>
      </div>
    </div>
  );

  const renderARControls = () => (
    <div className="mt-4 space-y-3">
      <button
        onClick={startARSession}
        disabled={!isARSupported}
        className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
          isARSupported
            ? 'bg-purple-600 text-white hover:bg-purple-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        <Smartphone className="w-5 h-5" />
        {isARSupported ? 'Start AR Experience' : 'AR Not Available'}
      </button>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">AR Experience Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Point your device at a flat surface</li>
          <li>• Move slowly to maintain tracking</li>
          <li>• Ensure good lighting conditions</li>
          <li>• Keep your device steady</li>
        </ul>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="bg-gray-100 rounded-xl p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Checking AR support...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {renderARScene()}
      
      {!isWebXRAvailable && renderWebXRNotSupported()}
      
      {isWebXRAvailable && renderARControls()}

      {/* Fallback 3D Scene */}
      {!isARSupported && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">3D Scene Preview</h4>
          <p className="text-sm text-gray-600">
            While AR isn't available on your device, you can still experience the 3D scene in your browser.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ARViewer; 