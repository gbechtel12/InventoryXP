import { ref, onMounted, onUnmounted } from 'vue';
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

/**
 * Composable function that provides Firebase Authentication functionality
 * @returns {Object} Authentication methods and state
 */
export function useAuth() {
  const currentUser = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  
  // Keep track of auth state change listener
  let unsubscribe = null;
  
  // Set up auth state listener
  onMounted(() => {
    unsubscribe = onAuthStateChanged(auth, (user) => {
      currentUser.value = user;
      if (user) {
        console.log('User authenticated:', user.email);
      }
    }, (err) => {
      console.error('Auth state change error:', err);
      error.value = err.message;
    });
  });
  
  // Clean up listener on component unmount
  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });
  
  /**
   * Login with email and password
   * @param {string} email User's email
   * @param {string} password User's password
   * @returns {Promise<Object>} Result with success status and user or error
   */
  const login = async (email, password) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: userCredential.user
      };
    } catch (err) {
      console.error('Login error:', err);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to login';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account exists with this email';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      } else if (err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid login credentials';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts, please try again later';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      error.value = errorMessage;
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Register a new user with email and password
   * @param {string} email User's email
   * @param {string} password User's password
   * @returns {Promise<Object>} Result with success status and user or error
   */
  const register = async (email, password) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Save user data to Firestore
      try {
        // Check if user document already exists
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        // Only create document if it doesn't exist
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            createdAt: serverTimestamp()
          });
          
          console.log('User document created in Firestore');
        } else {
          console.log('User document already exists in Firestore');
        }
      } catch (firestoreError) {
        console.error('Error creating user document:', firestoreError);
        // Continue despite Firestore error since account was created
      }
      
      return {
        success: true,
        user: user
      };
    } catch (err) {
      console.error('Registration error:', err);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to register';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'An account already exists with this email';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      error.value = errorMessage;
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Logout the current user
   * @returns {Promise<Object>} Result with success status or error
   */
  const logout = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await signOut(auth);
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      error.value = err.message || 'Failed to logout';
      return {
        success: false,
        error: error.value
      };
    } finally {
      isLoading.value = false;
    }
  };
  
  return {
    currentUser,
    isLoading,
    error,
    login,
    register,
    logout
  };
} 