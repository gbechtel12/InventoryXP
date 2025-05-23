<script setup>
import { ref, onMounted } from 'vue'
import { testRegistrationAndLogin, createTestUser } from '../utils/authTest'
import { useUserStore } from '../stores/user'
import { useAuth } from '../composables/useAuth'
import MainLayout from '../layouts/MainLayout.vue'
import UserInfoDisplay from '../components/UserInfoDisplay.vue'

const userStore = useUserStore()
const { currentUser } = useAuth()

const testResults = ref(null)
const isRunningTest = ref(false)
const testUser = ref(null)
const message = ref('')
const error = ref('')

async function runRegistrationTest() {
  message.value = ''
  error.value = ''
  isRunningTest.value = true
  
  try {
    testResults.value = await testRegistrationAndLogin()
    message.value = testResults.value.success 
      ? 'Registration and login test completed successfully!'
      : 'Test failed. See errors below.'
  } catch (err) {
    error.value = 'Test error: ' + (err.message || 'Unknown error')
    console.error('Test error:', err)
  } finally {
    isRunningTest.value = false
  }
}

async function createNewTestUser() {
  message.value = ''
  error.value = ''
  isRunningTest.value = true
  
  try {
    const result = await createTestUser()
    
    if (result.success) {
      testUser.value = result
      message.value = `Test user created: ${result.credentials.email}`
    } else {
      error.value = result.error || 'Failed to create test user'
    }
  } catch (err) {
    error.value = 'Error: ' + (err.message || 'Unknown error')
    console.error('Error creating test user:', err)
  } finally {
    isRunningTest.value = false
  }
}

async function loginWithTestUser() {
  if (!testUser.value?.credentials) {
    error.value = 'No test user available. Create one first.'
    return
  }
  
  message.value = ''
  error.value = ''
  isRunningTest.value = true
  
  try {
    const { email, password } = testUser.value.credentials
    const userData = await userStore.login(email, password)
    
    if (userData && userData.uid) {
      message.value = `Logged in as test user: ${email}`
    } else {
      error.value = 'Login failed'
    }
  } catch (err) {
    error.value = 'Login error: ' + (err.message || 'Unknown error')
    console.error('Login error:', err)
  } finally {
    isRunningTest.value = false
  }
}

async function logout() {
  message.value = ''
  error.value = ''
  
  try {
    await userStore.logout()
    message.value = 'Logged out successfully'
  } catch (err) {
    error.value = 'Logout error: ' + (err.message || 'Unknown error')
    console.error('Logout error:', err)
  }
}
</script>

<template>
  <MainLayout>
    <div class="max-w-4xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Authentication Test Page</h1>
      
      <!-- Current user info -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Current User</h2>
        <UserInfoDisplay />
      </div>
      
      <!-- Test control buttons -->
      <div class="bg-white shadow overflow-hidden rounded-lg mb-8">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Authentication Tests</h3>
          
          <!-- Message and error display -->
          <div v-if="message" class="mb-4 p-3 bg-green-50 text-green-700 rounded border border-green-200">
            {{ message }}
          </div>
          
          <div v-if="error" class="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">
            {{ error }}
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              @click="runRegistrationTest"
              :disabled="isRunningTest"
              class="inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {{ isRunningTest ? 'Running Test...' : 'Test Registration & Login Flow' }}
            </button>
            
            <button
              @click="createNewTestUser"
              :disabled="isRunningTest"
              class="inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Create Test User
            </button>
            
            <button
              @click="loginWithTestUser"
              :disabled="isRunningTest || !testUser"
              class="inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              Login with Test User
            </button>
            
            <button
              @click="logout"
              :disabled="!currentUser"
              class="inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      <!-- Test results display -->
      <div v-if="testResults" class="bg-white shadow overflow-hidden rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Test Results</h3>
          
          <div class="p-4 rounded-md mb-4" :class="testResults.success ? 'bg-green-50' : 'bg-red-50'">
            <p class="font-medium" :class="testResults.success ? 'text-green-700' : 'text-red-700'">
              {{ testResults.success ? 'Test Passed ✓' : 'Test Failed ✗' }}
            </p>
          </div>
          
          <div class="mb-6">
            <h4 class="text-md font-medium mb-2">Steps:</h4>
            <ul class="list-disc pl-5 space-y-1">
              <li v-for="(step, index) in testResults.steps" :key="index" class="text-gray-700">
                {{ step }}
              </li>
            </ul>
          </div>
          
          <div v-if="testResults.errors && testResults.errors.length > 0" class="mb-6">
            <h4 class="text-md font-medium mb-2 text-red-600">Errors:</h4>
            <ul class="list-disc pl-5 space-y-1">
              <li v-for="(error, index) in testResults.errors" :key="index" class="text-red-600">
                {{ error }}
              </li>
            </ul>
          </div>
          
          <div v-if="testResults.userData">
            <h4 class="text-md font-medium mb-2">User Data:</h4>
            <pre class="bg-gray-100 p-3 rounded overflow-x-auto text-sm">{{ JSON.stringify(testResults.userData, null, 2) }}</pre>
          </div>
        </div>
      </div>
      
      <!-- Test user display -->
      <div v-if="testUser" class="bg-white shadow overflow-hidden rounded-lg mt-8">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Test User</h3>
          
          <div class="bg-blue-50 p-4 rounded mb-4">
            <p class="font-medium text-blue-700">
              Test user created successfully.
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 class="text-md font-medium mb-2">Credentials:</h4>
              <div class="bg-gray-100 p-3 rounded overflow-x-auto text-sm">
                <p><strong>Email:</strong> {{ testUser.credentials.email }}</p>
                <p><strong>Password:</strong> {{ testUser.credentials.password }}</p>
                <p><strong>Username:</strong> {{ testUser.credentials.username }}</p>
              </div>
            </div>
            
            <div>
              <h4 class="text-md font-medium mb-2">User Data:</h4>
              <pre class="bg-gray-100 p-3 rounded overflow-x-auto text-sm">{{ JSON.stringify(testUser.user, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template> 