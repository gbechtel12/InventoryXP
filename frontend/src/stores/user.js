import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

// Development flag to bypass API calls when backend is not available
const MOCK_AUTH = true // Set to true to enable mock authentication without backend

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value)
  const userName = computed(() => user.value?.name || '')
  const userEmail = computed(() => user.value?.email || '')

  // Initialize axios auth header if token exists
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

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
      
      if (MOCK_AUTH) {
        // Mock successful login for development
        console.log('Using mock authentication - bypassing API call')
        // Store the email for personalization
        localStorage.setItem('mockEmail', email)
        // Create a mock token
        const mockToken = 'mock_' + Math.random().toString(36).substr(2, 9)
        token.value = mockToken
        localStorage.setItem('token', token.value)
        await loadUserProfile()
        return true
      }
      
      const response = await axios.post(`${API_URL}/auth/login`, { email, password })
      
      token.value = response.data.token
      localStorage.setItem('token', token.value)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      
      await loadUserProfile()
      return true
    } catch (error) {
      if (!MOCK_AUTH) {
        console.error('Login error:', error)
        throw error
      } else {
        return true // Always succeed in mock mode
      }
    } finally {
      isLoading.value = false
    }
  }

  async function register(userData) {
    try {
      isLoading.value = true
      
      if (MOCK_AUTH) {
        // Mock successful registration for development
        console.log('Using mock authentication - bypassing API call')
        // Store the email for personalization
        localStorage.setItem('mockEmail', userData.email)
        // Create a mock token
        const mockToken = 'mock_' + Math.random().toString(36).substr(2, 9)
        token.value = mockToken
        localStorage.setItem('token', token.value)
        await loadUserProfile()
        return true
      }
      
      const response = await axios.post(`${API_URL}/auth/register`, userData)
      
      token.value = response.data.token
      localStorage.setItem('token', token.value)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      
      await loadUserProfile()
      return true
    } catch (error) {
      if (!MOCK_AUTH) {
        console.error('Registration error:', error)
        throw error
      } else {
        return true // Always succeed in mock mode
      }
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    // Try to call logout endpoint if we have a token
    if (token.value && !MOCK_AUTH) {
      try {
        await axios.post(`${API_URL}/auth/logout`)
      } catch (error) {
        console.error('Logout API error:', error)
        // Continue with local logout even if API call fails
      }
    }

    // Local cleanup
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('mockEmail')
    delete axios.defaults.headers.common['Authorization']
    
    return true
  }

  async function updateProfile(userData) {
    try {
      isLoading.value = true
      
      if (MOCK_AUTH) {
        // Mock profile update
        user.value = { ...user.value, ...userData }
        return user.value
      }
      
      const response = await axios.put(`${API_URL}/auth/profile`, userData)
      user.value = response.data
      return user.value
    } catch (error) {
      if (!MOCK_AUTH) {
        console.error('Update profile error:', error)
        throw error
      }
      return user.value
    } finally {
      isLoading.value = false
    }
  }

  async function changePassword(passwordData) {
    try {
      isLoading.value = true
      
      if (MOCK_AUTH) {
        // Mock password change (do nothing in development mode)
        return true
      }
      
      await axios.put(`${API_URL}/auth/password`, passwordData)
      return true
    } catch (error) {
      if (!MOCK_AUTH) {
        console.error('Change password error:', error)
        throw error
      }
      return true
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    token,
    isLoading,
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