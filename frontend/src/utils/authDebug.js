/**
 * Utility functions for debugging authentication issues
 */

import { useUserStore } from '../stores/user';
import { useAuth } from '../composables/useAuth';

/**
 * Get the current authentication state for debugging
 * @returns {Object} The current auth state
 */
export function getAuthDebugInfo() {
  const userStore = useUserStore();
  const { currentUser, isLoading, userMetadata } = useAuth();
  
  return {
    // User store info
    storeState: {
      isAuthenticated: userStore.isAuthenticated,
      userName: userStore.userName,
      userEmail: userStore.userEmail,
      hasToken: !!localStorage.getItem('token'),
      tokenValue: localStorage.getItem('token')?.substring(0, 10) + '...'
    },
    
    // Auth composable info
    authState: {
      currentUser: currentUser.value ? {
        uid: currentUser.value.uid,
        email: currentUser.value.email,
        displayName: currentUser.value.displayName,
        hasMetadata: !!currentUser.value.metadata
      } : null,
      isLoading: isLoading.value,
      userMetadata: userMetadata.value
    }
  };
}

/**
 * Log the current auth state to console
 */
export function logAuthState() {
  const debugInfo = getAuthDebugInfo();
  console.group('Authentication Debug Info');
  console.log('User Store State:', debugInfo.storeState);
  console.log('Auth Composable State:', debugInfo.authState);
  console.groupEnd();
  
  return debugInfo;
} 