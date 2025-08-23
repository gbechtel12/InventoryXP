<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white shadow rounded-lg">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <h1 class="text-2xl font-bold text-gray-900">About InventoryXP</h1>
          <p class="mt-1 text-sm text-gray-500">
            Desktop application information and system details
          </p>
        </div>

        <!-- Content -->
        <div class="px-6 py-6">
          <!-- App Info -->
          <div class="mb-8">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Application Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <dt class="text-sm font-medium text-gray-500">Application Name</dt>
                <dd class="mt-1 text-lg text-gray-900">InventoryXP</dd>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <dt class="text-sm font-medium text-gray-500">Version</dt>
                <dd class="mt-1 text-lg text-gray-900">
                  <span v-if="loading" class="text-gray-400">Loading...</span>
                  <span v-else-if="error" class="text-red-600">{{ error }}</span>
                  <span v-else class="text-green-600">{{ appVersion }}</span>
                </dd>
              </div>
            </div>
          </div>

          <!-- System Info -->
          <div class="mb-8">
            <h2 class="text-lg font-medium text-gray-900 mb-4">System Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <dt class="text-sm font-medium text-gray-500">Platform</dt>
                <dd class="mt-1 text-lg text-gray-900">
                  <span v-if="loading" class="text-gray-400">Loading...</span>
                  <span v-else-if="error" class="text-red-600">{{ error }}</span>
                  <span v-else class="text-blue-600">{{ platform }}</span>
                </dd>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <dt class="text-sm font-medium text-gray-500">Environment</dt>
                <dd class="mt-1 text-lg text-gray-900">
                  <span v-if="isTauri" class="text-green-600">Desktop App (Tauri)</span>
                  <span v-else class="text-blue-600">Web Browser</span>
                </dd>
              </div>
            </div>
          </div>

          <!-- Repository Info -->
          <div class="mb-8">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Repository Information</h2>
            <div class="bg-gray-50 p-4 rounded-lg">
              <dt class="text-sm font-medium text-gray-500">Current Repository</dt>
              <dd class="mt-1 text-lg text-gray-900">
                <span v-if="isTauri" class="text-green-600">
                  {{ repoType === 'mock' ? 'Mock Repository (In-Memory)' : 'Cloud Repository (Firebase)' }}
                </span>
                <span v-else class="text-blue-600">Web Mode</span>
              </dd>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-3">
            <button
              @click="refreshInfo"
              :disabled="loading"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="-ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ loading ? 'Refreshing...' : 'Refresh Information' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAppVersion, getPlatform, isTauri } from '../bridge/tauri'

// Reactive data
const appVersion = ref('')
const platform = ref('')
const loading = ref(false)
const error = ref('')
const repoType = ref('')

// Check if running in Tauri and get repository type
onMounted(() => {
  if (isTauri()) {
    repoType.value = import.meta.env.VITE_REPO === 'mock' ? 'mock' : 'cloud'
  }
  loadSystemInfo()
})

// Load system information from Tauri
async function loadSystemInfo() {
  if (!isTauri()) {
    error.value = 'Not running in Tauri environment'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const [version, platformInfo] = await Promise.all([
      getAppVersion(),
      getPlatform()
    ])
    
    appVersion.value = version
    platform.value = platformInfo
  } catch (err) {
    console.error('Failed to load system info:', err)
    error.value = err.message || 'Failed to load system information'
  } finally {
    loading.value = false
  }
}

// Refresh system information
async function refreshInfo() {
  await loadSystemInfo()
}
</script>
