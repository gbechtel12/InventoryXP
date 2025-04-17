<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const isAuthenticated = computed(() => userStore.isAuthenticated)
const username = computed(() => userStore.userInfo?.username || 'User')

function logout() {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="bg-indigo-600 shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <router-link to="/" class="text-white font-bold text-xl">InventoryXP</router-link>
          </div>
          
          <div v-if="isAuthenticated" class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <router-link 
              to="/" 
              class="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium"
              active-class="bg-indigo-700"
            >
              Dashboard
            </router-link>
            
            <router-link 
              to="/inventory" 
              class="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium"
              active-class="bg-indigo-700"
            >
              Inventory
            </router-link>
          </div>
        </div>
        
        <div v-if="isAuthenticated" class="flex items-center">
          <span class="text-white mr-4">{{ username }}</span>
          <button 
            @click="logout" 
            class="px-3 py-2 rounded text-sm text-white bg-indigo-700 hover:bg-indigo-800"
          >
            Logout
          </button>
        </div>
        
        <div v-else class="flex items-center space-x-4">
          <router-link 
            to="/login" 
            class="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium"
          >
            Login
          </router-link>
          
          <router-link 
            to="/register" 
            class="bg-white text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-md text-sm font-medium"
          >
            Register
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template> 