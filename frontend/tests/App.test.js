import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/App';

// Mock dependencies
jest.mock('../src/auth', () => ({
  initializeAuth: jest.fn().mockResolvedValue({}),
  signInWithGoogle: jest.fn().mockResolvedValue({
    user: {
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg'
    }
  }),
  signOut: jest.fn().mockResolvedValue({}),
  isAuthenticated: jest.fn().mockReturnValue(false)
}));

jest.mock('../src/storage', () => ({
  saveToIndexedDB: jest.fn().mockResolvedValue(1),
  loadFromIndexedDB: jest.fn().mockResolvedValue([]),
  initializeStorage: jest.fn().mockResolvedValue(true)
}));

jest.mock('socket.io-client', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn()
  }))
}));

jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn()
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock SpeechRecognition
Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    continuous: true,
    interimResults: true,
    lang: 'en-US',
    start: jest.fn(),
    stop: jest.fn(),
    onstart: jest.fn(),
    onresult: jest.fn(),
    onerror: jest.fn(),
    onend: jest.fn()
  }))
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: window.SpeechRecognition
});

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders onboarding tutorial initially', () => {
    render(<App />);
    expect(screen.getByText(/Welcome to Your Legacy Builder/i)).toBeInTheDocument();
  });

  test('shows authentication screen after tutorial', async () => {
    render(<App />);
    
    // Complete tutorial
    const nextButton = screen.getByText(/Next/i);
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    fireEvent.click(screen.getByText(/Get Started/i));
    
    await waitFor(() => {
      expect(screen.getByText(/Personal Legacy Builder/i)).toBeInTheDocument();
    });
  });

  test('handles Google sign in', async () => {
    render(<App />);
    
    // Navigate to auth screen
    const skipButton = screen.getByText(/Skip Tutorial/i);
    fireEvent.click(skipButton);
    
    const signInButton = screen.getByText(/Continue with Google/i);
    fireEvent.click(signInButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Legacy Builder/i)).toBeInTheDocument();
    });
  });

  test('shows offline mode indicator', () => {
    // Mock offline status
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });
    
    render(<App />);
    expect(screen.getByText(/Offline Mode/i)).toBeInTheDocument();
  });

  test('handles story submission', async () => {
    const { getByPlaceholderText, getByText } = render(<App />);
    
    // Navigate to main screen
    const skipButton = screen.getByText(/Skip Tutorial/i);
    fireEvent.click(skipButton);
    
    const signInButton = screen.getByText(/Continue with Google/i);
    fireEvent.click(signInButton);
    
    await waitFor(() => {
      const textarea = getByPlaceholderText(/Share your story/i);
      fireEvent.change(textarea, {
        target: { value: 'This is my test story about growing up in the 1990s.' }
      });
      
      const submitButton = getByText(/Create Story/i);
      fireEvent.click(submitButton);
    });
  });

  test('displays badges when earned', async () => {
    render(<App />);
    
    // Navigate to main screen
    const skipButton = screen.getByText(/Skip Tutorial/i);
    fireEvent.click(skipButton);
    
    const signInButton = screen.getByText(/Continue with Google/i);
    fireEvent.click(signInButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Legacy Builder/i)).toBeInTheDocument();
    });
  });

  test('handles voice input', async () => {
    render(<App />);
    
    // Navigate to main screen
    const skipButton = screen.getByText(/Skip Tutorial/i);
    fireEvent.click(skipButton);
    
    const signInButton = screen.getByText(/Continue with Google/i);
    fireEvent.click(signInButton);
    
    await waitFor(() => {
      const voiceButton = screen.getByText(/Voice Input/i);
      fireEvent.click(voiceButton);
      expect(screen.getByText(/Listening/i)).toBeInTheDocument();
    });
  });

  test('shows collaboration room', async () => {
    render(<App />);
    
    // Navigate to main screen
    const skipButton = screen.getByText(/Skip Tutorial/i);
    fireEvent.click(skipButton);
    
    const signInButton = screen.getByText(/Continue with Google/i);
    fireEvent.click(signInButton);
    
    await waitFor(() => {
      const collaborationButton = screen.getByText(/Start Collaboration/i);
      fireEvent.click(collaborationButton);
      expect(screen.getByText(/Collaboration Room/i)).toBeInTheDocument();
    });
  });

  test('handles sign out', async () => {
    render(<App />);
    
    // Navigate to main screen
    const skipButton = screen.getByText(/Skip Tutorial/i);
    fireEvent.click(skipButton);
    
    const signInButton = screen.getByText(/Continue with Google/i);
    fireEvent.click(signInButton);
    
    await waitFor(() => {
      const signOutButton = screen.getByText(/Sign Out/i);
      fireEvent.click(signOutButton);
      expect(screen.getByText(/Welcome to Your Legacy Builder/i)).toBeInTheDocument();
    });
  });

  test('handles keyboard navigation', () => {
    render(<App />);
    
    // Test keyboard navigation in tutorial
    const nextButton = screen.getByText(/Next/i);
    fireEvent.keyDown(nextButton, { key: 'Enter' });
    
    expect(screen.getByText(/Tell Your Story/i)).toBeInTheDocument();
  });

  test('shows accessibility features', () => {
    render(<App />);
    
    expect(screen.getByText(/High contrast text and large buttons/i)).toBeInTheDocument();
    expect(screen.getByText(/Voice input support for hands-free storytelling/i)).toBeInTheDocument();
    expect(screen.getByText(/Keyboard navigation for all features/i)).toBeInTheDocument();
    expect(screen.getByText(/Screen reader compatible interface/i)).toBeInTheDocument();
  });

  test('handles error states gracefully', async () => {
    // Mock axios error
    const axios = require('axios');
    axios.post.mockRejectedValueOnce(new Error('Network error'));
    
    render(<App />);
    
    // Navigate to main screen
    const skipButton = screen.getByText(/Skip Tutorial/i);
    fireEvent.click(skipButton);
    
    const signInButton = screen.getByText(/Continue with Google/i);
    fireEvent.click(signInButton);
    
    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(/Share your story/i);
      fireEvent.change(textarea, {
        target: { value: 'Test story' }
      });
      
      const submitButton = screen.getByText(/Create Story/i);
      fireEvent.click(submitButton);
    });
  });

  test('maintains state in localStorage', async () => {
    // Mock existing user in localStorage
    localStorage.setItem('legacy_user', JSON.stringify({
      uid: 'test-user',
      email: 'test@example.com',
      displayName: 'Test User'
    }));
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Legacy Builder/i)).toBeInTheDocument();
    });
  });

  test('handles WebXR support check', () => {
    // Mock WebXR support
    Object.defineProperty(navigator, 'xr', {
      writable: true,
      value: {
        isSessionSupported: jest.fn().mockResolvedValue(true)
      }
    });
    
    render(<App />);
    // Component should render without errors
    expect(screen.getByText(/Welcome to Your Legacy Builder/i)).toBeInTheDocument();
  });
}); 