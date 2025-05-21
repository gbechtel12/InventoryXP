import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, useMockAuth } from '../services/firebase'

const API_URL = import.meta.env.VITE_API_URL || '/api'

// Development flag to bypass API calls when backend is not available
const MOCK_AUTH = true // Set to true to enable mock authentication without backend

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const isLoading = ref(false)
  const authError = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const userName = computed(() => user.value?.displayName || user.value?.email?.split('@')[0] || '')
  const userEmail = computed(() => user.value?.email || '')

  // Initialize auth state from Firebase on store creation
  onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      user.value = firebaseUser
      // Get the ID token for API requests
      if (typeof firebaseUser.getIdToken === 'function') {
        firebaseUser.getIdToken().then((idToken) => {
          token.value = idToken
          localStorage.setItem('token', idToken)
          axios.defaults.headers.common['Authorization'] = `Bearer ${idToken}`
        }).catch(error => {
          console.error('Error getting ID token:', error)
        })
      } else if (useMockAuth) {
        // Using mock auth, just use the UID as the token
        const mockToken = 'mock-token-' + firebaseUser.uid
        token.value = mockToken
        localStorage.setItem('token', mockToken)
        axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`
      }
    } else {
      user.value = null
      token.value = null
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    }
  })

  // Load user profile if token exists
  if (token.value && !user.value) {
    loadUserProfile()
  }

  async function loadUserProfile() {
    if (!token.value) return null

    try {
      isLoading.value = true
      
      if (MOCK_AUTH) {
        // Mock user profile data for development
        user.value = {
          id: 1,
          username: 'testuser',
          email: localStorage.getItem('mockEmail') || 'test@example.com',
          name: 'Test User'
        }
        return user.value
      }
      
      const response = await axios.get(`${API_URL}/auth/profile`)
      user.value = response.data
      return user.value
    } catch (error) {
      console.error('Failed to load user profile:', error)
      if (!MOCK_AUTH) {
        await logout()
      }
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function login(email, password) {
    try {
      isLoading.value = true
      authError.value = null
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      
      // Get token for API requests if using real Firebase
      if (!useMockAuth && typeof userCredential.user.getIdToken === 'function') {
        const idToken = await userCredential.user.getIdToken()
        token.value = idToken
        localStorage.setItem('token', idToken)
        axios.defaults.headers.common['Authorization'] = `Bearer ${idToken}`
      } else if (useMockAuth) {
        // Using mock auth
        const mockToken = 'mock-token-' + userCredential.user.uid
        token.value = mockToken
        localStorage.setItem('token', mockToken)
        axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`
      }
      
      await loadUserProfile()
      return true
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
      
      const { email, password, name } = userData
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      
      // Update profile if name is provided
      if (name) {
        if (auth.currentUser && typeof auth.currentUser.updateProfile === 'function') {
          await auth.currentUser.updateProfile({ displayName: name })
        } else if (useMockAuth) {
          // Using mock auth
          await auth.updateProfile({ displayName: name })
        }
      }
      
      // Get token for API requests if using real Firebase
      if (!useMockAuth && typeof userCredential.user.getIdToken === 'function') {
        const idToken = await userCredential.user.getIdToken()
        token.value = idToken
        localStorage.setItem('token', idToken)
        axios.defaults.headers.common['Authorization'] = `Bearer ${idToken}`
      } else if (useMockAuth) {
        // Using mock auth
        const mockToken = 'mock-token-' + userCredential.user.uid
        token.value = mockToken
        localStorage.setItem('token', mockToken)
        axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`
      }
      
      await loadUserProfile()
      return true
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
      await signOut(auth)
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
      
      if (auth.currentUser) {
        if (typeof auth.currentUser.updateProfile === 'function') {
          await auth.currentUser.updateProfile(userData)
          user.value = auth.currentUser
        } else if (useMockAuth) {
          // Using mock auth
          await auth.updateProfile(userData)
          user.value = auth.currentUser
        }
      }
      
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
      
      if (auth.currentUser) {
        if (typeof auth.currentUser.updatePassword === 'function') {
          await auth.currentUser.updatePassword(newPassword)
          return true
        } else if (useMockAuth) {
          // Using mock auth
          await auth.updatePassword(newPassword)
          return true
        }
      }
      
      return false
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