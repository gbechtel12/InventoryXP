<script setup>
import { useAuth } from '../composables/useAuth'
import { useUserStore } from '../stores/user'
import { onMounted } from 'vue'
import { logAuthState } from '../utils/authDebug'

const { currentUser, userName, userEmail, userCreatedAt, userLastLogin } = useAuth()
const userStore = useUserStore()

// Format date
function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  // Log auth state for debugging
  logAuthState()
  
  // Ensure user profile is loaded
  if (userStore.isAuthenticated) {
    userStore.loadUserProfile()
  }
})
</script>

<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50">
      <div>
        <h3 class="text-lg leading-6 font-medium text-gray-900">User Information</h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">Personal details and authentication status</p>
      </div>
      <div v-if="currentUser" class="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
        <span class="text-indigo-700 font-bold text-xl">{{ userName.charAt(0).toUpperCase() }}</span>
      </div>
    </div>
    
    <div class="border-t border-gray-200">
      <dl>
        <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Authentication Status</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            <span 
              class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
              :class="currentUser ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
            >
              {{ currentUser ? 'Authenticated' : 'Not Authenticated' }}
            </span>
          </dd>
        </div>
        
        <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Full name</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ userName || 'Not available' }}</dd>
        </div>
        
        <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Email address</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ userEmail || 'Not available' }}</dd>
        </div>
        
        <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">User ID</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">{{ currentUser?.uid || 'Not available' }}</dd>
        </div>
        
        <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Account created</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ formatDate(userCreatedAt) }}</dd>
        </div>
        
        <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Last login</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ formatDate(userLastLogin) }}</dd>
        </div>
      </dl>
    </div>
  </div>
</template> 