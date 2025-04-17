<script setup>
import { ref, onMounted, computed } from 'vue'
import { useInventoryStore } from '../stores/inventory'
import MainLayout from '../layouts/MainLayout.vue'
import ItemCard from '../components/ItemCard.vue'

const inventoryStore = useInventoryStore()
const loading = ref(true)
const searchQuery = ref('')
const showAddModal = ref(false)

const newItem = ref({
  title: '',
  description: '',
  cost: 0,
  listingPrice: 0,
  mainLocation: '',
  subLocation: '',
  listingPlatformID: null
})

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      inventoryStore.fetchInventoryItems(),
      inventoryStore.fetchListingPlatforms()
    ])
  } catch (error) {
    console.error('Failed to load inventory data:', error)
  } finally {
    loading.value = false
  }
})

const filteredItems = computed(() => {
  if (!searchQuery.value) return inventoryStore.inventoryItems
  
  const query = searchQuery.value.toLowerCase()
  return inventoryStore.inventoryItems.filter(item => 
    item.title.toLowerCase().includes(query) || 
    (item.description && item.description.toLowerCase().includes(query)) ||
    item.mainLocation.toLowerCase().includes(query) ||
    (item.subLocation && item.subLocation.toLowerCase().includes(query))
  )
})

async function handleAddItem() {
  try {
    await inventoryStore.createItem(newItem.value)
    resetForm()
    showAddModal.value = false
  } catch (error) {
    console.error('Failed to create item:', error)
  }
}

function resetForm() {
  newItem.value = {
    title: '',
    description: '',
    cost: 0,
    listingPrice: 0,
    mainLocation: '',
    subLocation: '',
    listingPlatformID: null
  }
}

async function deleteItem(id) {
  if (confirm('Are you sure you want to delete this item?')) {
    try {
      await inventoryStore.deleteItem(id)
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }
}
</script>

<template>
  <MainLayout>
    <div class="px-4 py-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Inventory</h1>
        <button 
          @click="showAddModal = true"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add Item
        </button>
      </div>
      
      <div class="mb-6">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search inventory..."
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="my-8 flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
      
      <div v-else-if="filteredItems.length === 0" class="text-center py-12">
        <p class="text-gray-500">No inventory items found.</p>
        <button 
          @click="showAddModal = true"
          class="mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add Your First Item
        </button>
      </div>
      
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ItemCard 
          v-for="item in filteredItems" 
          :key="item.itemID" 
          :item="item"
        >
          <template #actions>
            <button 
              @click="deleteItem(item.itemID)"
              class="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
          </template>
        </ItemCard>
      </div>
      
      <!-- Add Item Modal -->
      <div v-if="showAddModal" class="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
          
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Add New Inventory Item</h3>
              
              <form @submit.prevent="handleAddItem" class="space-y-4">
                <div>
                  <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
                  <input 
                    id="title" 
                    v-model="newItem.title" 
                    type="text" 
                    required 
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea 
                    id="description" 
                    v-model="newItem.description" 
                    rows="3" 
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  ></textarea>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="cost" class="block text-sm font-medium text-gray-700">Cost ($)</label>
                    <input 
                      id="cost" 
                      v-model.number="newItem.cost" 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      required 
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label for="listingPrice" class="block text-sm font-medium text-gray-700">Listing Price ($)</label>
                    <input 
                      id="listingPrice" 
                      v-model.number="newItem.listingPrice" 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      required 
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="mainLocation" class="block text-sm font-medium text-gray-700">Main Location</label>
                    <input 
                      id="mainLocation" 
                      v-model="newItem.mainLocation" 
                      type="text" 
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label for="subLocation" class="block text-sm font-medium text-gray-700">Sub Location</label>
                    <input 
                      id="subLocation" 
                      v-model="newItem.subLocation" 
                      type="text" 
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label for="listingPlatform" class="block text-sm font-medium text-gray-700">Listing Platform</label>
                  <select 
                    id="listingPlatform" 
                    v-model="newItem.listingPlatformID" 
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option :value="null">None</option>
                    <option 
                      v-for="platform in inventoryStore.listingPlatforms" 
                      :key="platform.platformID" 
                      :value="platform.platformID"
                    >
                      {{ platform.name }}
                    </option>
                  </select>
                </div>
              </form>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button 
                type="button" 
                @click="handleAddItem"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Add Item
              </button>
              <button 
                type="button" 
                @click="showAddModal = false"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </MainLayout>
</template> 