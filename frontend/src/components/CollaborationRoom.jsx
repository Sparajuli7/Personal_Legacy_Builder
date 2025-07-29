import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Edit3, Eye, EyeOff, Send } from 'lucide-react';

const CollaborationRoom = ({ isActive, onToggle, socket }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [showCollaborators, setShowCollaborators] = useState(true);

  useEffect(() => {
    if (isActive && socket) {
      // Join collaboration room
      socket.emit('collaboration_join', {
        room: 'legacy-room',
        user_id: 'user-' + Date.now()
      });

      // Listen for user joins
      socket.on('user_joined', (data) => {
        setCollaborators(prev => [...prev, data.user_id]);
      });

      // Listen for story updates
      socket.on('story_updated', (data) => {
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'update',
          content: data.content,
          timestamp: new Date().toLocaleTimeString()
        }]);
      });

      // Listen for chat messages
      socket.on('chat_message', (data) => {
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'chat',
          user: data.user,
          content: data.message,
          timestamp: new Date().toLocaleTimeString()
        }]);
      });

      return () => {
        socket.off('user_joined');
        socket.off('story_updated');
        socket.off('chat_message');
      };
    }
  }, [isActive, socket]);

  const handleSendMessage = () => {
    if (newMessage.trim() && socket) {
      socket.emit('chat_message', {
        room: 'legacy-room',
        user: 'You',
        message: newMessage
      });
      setNewMessage('');
    }
  };

  const handleStoryUpdate = () => {
    if (editContent.trim() && socket) {
      socket.emit('story_update', {
        room: 'legacy-room',
        content: editContent
      });
      setIsEditing(false);
      setEditContent('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isActive) {
    return (
      <div className="text-center">
        <button
          onClick={onToggle}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
        >
          <Users className="w-5 h-5" />
          Start Collaboration
        </button>
        <p className="text-sm text-gray-600 mt-2">
          Invite family members to collaborate on your legacy story
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">Collaboration Room</h3>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            Live
          </span>
        </div>
        <button
          onClick={onToggle}
          className="text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Collaborators Panel */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-800">Active Collaborators</h4>
            <button
              onClick={() => setShowCollaborators(!showCollaborators)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showCollaborators ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          {showCollaborators && (
            <div className="space-y-2">
              {collaborators.length > 0 ? (
                collaborators.map((collaborator, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 p-2 bg-white rounded-lg"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {collaborator.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700">{collaborator}</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full ml-auto"></div>
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No collaborators yet</p>
              )}
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-medium text-gray-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Real-time Chat
            </h4>
          </div>
          
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {messages.length > 0 ? (
              messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${
                    message.type === 'chat' ? 'justify-start' : 'justify-center'
                  }`}
                >
                  {message.type === 'chat' ? (
                    <>
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {message.user.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-800">{message.user}</span>
                          <span className="text-xs text-gray-500">{message.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                          {message.content}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-gray-500 bg-yellow-50 px-3 py-1 rounded-full">
                      {message.content}
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">No messages yet</p>
              </div>
            )}
          </div>
          
          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Story Editing */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-800 flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Collaborative Story Editing
          </h4>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            {isEditing ? 'Cancel' : 'Edit Story'}
          </button>
        </div>
        
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Add to the story collaboratively..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={handleStoryUpdate}
                disabled={!editContent.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Update Story
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            Click "Edit Story" to add content collaboratively. Changes will be visible to all collaborators in real-time.
          </p>
        )}
      </div>

      {/* Collaboration Tips */}
      <div className="bg-blue-50 p-4 rounded-xl">
        <h4 className="font-medium text-blue-800 mb-2">Collaboration Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• All collaborators can see changes in real-time</li>
          <li>• Use the chat to discuss story elements</li>
          <li>• Changes are automatically saved</li>
          <li>• Invite family members via share link</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default CollaborationRoom; 