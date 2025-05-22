<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const mobileMenuOpen = ref(false)

const isAuthenticated = computed(() => userStore.isAuthenticated)
const userName = computed(() => userStore.userName || 'User')

function logout() {
  userStore.logout()
  router.push('/login')
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

// Close mobile menu when changing routes
onMounted(() => {
  router.afterEach(() => {
    mobileMenuOpen.value = false
  })
})
</script>

<template>
  <nav class="bg-gradient-to-r from-indigo-600 to-indigo-800 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo and desktop navigation -->
        <div class="flex items-center">
          <div class="flex-shrink-0 flex items-center">
            <router-link to="/" class="text-white font-bold text-xl flex items-center">
              <span class="text-2xl mr-2">📦</span> InventoryXP
            </router-link>
          </div>
          
          <!-- Desktop Navigation Links -->
          <div v-if="isAuthenticated" class="hidden md:ml-6 md:flex md:space-x-4">
            <router-link 
              to="/" 
              class="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
              active-class="bg-indigo-700 text-white"
            >
              Dashboard
            </router-link>
            
            <router-link 
              to="/inventory" 
              class="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
              active-class="bg-indigo-700 text-white"
            >
              Inventory
            </router-link>
          </div>
        </div>
        
        <!-- User menu and logout for desktop -->
        <div class="hidden md:flex md:items-center">
          <div v-if="isAuthenticated" class="flex items-center">
            <router-link 
              to="/settings" 
              class="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out mr-2"
              active-class="bg-indigo-700 text-white"
            >
              Settings
            </router-link>
            <div class="text-white mr-4 flex items-center">
              <span class="h-8 w-8 rounded-full bg-indigo-400 flex items-center justify-center mr-2">
                {{ userName.charAt(0).toUpperCase() }}
              </span>
              <span class="text-sm font-medium">{{ userName }}</span>
            </div>
            <button 
              @click="logout" 
              class="px-3 py-2 rounded text-sm font-medium text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
            >
              Logout
            </button>
          </div>
          
          <div v-else class="flex items-center space-x-4">
            <router-link 
              to="/login" 
              class="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
            >
              Login
            </router-link>
            
            <router-link 
              to="/register" 
              class="bg-white text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-md text-sm font-medium shadow-sm transition duration-150 ease-in-out"
            >
              Register
            </router-link>
          </div>
        </div>
        
        <!-- Mobile menu button -->
        <div class="flex items-center md:hidden">
          <button 
            @click="toggleMobileMenu" 
            class="inline-flex items-center justify-center p-2 rounded-md text-indigo-100 hover:text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            aria-expanded="false"
          >
            <span class="sr-only">Open main menu</span>
            <!-- Icon when menu is closed -->
            <svg 
              v-if="!mobileMenuOpen" 
              class="block h-6 w-6" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <!-- Icon when menu is open -->
            <svg 
              v-else 
              class="block h-6 w-6" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu, show/hide based on menu state -->
    <div 
      v-if="mobileMenuOpen" 
      class="md:hidden bg-indigo-700"
    >
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <template v-if="isAuthenticated">
          <router-link 
            to="/" 
            class="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-600"
            active-class="bg-indigo-800 text-white"
          >
            Dashboard
          </router-link>
          
          <router-link 
            to="/inventory" 
            class="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-600"
            active-class="bg-indigo-800 text-white"
          >
            Inventory
          </router-link>
          
          <router-link 
            to="/settings" 
            class="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-600"
            active-class="bg-indigo-800 text-white"
          >
            Settings
          </router-link>
        </template>
      </div>
      
      <!-- Mobile user menu -->
      <div class="pt-4 pb-3 border-t border-indigo-800">
        <div v-if="isAuthenticated" class="flex items-center px-5">
          <div class="flex-shrink-0">
            <div class="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium">
              {{ userName.charAt(0).toUpperCase() }}
            </div>
          </div>
          <div class="ml-3">
            <div class="text-base font-medium text-white">{{ userName }}</div>
          </div>
          <button 
            @click="logout"
            class="ml-auto flex-shrink-0 p-1 rounded-full text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-800 focus:ring-white"
          >
            <span class="px-3 py-2 rounded text-sm font-medium bg-indigo-600">Logout</span>
          </button>
        </div>
        
        <div v-else class="px-2 py-3 space-y-1">
          <router-link 
            to="/login" 
            class="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-600"
          >
            Login
          </router-link>
          
          <router-link 
            to="/register" 
            class="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-600"
          >
            Register
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template> 