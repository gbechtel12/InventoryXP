<script setup>
import { onMounted, ref } from 'vue'
import { useUserStore } from '../stores/user'
import { useInventoryStore } from '../stores/inventory'
import MainLayout from '../layouts/MainLayout.vue'

const userStore = useUserStore()
const inventoryStore = useInventoryStore()

const loading = ref(true)
const stats = ref({
  totalItems: 0,
  totalValue: 0,
  averageROI: 0
})

onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  
  try {
    await Promise.all([
      userStore.loadUser(),
      inventoryStore.fetchInventoryItems()
    ])
    
    calculateStats()
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    loading.value = false
  }
}

function calculateStats() {
  const items = inventoryStore.inventoryItems
  
  if (!items || items.length === 0) {
    stats.value = { totalItems: 0, totalValue: 0, averageROI: 0 }
    return
  }
  
  const totalItems = items.length
  const totalValue = items.reduce((sum, item) => sum + item.listingPrice, 0)
  const totalROI = items.reduce((sum, item) => {
    // Calculate ROI as percentage: (listingPrice - cost) / cost * 100
    const roi = item.cost > 0 ? ((item.listingPrice - item.cost) / item.cost) * 100 : 0
    return sum + roi
  }, 0)
  
  stats.value = {
    totalItems,
    totalValue: totalValue.toFixed(2),
    averageROI: totalItems > 0 ? (totalROI / totalItems).toFixed(2) : 0
  }
}
</script>

<template>
  <MainLayout>
    <div class="px-4 py-6">
      <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      <div v-if="loading" class="my-8 flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
      
      <div v-else class="mt-6">
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <!-- Total Items Card -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"></path>
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Total Items</dt>
                    <dd class="text-3xl font-semibold text-gray-900">{{ stats.totalItems }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Total Value Card -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Total Value</dt>
                    <dd class="text-3xl font-semibold text-gray-900">${{ stats.totalValue }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Average ROI Card -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Average ROI</dt>
                    <dd class="text-3xl font-semibold text-gray-900">{{ stats.averageROI }}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-8">
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Recent Inventory</h3>
              <router-link to="/inventory" class="text-sm text-indigo-600 hover:text-indigo-500">
                View All
              </router-link>
            </div>
            
            <div v-if="inventoryStore.inventoryItems.length === 0" class="px-4 py-12 text-center">
              <p class="text-gray-500">No inventory items found. Add your first item now!</p>
              <router-link to="/inventory" class="mt-4 inline-block px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                Add Item
              </router-link>
            </div>
            
            <div v-else class="divide-y divide-gray-200">
              <div v-for="item in inventoryStore.inventoryItems.slice(0, 5)" :key="item.itemID" class="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-sm font-medium text-indigo-600">{{ item.title }}</h4>
                    <p class="text-xs text-gray-500">Location: {{ item.mainLocation }} {{ item.subLocation ? '/ ' + item.subLocation : '' }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">${{ item.listingPrice.toFixed(2) }}</p>
                    <p class="text-xs text-gray-500">Cost: ${{ item.cost.toFixed(2) }}</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template> 