<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInventoryStore } from '../stores/inventory'
import MainLayout from '../layouts/MainLayout.vue'

const route = useRoute()
const router = useRouter()
const inventoryStore = useInventoryStore()

const itemId = parseInt(route.params.id)
const loading = ref(true)
const error = ref('')
const editing = ref(false)
const showDeleteConfirm = ref(false)

const editedItem = ref({
  title: '',
  description: '',
  cost: 0,
  listingPrice: 0,
  mainLocation: '',
  subLocation: '',
  listingPlatformID: null
})

// Computed properties
const item = computed(() => inventoryStore.currentItem)
const roi = computed(() => {
  if (!item.value || item.value.cost <= 0) return 0
  return ((item.value.listingPrice - item.value.cost) / item.value.cost * 100).toFixed(2)
})

const roiClass = computed(() => {
  const roiValue = parseFloat(roi.value)
  if (roiValue >= 50) return 'text-green-600'
  if (roiValue >= 20) return 'text-green-500'
  if (roiValue >= 0) return 'text-yellow-500'
  return 'text-red-500'
})

onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  error.value = ''
  
  try {
    await Promise.all([
      inventoryStore.fetchItemById(itemId),
      inventoryStore.fetchListingPlatforms()
    ])
    
    if (!inventoryStore.currentItem) {
      error.value = 'Item not found'
    }
  } catch (e) {
    error.value = 'Failed to load inventory item'
    console.error(e)
  } finally {
    loading.value = false
  }
}

function startEditing() {
  if (!item.value) return
  
  editedItem.value = { 
    ...item.value,
    // Make sure we're using primitive values for form inputs
    cost: Number(item.value.cost),
    listingPrice: Number(item.value.listingPrice),
    listingPlatformID: item.value.listingPlatformID
  }
  
  editing.value = true
}

async function saveChanges() {
  loading.value = true
  error.value = ''
  
  try {
    await inventoryStore.updateItem(itemId, editedItem.value)
    editing.value = false
  } catch (e) {
    error.value = 'Failed to update item'
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function deleteItem() {
  loading.value = true
  error.value = ''
  
  try {
    await inventoryStore.deleteItem(itemId)
    router.push({ name: 'inventory' })
  } catch (e) {
    error.value = 'Failed to delete item'
    console.error(e)
  } finally {
    showDeleteConfirm.value = false
    loading.value = false
  }
}
</script>

<template>
  <MainLayout>
    <div class="px-4 py-6">
      <div class="mb-6 flex items-center">
        <router-link 
          to="/inventory" 
          class="mr-4 text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Inventory
        </router-link>
      </div>
      
      <div v-if="loading" class="my-8 flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
      
      <div v-else-if="error" class="bg-red-100 p-4 rounded-md text-red-700 mb-6">
        {{ error }}
      </div>
      
      <div v-else-if="!item" class="text-center py-12">
        <p class="text-gray-500">Item not found</p>
        <router-link 
          to="/inventory" 
          class="mt-4 inline-block px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Go to Inventory
        </router-link>
      </div>
      
      <div v-else>
        <!-- View Mode -->
        <div v-if="!editing" class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-900">{{ item.title }}</h1>
            <div class="flex space-x-2">
              <button 
                @click="startEditing"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button 
                @click="showDeleteConfirm = true"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
          
          <div class="border-t border-gray-200">
            <dl>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Description</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ item.description || 'No description' }}</dd>
              </div>
              
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Cost</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${{ item.cost.toFixed(2) }}</dd>
              </div>
              
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Listing Price</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${{ item.listingPrice.toFixed(2) }}</dd>
              </div>
              
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">ROI</dt>
                <dd class="mt-1 text-sm sm:mt-0 sm:col-span-2" :class="roiClass">{{ roi }}%</dd>
              </div>
              
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Location</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ item.mainLocation }}{{ item.subLocation ? ' / ' + item.subLocation : '' }}
                </dd>
              </div>
              
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Listing Platform</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ item.listingPlatform ? item.listingPlatform.name : 'None' }}
                </dd>
              </div>
              
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ new Date(item.updatedAt).toLocaleString() }}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        <!-- Edit Mode -->
        <div v-else class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-900">Edit Item</h1>
          </div>
          
          <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
            <form @submit.prevent="saveChanges" class="space-y-4">
              <div>
                <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
                <input 
                  id="title" 
                  v-model="editedItem.title" 
                  type="text" 
                  required 
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                  id="description" 
                  v-model="editedItem.description" 
                  rows="3" 
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                ></textarea>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="cost" class="block text-sm font-medium text-gray-700">Cost ($)</label>
                  <input 
                    id="cost" 
                    v-model.number="editedItem.cost" 
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
                    v-model.number="editedItem.listingPrice" 
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
                    v-model="editedItem.mainLocation" 
                    type="text" 
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label for="subLocation" class="block text-sm font-medium text-gray-700">Sub Location</label>
                  <input 
                    id="subLocation" 
                    v-model="editedItem.subLocation" 
                    type="text" 
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label for="listingPlatform" class="block text-sm font-medium text-gray-700">Listing Platform</label>
                <select 
                  id="listingPlatform" 
                  v-model="editedItem.listingPlatformID" 
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
              
              <div class="flex justify-end space-x-3 pt-4">
                <button 
                  type="button"
                  @click="editing = false"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  :disabled="loading"
                  class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {{ loading ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
          
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Delete Item</h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Are you sure you want to delete this item? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button 
                type="button" 
                @click="deleteItem"
                :disabled="loading"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {{ loading ? 'Deleting...' : 'Delete' }}
              </button>
              <button 
                type="button" 
                @click="showDeleteConfirm = false"
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