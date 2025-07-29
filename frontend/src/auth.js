import { initializeApp } from '@firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from '@firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
let app;
let auth;

export const initializeAuth = async () => {
  try {
    if (!app) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
    }
    return auth;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    if (!auth) {
      await initializeAuth();
    }
    
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    if (auth) {
      await firebaseSignOut(auth);
    }
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return auth ? auth.currentUser : null;
};

export const onAuthChange = (callback) => {
  if (auth) {
    return onAuthStateChanged(auth, callback);
  }
  return () => {};
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return auth ? !!auth.currentUser : false;
};

// Get user token for API calls
export const getUserToken = async () => {
  try {
    if (auth && auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    return null;
  } catch (error) {
    console.error('Error getting user token:', error);
    return null;
  }
}; 