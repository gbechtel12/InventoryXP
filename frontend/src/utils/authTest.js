/**
 * Utility for testing user registration and login flows
 */

import { useUserStore } from '../stores/user';
// Firebase v8 doesn't use these named imports - functionality is available on the service instances
import { firestore } from '../firebase/initFirebase';

/**
 * Test user registration and login flow
 * @returns {Promise<Object>} Test results
 */
export async function testRegistrationAndLogin() {
  const userStore = useUserStore();
  const testResults = {
    success: false,
    steps: [],
    errors: []
  };

  try {
    // Step 1: Create a test user with a random email
    const randomSuffix = Math.floor(Math.random() * 100000);
    const testEmail = `test-${randomSuffix}@example.com`;
    const testPassword = 'test123456';
    const testUsername = `TestUser${randomSuffix}`;

    // Log current state
    testResults.steps.push('Starting with clean state');
    if (userStore.isAuthenticated) {
      await userStore.logout();
      testResults.steps.push('Logged out existing user');
    }

    // Step 2: Register the test user
    testResults.steps.push(`Attempting to register: ${testEmail}`);
    const registerData = await userStore.register({
      username: testUsername,
      email: testEmail,
      password: testPassword
    });

    if (!registerData || !registerData.uid) {
      throw new Error('Registration failed to return user data');
    }

    testResults.steps.push(`Registration successful for: ${testEmail}`);
    testResults.registeredUserId = registerData.uid;

    // Step 3: Logout
    await userStore.logout();
    testResults.steps.push('Logged out after registration');

    // Step 4: Login with registered credentials
    testResults.steps.push(`Attempting to login: ${testEmail}`);
    const loginData = await userStore.login(testEmail, testPassword);

    if (!loginData || !loginData.uid) {
      throw new Error('Login failed to return user data');
    }

    testResults.steps.push(`Login successful for: ${testEmail}`);
    testResults.loggedInUserId = loginData.uid;

    // Step 5: Verify user data
    if (registerData.uid === loginData.uid) {
      testResults.steps.push('User ID matches between registration and login');
    } else {
      throw new Error('User ID mismatch between registration and login');
    }

    // Step 6: Verify Firestore data
    const userDoc = await firestore.collection('users').doc(loginData.uid).get();
    if (userDoc.exists) {
      testResults.steps.push('Firestore user document exists');
      testResults.userData = userDoc.data();
    } else {
      throw new Error('Firestore user document not found');
    }

    // Mark the test as successful
    testResults.success = true;
    
    // Final logout
    await userStore.logout();
    testResults.steps.push('Final logout successful');
    
    return testResults;
  } catch (error) {
    console.error('Auth test failed:', error);
    testResults.success = false;
    testResults.errors.push(error.message || 'Unknown error');
    return testResults;
  }
}

/**
 * Create a test user for development purposes
 * @param {Object} userData User data
 * @returns {Promise<Object>} Created user data
 */
export async function createTestUser(userData = {}) {
  const userStore = useUserStore();
  const defaultData = {
    email: `test-${Math.floor(Math.random() * 100000)}@example.com`,
    password: 'test123456',
    username: `TestUser${Math.floor(Math.random() * 10000)}`
  };
  
  const testUser = { ...defaultData, ...userData };
  
  try {
    // Register the user
    const registerData = await userStore.register({
      username: testUser.username,
      email: testUser.email,
      password: testUser.password
    });
    
    console.log('Test user created:', testUser.email);
    return {
      success: true,
      user: registerData,
      credentials: testUser
    };
  } catch (error) {
    console.error('Failed to create test user:', error);
    return {
      success: false,
      error: error.message || 'Failed to create test user'
    };
  }
} 