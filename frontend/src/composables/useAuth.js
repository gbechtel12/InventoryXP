import { ref, computed, watchEffect } from 'vue';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, firestore } from '../firebase/initFirebase';

// Singleton pattern to share the auth state across components
const currentUser = ref(null);
const isLoading = ref(true);
const error = ref(null);
const userMetadata = ref({});

// For development/testing when Firebase might not be available
const MOCK_MODE = true;

// Initialize with mock data if in mock mode
if (MOCK_MODE) {
  currentUser.value = {
    uid: 'mock-user-1',
    email: 'test@example.com',
    displayName: 'Test User',
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString()
    }
  };
  
  userMetadata.value = {
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };
  
  isLoading.value = false;
} else {
  // Watch for auth state changes with Firebase
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      if (user) {
        currentUser.value = user;
        
        // Get additional user data from Firestore
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          userMetadata.value = userDoc.data();
        }
      } else {
        currentUser.value = null;
        userMetadata.value = {};
      }
    } catch (e) {
      console.error('Auth state change error:', e);
      error.value = e.message;
    } finally {
      isLoading.value = false;
    }
  });
}

// Computed properties
const isAuthenticated = computed(() => !!currentUser.value);
const userName = computed(() => 
  currentUser.value?.displayName || 
  currentUser.value?.email?.split('@')[0] || 
  'User'
);
const userEmail = computed(() => currentUser.value?.email || '');
const userCreatedAt = computed(() => 
  userMetadata.value?.createdAt || 
  currentUser.value?.metadata?.creationTime ||
  null
);
const userLastLogin = computed(() => 
  userMetadata.value?.lastLogin || 
  currentUser.value?.metadata?.lastSignInTime || 
  null
);

/**
 * Composable function that provides Firebase Authentication functionality
 * @returns {Object} Authentication methods and state
 */
export function useAuth() {
  return {
    currentUser,
    isLoading,
    error,
    userMetadata,
    isAuthenticated,
    userName,
    userEmail,
    userCreatedAt,
    userLastLogin
  };
} 