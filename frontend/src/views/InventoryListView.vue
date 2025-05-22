<script setup>
import { ref, onMounted, computed } from 'vue'
import { useInventoryStore } from '../stores/inventory'
import { useAuth } from '../composables/useAuth'
import { addInventoryItem, deleteInventoryItem, calculateRoi } from '../services/inventoryService'
import MainLayout from '../layouts/MainLayout.vue'
import ItemCard from '../components/ItemCard.vue'

const inventoryStore = useInventoryStore()
const { currentUser } = useAuth()
const loading = ref(true)
const searchQuery = ref('')
const showAddModal = ref(false)
const formError = ref('')
const isSaving = ref(false)
const isDeleting = ref(false)
const deleteError = ref('')

const newItem = ref({
  title: '',
  description: '',
  cost: 0,
  listPrice: 0,
  location: '',
  subLocation: '',
  subSubLocation: '',
  listedOn: ''
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
    (item.location && item.location.toLowerCase().includes(query)) ||
    (item.subLocation && item.subLocation.toLowerCase().includes(query))
  )
})

async function handleAddItem() {
  formError.value = ''
  
  // Form validation
  if (!newItem.value.title.trim()) {
    formError.value = 'Title is required'
    return
  }
  
  if (newItem.value.cost < 0 || newItem.value.listPrice < 0) {
    formError.value = 'Cost and listing price must be non-negative'
    return
  }
  
  if (!currentUser.value) {
    formError.value = 'You must be logged in to add inventory items'
    return
  }
  
  try {
    isSaving.value = true
    
    // Prepare the item data
    const itemData = {
      ...newItem.value,
      // Ensure numeric fields are properly typed
      cost: Number(newItem.value.cost),
      listPrice: Number(newItem.value.listPrice),
      // Calculate ROI
      roi: calculateRoi(Number(newItem.value.cost), Number(newItem.value.listPrice))
    }
    
    // Add to Firestore
    await addInventoryItem(itemData, currentUser.value.uid)
    
    // Reset form and close modal
    resetForm()
    showAddModal.value = false
    
    // Refresh the inventory list
    await inventoryStore.fetchInventoryItems()
  } catch (error) {
    console.error('Failed to create item:', error)
    formError.value = error.message || 'Failed to create item. Please try again.'
  } finally {
    isSaving.value = false
  }
}

function resetForm() {
  newItem.value = {
    title: '',
    description: '',
    cost: 0,
    listPrice: 0,
    location: '',
    subLocation: '',
    subSubLocation: '',
    listedOn: ''
  }
  formError.value = ''
}

async function deleteItem(id) {
  if (!confirm('Are you sure you want to delete this item?')) {
    return
  }
  
  isDeleting.value = true
  deleteError.value = ''
  
  try {
    if (!currentUser.value) {
      deleteError.value = 'You must be logged in to delete inventory items'
      return
    }
    
    // Delete from Firestore
    await deleteInventoryItem(id)
    
    // Refresh the inventory list
    await inventoryStore.fetchInventoryItems()
  } catch (error) {
    console.error('Failed to delete item:', error)
    deleteError.value = error.message || 'Failed to delete item. Please try again.'
    // Show error message to user
    alert(`Error deleting item: ${deleteError.value}`)
  } finally {
    isDeleting.value = false
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
              @click="deleteItem(item.id || item.itemID)"
              :disabled="isDeleting"
              class="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="isDeleting" class="animate-spin -ml-0.5 mr-1 h-3 w-3 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
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
              
              <!-- Form Error Message -->
              <div v-if="formError" class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm text-red-700">{{ formError }}</p>
                  </div>
                </div>
              </div>
              
              <form @submit.prevent="handleAddItem" class="space-y-4">
                <!-- Title Field -->
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
                
                <!-- Description Field -->
                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea 
                    id="description" 
                    v-model="newItem.description" 
                    rows="3" 
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  ></textarea>
                </div>
                
                <!-- Cost and Listing Price Fields -->
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
                    <label for="listPrice" class="block text-sm font-medium text-gray-700">Listing Price ($)</label>
                    <input 
                      id="listPrice" 
                      v-model.number="newItem.listPrice" 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      required 
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <!-- ROI Display -->
                <div v-if="newItem.cost > 0" class="text-sm bg-gray-50 p-2 rounded">
                  <span class="font-medium">Calculated ROI:</span> 
                  <span :class="newItem.cost > 0 ? 'text-green-600 font-medium' : ''">
                    {{ calculateRoi(newItem.cost, newItem.listPrice) }}%
                  </span>
                </div>
                
                <!-- Location Fields -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="location" class="block text-sm font-medium text-gray-700">Location</label>
                    <input 
                      id="location" 
                      v-model="newItem.location" 
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
                
                <!-- Additional Location & Platform -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="subSubLocation" class="block text-sm font-medium text-gray-700">Sub-Sub Location</label>
                    <input 
                      id="subSubLocation" 
                      v-model="newItem.subSubLocation" 
                      type="text" 
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label for="listedOn" class="block text-sm font-medium text-gray-700">Listed On</label>
                    <input 
                      id="listedOn" 
                      v-model="newItem.listedOn" 
                      type="text" 
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="e.g. eBay, Etsy"
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button 
                type="button" 
                @click="handleAddItem"
                :disabled="isSaving"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isSaving ? 'Saving...' : 'Add Item' }}
              </button>
              <button 
                type="button" 
                @click="showAddModal = false"
                :disabled="isSaving"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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