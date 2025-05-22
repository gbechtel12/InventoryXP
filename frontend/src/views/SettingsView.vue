<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import MainLayout from '../layouts/MainLayout.vue'

const userStore = useUserStore()
const loading = ref(false)
const message = ref('')
const error = ref('')

// User form data
const userData = ref({
  displayName: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

onMounted(async () => {
  loading.value = true
  try {
    await userStore.loadUserProfile()
    // Initialize form with current user data
    userData.value.displayName = userStore.userName || ''
    userData.value.email = userStore.userEmail || ''
  } catch (err) {
    error.value = 'Failed to load user profile'
  } finally {
    loading.value = false
  }
})

async function updateProfile() {
  error.value = ''
  message.value = ''
  loading.value = true
  
  try {
    // Validate display name
    if (!userData.value.displayName.trim()) {
      error.value = 'Display name cannot be empty'
      return
    }
    
    // Update user profile
    await userStore.updateProfile({ displayName: userData.value.displayName })
    message.value = 'Profile updated successfully'
  } catch (err) {
    error.value = err.message || 'Failed to update profile'
  } finally {
    loading.value = false
  }
}

async function changePassword() {
  error.value = ''
  message.value = ''
  loading.value = true
  
  try {
    // Validate passwords
    if (!userData.value.newPassword) {
      error.value = 'New password is required'
      return
    }
    
    if (userData.value.newPassword.length < 6) {
      error.value = 'Password must be at least 6 characters'
      return
    }
    
    if (userData.value.newPassword !== userData.value.confirmPassword) {
      error.value = 'Passwords do not match'
      return
    }
    
    // Change password
    await userStore.changePassword(userData.value.newPassword)
    message.value = 'Password changed successfully'
    
    // Clear password fields
    userData.value.currentPassword = ''
    userData.value.newPassword = ''
    userData.value.confirmPassword = ''
  } catch (err) {
    error.value = err.message || 'Failed to change password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <MainLayout>
    <div class="px-4 py-6">
      <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
      
      <div v-if="loading" class="my-8 flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
      
      <div v-else class="mt-6 max-w-2xl mx-auto">
        <!-- Success message -->
        <div v-if="message" class="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-700">{{ message }}</p>
            </div>
          </div>
        </div>
        
        <!-- Error message -->
        <div v-if="error" class="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>
        
        <!-- Profile Settings -->
        <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
            <p class="mt-1 text-sm text-gray-500">Update your account information.</p>
          </div>
          
          <div class="px-4 py-5 sm:p-6">
            <div class="grid grid-cols-6 gap-6">
              <div class="col-span-6 sm:col-span-4">
                <label for="displayName" class="block text-sm font-medium text-gray-700">Display Name</label>
                <input
                  type="text"
                  name="displayName"
                  id="displayName"
                  v-model="userData.displayName"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div class="col-span-6 sm:col-span-4">
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  v-model="userData.email"
                  disabled
                  class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-gray-50"
                />
                <p class="mt-1 text-xs text-gray-500">Email cannot be changed.</p>
              </div>
            </div>
            
            <div class="mt-6">
              <button
                @click="updateProfile"
                type="button"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
        
        <!-- Password Settings -->
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Change Password</h3>
            <p class="mt-1 text-sm text-gray-500">Ensure your account is using a strong password.</p>
          </div>
          
          <div class="px-4 py-5 sm:p-6">
            <div class="grid grid-cols-6 gap-6">
              <div class="col-span-6 sm:col-span-4">
                <label for="currentPassword" class="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  id="currentPassword"
                  v-model="userData.currentPassword"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                <p class="mt-1 text-xs text-gray-500">For development, you can leave this empty.</p>
              </div>
              
              <div class="col-span-6 sm:col-span-4">
                <label for="newPassword" class="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  v-model="userData.newPassword"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div class="col-span-6 sm:col-span-4">
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  v-model="userData.confirmPassword"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div class="mt-6">
              <button
                @click="changePassword"
                type="button"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
input {
  @apply border-gray-300 rounded-md shadow-sm;
}
</style> 