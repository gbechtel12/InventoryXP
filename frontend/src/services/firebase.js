// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getAuth as firebaseGetAuth, 
  createUserWithEmailAndPassword as firebaseCreateUser, 
  signInWithEmailAndPassword as firebaseSignIn, 
  signOut as firebaseSignOut, 
  onAuthStateChanged as firebaseOnAuthStateChanged 
} from "firebase/auth";

// Development flag - if true, use mock Firebase when credentials are missing
const USE_MOCK_FIREBASE = true;

// Check if Firebase credentials are available
const hasFirebaseCredentials = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

// Mock implementations for development when Firebase credentials are missing
const mockAuth = {
  currentUser: null,
  mockUserData: null,
  
  // Listener callbacks to notify about auth state changes
  listeners: [],
  
  triggerAuthStateChange() {
    this.listeners.forEach(callback => callback(this.currentUser));
  },
  
  async signInWithEmailAndPassword(email, password) {
    console.log('MOCK: Sign in with', email);
    
    // In development, accept any credentials
    if (import.meta.env.DEV) {
      this.currentUser = {
        uid: 'mock-uid-' + Date.now(),
        email: email || 'test@example.com',
        displayName: (email || 'test@example.com').split('@')[0],
        getIdToken: () => Promise.resolve('mock-token-' + Date.now())
      };
      this.mockUserData = { email, password };
      this.triggerAuthStateChange();
      
      return { user: this.currentUser };
    }
    
    // In production mode, we'd do actual validation here
    this.currentUser = {
      uid: 'mock-uid-' + Date.now(),
      email,
      displayName: email.split('@')[0],
      getIdToken: () => Promise.resolve('mock-token-' + Date.now())
    };
    this.mockUserData = { email, password };
    this.triggerAuthStateChange();
    
    return { user: this.currentUser };
  },
  
  async createUserWithEmailAndPassword(email, password) {
    console.log('MOCK: Create user with', email);
    this.currentUser = {
      uid: 'mock-uid-' + Date.now(),
      email,
      displayName: email.split('@')[0],
      getIdToken: () => Promise.resolve('mock-token-' + Date.now())
    };
    this.mockUserData = { email, password };
    this.triggerAuthStateChange();
    
    return { user: this.currentUser };
  },
  
  async signOut() {
    console.log('MOCK: Sign out');
    this.currentUser = null;
    this.mockUserData = null;
    this.triggerAuthStateChange();
  },
  
  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    // Immediately invoke with current auth state
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  },
  
  // Mock update profile
  async updateProfile(userData) {
    if (this.currentUser) {
      this.currentUser = {
        ...this.currentUser,
        ...userData
      };
      this.triggerAuthStateChange();
    }
  },
  
  // Mock update password
  async updatePassword(newPassword) {
    if (this.currentUser && this.mockUserData) {
      this.mockUserData.password = newPassword;
      console.log('MOCK: Password updated');
    }
  }
};

// Determine whether to use real Firebase or mock
const useMockAuth = USE_MOCK_FIREBASE && !hasFirebaseCredentials;

let auth;
let app;

// Create wrapper functions that handle both real and mock auth
let createUserWithEmailAndPassword;
let signInWithEmailAndPassword;
let signOut;
let onAuthStateChanged;

if (useMockAuth) {
  console.log('Using mock Firebase authentication for development');
  auth = mockAuth;
  
  // Use mock functions directly
  createUserWithEmailAndPassword = (_, email, password) => mockAuth.createUserWithEmailAndPassword(email, password);
  signInWithEmailAndPassword = (_, email, password) => mockAuth.signInWithEmailAndPassword(email, password);
  signOut = () => mockAuth.signOut();
  onAuthStateChanged = (_, callback) => mockAuth.onAuthStateChanged(callback);
  
} else {
  try {
    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    auth = firebaseGetAuth(app);
    console.log('Using real Firebase authentication');
    
    // Use real Firebase functions
    createUserWithEmailAndPassword = firebaseCreateUser;
    signInWithEmailAndPassword = firebaseSignIn;
    signOut = firebaseSignOut;
    onAuthStateChanged = firebaseOnAuthStateChanged;
    
  } catch (error) {
    console.error('Firebase initialization error. Falling back to mock auth:', error);
    auth = mockAuth;
    
    // Fall back to mock functions
    createUserWithEmailAndPassword = (_, email, password) => mockAuth.createUserWithEmailAndPassword(email, password);
    signInWithEmailAndPassword = (_, email, password) => mockAuth.signInWithEmailAndPassword(email, password);
    signOut = () => mockAuth.signOut();
    onAuthStateChanged = (_, callback) => mockAuth.onAuthStateChanged(callback);
  }
}

// Export the Firebase auth module or our mock version
export {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  useMockAuth
}; 