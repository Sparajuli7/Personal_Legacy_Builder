import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

const Timeline = ({ timelineData }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!timelineData || !mountRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 10);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create timeline events
    if (timelineData && timelineData.events) {
      timelineData.events.forEach((event, index) => {
        createTimelineEvent(event, index, scene);
      });
    }

    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // Rotate camera slowly
      const time = Date.now() * 0.0001;
      camera.position.x = Math.cos(time) * 10;
      camera.position.z = Math.sin(time) * 10;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
    };
    animate();

    setIsInitialized(true);

    // Handle resize
    const handleResize = () => {
      if (mountRef.current && camera && renderer) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [timelineData]);

  const createTimelineEvent = (event, index, scene) => {
    // Create event sphere
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshLambertMaterial({ 
      color: new THREE.Color().setHSL(index * 0.1, 0.7, 0.6) 
    });
    const sphere = new THREE.Mesh(geometry, material);
    
    // Position along timeline
    sphere.position.set(index * 3, 0, 0);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    
    // Add event data
    sphere.userData = event;
    
    scene.add(sphere);

    // Create connection line
    if (index > 0) {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3((index - 1) * 3, 0, 0),
        new THREE.Vector3(index * 3, 0, 0)
      ]);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x666666 });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);
    }

    // Add text label (simplified)
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#000000';
    context.font = '24px Arial';
    context.textAlign = 'center';
    context.fillText(event.title || `Event ${index + 1}`, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const labelGeometry = new THREE.PlaneGeometry(2, 0.5);
    const labelMaterial = new THREE.MeshBasicMaterial({ 
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.set(index * 3, 1.5, 0);
    scene.add(label);
  };

  return (
    <div className="relative">
      <div 
        ref={mountRef} 
        className="w-full h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl overflow-hidden"
      />
      
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading timeline...</p>
          </div>
        </div>
      )}

      {timelineData && (
        <div className="mt-4 p-4 bg-white rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Timeline Statistics</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Events:</span>
              <span className="ml-2 font-medium">{timelineData.events?.length || 0}</span>
            </div>
            <div>
              <span className="text-gray-600">Duration:</span>
              <span className="ml-2 font-medium">{timelineData.duration?.toFixed(1) || 0}s</span>
            </div>
            <div>
              <span className="text-gray-600">Total Words:</span>
              <span className="ml-2 font-medium">{timelineData.totalWords || 0}</span>
            </div>
            <div>
              <span className="text-gray-600">FPS:</span>
              <span className="ml-2 font-medium">60</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline; 