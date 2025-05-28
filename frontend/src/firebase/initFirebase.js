// Import Firebase modules (v8 syntax)
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// Firebase configuration object using environment variables
const firebaseConfig = {
    apiKey: "AIzaSyCkx2QZzJ67MwNT083VYQT6mzMznfxceQM",
    authDomain: "inventoryxp.firebaseapp.com",
    projectId: "inventoryxp",
    storageBucket: "inventoryxp.appspot.com",
    messagingSenderId: "562286817001",
    appId: "1:562286817001:web:5974629c7fecf6da2f8a78",
    measurementId: "G-P35QFZ6LWM"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const firestore = firebase.firestore();

// Log initialization status in development mode
if (import.meta.env.DEV) {
  console.log('Firebase initialized successfully');
}

// Export initialized Firebase instances
export { app, auth, firestore };

/**
 * This module initializes Firebase and exports the app, auth, and firestore instances.
 * To use in other files, import like this:
 * 
 * import { auth, firestore } from '@/firebase/initFirebase';
 * 
 * Environment variables required in .env file:
 * VITE_FIREBASE_API_KEY
 * VITE_FIREBASE_AUTH_DOMAIN
 * VITE_FIREBASE_PROJECT_ID
 * VITE_FIREBASE_STORAGE_BUCKET
 * VITE_FIREBASE_MESSAGING_SENDER_ID
 * VITE_FIREBASE_APP_ID
 */ 