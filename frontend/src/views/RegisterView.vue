<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { firestore } from '../firebase/initFirebase'
import firebase from 'firebase/app'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

async function handleRegister() {
  // Reset error
  error.value = ''
  
  // Validate form
  if (!username.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = 'All fields are required'
    return
  }
  
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }
  
  loading.value = true
  
  try {
    // Register user
    const userData = await userStore.register({
      username: username.value,
      email: email.value,
      password: password.value
    })
    
    if (userData && userData.uid) {
      // Update last login timestamp in Firestore
      try {
        await firestore.collection('users').doc(userData.uid).set({
          lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
          registrationComplete: true
        }, { merge: true })
      } catch (firestoreErr) {
        console.error('Error updating registration data:', firestoreErr)
        // Continue even if this fails - it's not critical
      }
      
      // Redirect to dashboard
      router.push('/')
    } else {
      error.value = 'Registration failed. Please try again.'
    }
  } catch (e) {
    console.error('Registration error:', e)
    
    // Provide user-friendly error messages
    if (e.code === 'auth/email-already-in-use') {
      error.value = 'An account with this email already exists.'
    } else if (e.code === 'auth/invalid-email') {
      error.value = 'Invalid email format.'
    } else if (e.code === 'auth/weak-password') {
      error.value = 'Password is too weak. Use at least 6 characters.'
    } else {
      error.value = e.message || 'An error occurred during registration'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Form side -->
    <div class="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white">
      <div class="mx-auto w-full max-w-sm lg:w-96">
        <h1 class="text-2xl font-bold text-center text-gray-800 mb-6">Create an Account</h1>
        
        <form @submit.prevent="handleRegister" class="space-y-4">
          <div v-if="error" class="bg-red-100 p-3 rounded text-red-700 text-sm mb-4">
            {{ error }}
          </div>
          
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              id="username"
              v-model="username"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              minlength="6"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              minlength="6"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {{ loading ? 'Creating account...' : 'Register' }}
            </button>
          </div>
          
          <div class="text-sm text-center">
            <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
              Already have an account? Sign in
            </router-link>
          </div>
        </form>
      </div>
    </div>

    <!-- Creative visual side -->
    <div class="hidden lg:block relative w-0 flex-1 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800">
        <!-- Animated circles in background -->
        <div class="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div class="absolute w-96 h-96 rounded-full bg-indigo-400 opacity-20 -top-10 -right-16 animate-blob"></div>
          <div class="absolute w-96 h-96 rounded-full bg-purple-400 opacity-20 top-40 -left-20 animate-blob animation-delay-2000"></div>
          <div class="absolute w-80 h-80 rounded-full bg-indigo-300 opacity-20 bottom-20 right-32 animate-blob animation-delay-4000"></div>
        </div>
        
        <!-- Onboarding message and features -->
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div class="text-5xl font-extrabold text-white tracking-tight text-center">
            <span class="block">Welcome to</span>
            <span class="block mt-1">InventoryXP</span>
          </div>
          
          <div class="mt-6 text-xl text-indigo-100 max-w-md text-center">
            Join thousands of sellers who manage their inventory smarter
          </div>
          
          <!-- Feature cards -->
          <div class="mt-12 space-y-8 max-w-lg">
            <div class="bg-white bg-opacity-10 p-4 rounded-lg backdrop-filter backdrop-blur-sm shadow-lg flex items-center transform transition duration-300 hover:translate-x-2">
              <div class="bg-indigo-500 bg-opacity-50 p-3 rounded-full">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-white font-medium">Simple Inventory Management</h3>
                <p class="text-indigo-100 text-sm">Track items, costs, and locations in one place</p>
              </div>
            </div>
            
            <div class="bg-white bg-opacity-10 p-4 rounded-lg backdrop-filter backdrop-blur-sm shadow-lg flex items-center transform transition duration-300 hover:translate-x-2">
              <div class="bg-indigo-500 bg-opacity-50 p-3 rounded-full">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-white font-medium">ROI Analytics</h3>
                <p class="text-indigo-100 text-sm">Know your profit margins at a glance</p>
              </div>
            </div>
            
            <div class="bg-white bg-opacity-10 p-4 rounded-lg backdrop-filter backdrop-blur-sm shadow-lg flex items-center transform transition duration-300 hover:translate-x-2">
              <div class="bg-indigo-500 bg-opacity-50 p-3 rounded-full">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-white font-medium">Multi-Platform Support</h3>
                <p class="text-indigo-100 text-sm">Manage listings across different marketplaces</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Subtle wave animation at bottom -->
        <div class="absolute bottom-0 left-0 right-0">
          <svg class="waves" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
            <defs>
              <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
            </defs>
            <g class="parallax">
              <use xlink:href="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.1)" />
              <use xlink:href="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.07)" />
              <use xlink:href="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.05)" />
              <use xlink:href="#gentle-wave" x="48" y="7" fill="rgba(255,255,255,0.03)" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

.waves {
  position: relative;
  width: 100%;
  height: 100px;
  margin-bottom: -7px;
}

.parallax > use {
  animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite;
}

.parallax > use:nth-child(1) {
  animation-delay: -2s;
  animation-duration: 7s;
}
.parallax > use:nth-child(2) {
  animation-delay: -3s;
  animation-duration: 10s;
}
.parallax > use:nth-child(3) {
  animation-delay: -4s;
  animation-duration: 13s;
}
.parallax > use:nth-child(4) {
  animation-delay: -5s;
  animation-duration: 20s;
}

@keyframes move-forever {
  0% {
    transform: translate3d(-90px,0,0);
  }
  100% { 
    transform: translate3d(85px,0,0);
  }
}
</style> 