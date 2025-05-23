import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
// Firebase v8 doesn't use these named imports - functionality is available on the service instances
import { auth, firestore } from '../firebase/initFirebase'

// Temporarily enable mock auth to allow login while fixing Firebase configuration
const MOCK_AUTH = true;

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const isLoading = ref(false)
  const authError = ref(null)

  // Create a mock user for development
  if (MOCK_AUTH) {
    user.value = {
      uid: 'mock-user-1',
      email: 'test@example.com',
      displayName: 'Test User'
    }
    
    // Set a mock token
    if (!token.value) {
      const mockToken = 'mock-token-' + user.value.uid
      token.value = mockToken
      localStorage.setItem('token', mockToken)
    }
    
    console.log('Using mock user in userStore:', user.value.email)
  }

  const isAuthenticated = computed(() => !!user.value)
  const userName = computed(() => user.value?.displayName || user.value?.email?.split('@')[0] || '')
  const userEmail = computed(() => user.value?.email || '')

  // Initialize auth state from Firebase on store creation
  if (!MOCK_AUTH) {
    auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        user.value = firebaseUser
        // Get the ID token for API requests
        firebaseUser.getIdToken().then((idToken) => {
          token.value = idToken
          localStorage.setItem('token', idToken)
          axios.defaults.headers.common['Authorization'] = `Bearer ${idToken}`
        }).catch(error => {
          console.error('Error getting ID token:', error)
        })
      } else {
        user.value = null
        token.value = null
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
      }
    })
  } else {
    // For mock auth, set the Authorization header
    if (token.value) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    }
  }

  // Load user profile if token exists
  if (token.value && !user.value && !MOCK_AUTH) {
    loadUserProfile()
  }

  async function loadUserProfile() {
    if (!token.value) return null

    try {
      isLoading.value = true
      
      // For mock auth, return the mock user
      if (MOCK_AUTH) {
        return user.value
      }
      
      // If we have a current user, just return it
      if (auth.currentUser) {
        user.value = auth.currentUser
        return user.value
      }
      
      // Otherwise try to get user data from Firestore
      if (user.value?.uid) {
        const userDocRef = firestore.collection('users').doc(user.value.uid)
        const userDoc = await userDocRef.get()
        
        if (userDoc.exists) {
          const userData = userDoc.data()
          // Merge Firestore data with auth user data
          if (user.value) {
            user.value = { ...user.value, ...userData }
          }
        }
      }
      
      return user.value
    } catch (error) {
      console.error('Failed to load user profile:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function login(email, password) {
    try {
      isLoading.value = true
      authError.value = null
      
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required')
      }
      
      // Use mock authentication if enabled
      if (MOCK_AUTH) {
        console.log('Using mock authentication for login')
        
        // Set mock user and token
        user.value = {
          uid: 'mock-user-1',
          email: email || 'test@example.com',
          displayName: email?.split('@')[0] || 'Test User',
          metadata: {
            creationTime: new Date().toISOString(),
            lastSignInTime: new Date().toISOString()
          }
        }
        
        const mockToken = 'mock-token-' + user.value.uid
        token.value = mockToken
        localStorage.setItem('token', mockToken)
        axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`
        
        return user.value
      }
      
      const userCredential = await auth.signInWithEmailAndPassword(email, password)
      user.value = userCredential.user
      
      // Get token for API requests
      const idToken = await userCredential.user.getIdToken()
      token.value = idToken
      localStorage.setItem('token', idToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${idToken}`
      
      await loadUserProfile()
      return user.value
    } catch (error) {
      console.error('Login error:', error)
      authError.value = error.message || 'Failed to login'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function register(userData) {
    try {
      isLoading.value = true
      authError.value = null
      
      const { email, password, username } = userData
      
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required')
      }
      
      if (MOCK_AUTH) {
        console.log('Using mock authentication for registration')
        
        // Set mock user and token
        user.value = {
          uid: 'mock-user-' + Math.floor(Math.random() * 10000),
          email: email,
          displayName: username || email.split('@')[0],
          metadata: {
            creationTime: new Date().toISOString(),
            lastSignInTime: new Date().toISOString()
          }
        }
        
        const mockToken = 'mock-token-' + user.value.uid
        token.value = mockToken
        localStorage.setItem('token', mockToken)
        axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`
        
        // Add a slight delay to simulate network latency
        await new Promise(resolve => setTimeout(resolve, 500))
        
        return user.value
      }
      
      // Create new user with Firebase
      const userCredential = await auth.createUserWithEmailAndPassword(email, password)
      user.value = userCredential.user
      
      // Update profile with username/displayName
      if (username && auth.currentUser) {
        await auth.currentUser.updateProfile({ displayName: username })
      }
      
      // Get token for API requests
      const idToken = await userCredential.user.getIdToken()
      token.value = idToken
      localStorage.setItem('token', idToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${idToken}`
      
      // Save additional user data to Firestore
      const userDocRef = firestore.collection('users').doc(userCredential.user.uid)
      await userDocRef.set({
        uid: userCredential.user.uid,
        email: email,
        displayName: username || email.split('@')[0],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      })
      
      // Make sure to load the user profile with the new data
      await loadUserProfile()
      
      return user.value
    } catch (error) {
      console.error('Registration error:', error)
      authError.value = error.message || 'Failed to register'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      await auth.signOut()
      user.value = null
      token.value = null
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      
      return true
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  async function updateProfile(userData) {
    try {
      isLoading.value = true
      
      if (!auth.currentUser) {
        throw new Error('User not authenticated')
      }
      
      // Update Firebase Auth profile (displayName, etc.)
      await auth.currentUser.updateProfile(userData)
      
      // Also update Firestore user document
      const userDocRef = firestore.collection('users').doc(auth.currentUser.uid)
      await userDocRef.update({
        ...userData,
        updatedAt: new Date().toISOString()
      })
      
      // Update local user object
      user.value = auth.currentUser
      
      return user.value
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function changePassword(newPassword) {
    try {
      isLoading.value = true
      
      if (!auth.currentUser) {
        throw new Error('User not authenticated')
      }
      
      await auth.currentUser.updatePassword(newPassword)
      return true
    } catch (error) {
      console.error('Change password error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    token,
    isLoading,
    authError,
    isAuthenticated,
    userName,
    userEmail,
    login,
    register,
    logout,
    loadUserProfile,
    updateProfile,
    changePassword
  }
}) 