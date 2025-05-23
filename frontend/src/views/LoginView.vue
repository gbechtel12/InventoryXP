<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { firestore } from '../firebase/initFirebase'
import firebase from 'firebase/app'

const router = useRouter()
const userStore = useUserStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = 'Email and password are required'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // Login with Firebase
    const userData = await userStore.login(email.value, password.value)
    
    // Update last login timestamp in Firestore
    if (userData?.uid) {
      try {
        await firestore.collection('users').doc(userData.uid).set({
          lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
          email: userData.email,
          // If this is a new user, set the creation timestamp
          ...(userData.metadata?.creationTime && { createdAt: userData.metadata.creationTime })
        }, { merge: true })
      } catch (firestoreErr) {
        console.error('Error updating user login data:', firestoreErr)
        // Continue even if this fails - it's not critical
      }
    }
    
    router.push('/')
  } catch (e) {
    console.error('Login error:', e)
    error.value = e.response?.data?.message || e.message || 'Invalid email or password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex h-screen w-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800">
    <div class="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white lg:max-w-2xl">
      <div class="mx-auto w-full max-w-sm lg:w-96">
        <div>
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          <p class="mt-2 text-sm text-gray-600">
            Or
            <router-link to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
              create a new account
            </router-link>
          </p>
        </div>

        <div class="mt-8">
          <div class="mt-6">
            <form @submit.prevent="handleLogin" class="space-y-6">
              <div v-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm text-red-700">{{ error }}</p>
                  </div>
                </div>
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div class="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autocomplete="email"
                    required
                    v-model="email"
                    class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div class="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autocomplete="current-password"
                    required
                    v-model="password"
                    class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  :disabled="loading"
                  class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ loading ? 'Signing in...' : 'Sign in' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Enhanced right panel with animated background and illustrations -->
    <div class="hidden lg:block relative flex-1 overflow-hidden">
      <div class="absolute inset-0">
        <!-- Animated circles in background -->
        <div class="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div class="absolute w-96 h-96 rounded-full bg-indigo-400 opacity-20 -top-10 -right-16 animate-blob"></div>
          <div class="absolute w-96 h-96 rounded-full bg-purple-400 opacity-20 top-40 -left-20 animate-blob animation-delay-2000"></div>
          <div class="absolute w-80 h-80 rounded-full bg-indigo-300 opacity-20 bottom-20 right-32 animate-blob animation-delay-4000"></div>
        </div>
        
        <!-- Inventory-themed illustrations -->
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div class="text-6xl font-extrabold text-white tracking-tight text-center">
            <span class="block">InventoryXP</span>
            <span class="block text-2xl mt-2 font-normal">powered by Cold Gumbo</span>
          </div>
          <div class="mt-4 text-xl text-indigo-100 max-w-md text-center">
            Organize, track, and optimize your inventory with ease
          </div>
          
          <!-- Stylized inventory graphics -->
          <div class="mt-12 grid grid-cols-3 gap-8">
            <div class="bg-white bg-opacity-10 p-4 rounded-lg backdrop-filter backdrop-blur-sm shadow-lg transform hover:scale-105 transition duration-300">
              <svg class="w-10 h-10 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <p class="mt-2 text-white text-center text-sm">Track</p>
            </div>
            <div class="bg-white bg-opacity-10 p-4 rounded-lg backdrop-filter backdrop-blur-sm shadow-lg transform hover:scale-105 transition duration-300">
              <svg class="w-10 h-10 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
              </svg>
              <p class="mt-2 text-white text-center text-sm">Analyze</p>
            </div>
            <div class="bg-white bg-opacity-10 p-4 rounded-lg backdrop-filter backdrop-blur-sm shadow-lg transform hover:scale-105 transition duration-300">
              <svg class="w-10 h-10 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
              </svg>
              <p class="mt-2 text-white text-center text-sm">Sell</p>
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
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

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
    transform: translate3d(-90px, 0, 0);
  }
  100% {
    transform: translate3d(85px, 0, 0);
  }
}
</style> 