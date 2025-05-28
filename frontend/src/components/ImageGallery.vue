<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/user'
import { uploadItemImage, removeItemImage, setPrimaryImage } from '../services/imageService'

const props = defineProps({
  itemId: {
    type: String,
    required: true
  },
  images: {
    type: Array,
    default: () => []
  },
  primaryImage: {
    type: Object,
    default: null
  },
  editable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:images', 'update:primaryImage', 'upload-success', 'upload-error', 'delete-success'])

const userStore = useUserStore()
const imageFileInput = ref(null)
const isUploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')
const sizeAlert = ref({ show: false, fileName: '', fileSize: 0 })

// Computed values
const sortedImages = computed(() => {
  // Put primary image first, then sort by upload date (newest first)
  return [...props.images].sort((a, b) => {
    // Primary image always comes first
    if (props.primaryImage && a.path === props.primaryImage.path) return -1
    if (props.primaryImage && b.path === props.primaryImage.path) return 1
    
    // Otherwise sort by upload date, newest first
    return b.uploadedAt - a.uploadedAt
  })
})

const hasImages = computed(() => props.images && props.images.length > 0)

const displayImage = computed(() => {
  if (props.primaryImage) return props.primaryImage
  if (hasImages.value) return props.images[0]
  return null
})

// Methods
function triggerFileInput() {
  if (imageFileInput.value) {
    imageFileInput.value.click()
  }
}

async function handleFileUpload(event) {
  const files = event.target.files
  if (!files || files.length === 0) return
  
  error.value = ''
  sizeAlert.value = { show: false, fileName: '', fileSize: 0 }
  isUploading.value = true
  uploadProgress.value = 0
  
  try {
    // Upload each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        error.value = 'Only image files are allowed'
        continue
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        error.value = `Image "${file.name}" exceeds the 5MB limit. Please resize the image and try again.`
        // Show the dedicated size alert
        sizeAlert.value = { 
          show: true, 
          fileName: file.name, 
          fileSize: (file.size / (1024 * 1024)).toFixed(2) 
        }
        continue
      }
      
      // Upload the image
      const imageData = await uploadItemImage(file, props.itemId, userStore.user.uid)
      
      // Add to images array
      const updatedImages = [...props.images, imageData]
      emit('update:images', updatedImages)
      
      // If this is the first image, set it as primary
      if (!props.primaryImage) {
        emit('update:primaryImage', imageData)
        await setPrimaryImage(props.itemId, imageData)
      }
      
      uploadProgress.value = ((i + 1) / files.length) * 100
      emit('upload-success', imageData)
    }
  } catch (err) {
    console.error('Upload error:', err)
    error.value = 'Failed to upload image: ' + (err.message || 'Unknown error')
    emit('upload-error', err)
  } finally {
    isUploading.value = false
    // Reset file input
    if (imageFileInput.value) {
      imageFileInput.value.value = ''
    }
  }
}

async function handleRemoveImage(image) {
  if (!image || !props.itemId) return
  
  try {
    await removeItemImage(image, props.itemId)
    
    // Remove from images array
    const updatedImages = props.images.filter(img => img.path !== image.path)
    emit('update:images', updatedImages)
    
    // If this was the primary image, set a new primary image
    if (props.primaryImage && props.primaryImage.path === image.path) {
      const newPrimary = updatedImages.length > 0 ? updatedImages[0] : null
      emit('update:primaryImage', newPrimary)
      
      if (newPrimary) {
        await setPrimaryImage(props.itemId, newPrimary)
      }
    }
    
    emit('delete-success', image)
  } catch (err) {
    console.error('Error removing image:', err)
    error.value = 'Failed to remove image: ' + (err.message || 'Unknown error')
  }
}

async function handleSetPrimary(image) {
  if (!image || !props.itemId) return
  
  try {
    await setPrimaryImage(props.itemId, image)
    emit('update:primaryImage', image)
  } catch (err) {
    console.error('Error setting primary image:', err)
    error.value = 'Failed to set primary image: ' + (err.message || 'Unknown error')
  }
}
</script>

<template>
  <div class="image-gallery">
    <!-- Storage Disabled Notice -->
    <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded shadow-sm">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-blue-700">
            Firebase Storage is currently disabled. Images are stored locally as base64 data and may not persist between sessions.
          </p>
        </div>
      </div>
    </div>
    
    <!-- Error display -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span>{{ error }}</span>
    </div>
    
    <!-- Image Size Alert -->
    <div v-if="sizeAlert.show" class="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4 rounded shadow-sm">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-amber-800">Image Size Limit Exceeded</h3>
          <div class="mt-2 text-sm text-amber-700">
            <p>
              The image <span class="font-semibold">{{ sizeAlert.fileName }}</span> is {{ sizeAlert.fileSize }}MB, which exceeds the 5MB limit.
            </p>
            <p class="mt-1">
              Please resize the image before uploading. You can use an online image compressor or image editing software.
            </p>
          </div>
          <div class="mt-3">
            <button
              @click="sizeAlert.show = false"
              class="text-sm text-amber-800 font-medium hover:text-amber-600 focus:outline-none"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Main image display -->
    <div class="main-image-container mb-4 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative">
      <img 
        v-if="displayImage" 
        :src="displayImage.url" 
        :alt="'Image of item'" 
        class="max-h-[400px] max-w-full object-contain"
      />
      <div v-else class="h-[300px] w-full flex items-center justify-center">
        <div class="text-center">
          <div class="text-gray-400 mb-2">
            <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
            </svg>
          </div>
          <p class="text-gray-500">No images available</p>
        </div>
      </div>
    </div>
    
    <!-- Upload progress indicator -->
    <div v-if="isUploading" class="mb-4">
      <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div class="bg-indigo-600 h-2.5 rounded-full" :style="{ width: `${uploadProgress}%` }"></div>
      </div>
      <p class="text-sm text-gray-500 mt-1">Uploading image...</p>
    </div>
    
    <!-- Image thumbnails -->
    <div v-if="hasImages" class="thumbnails-container flex space-x-2 overflow-x-auto p-2">
      <div 
        v-for="(image, index) in sortedImages" 
        :key="image.path"
        class="thumbnail-item relative group min-w-[80px] h-[80px]"
      >
        <img 
          :src="image.url" 
          :alt="`Thumbnail ${index + 1}`" 
          class="w-full h-full object-cover rounded-md border-2" 
          :class="{'border-indigo-500': props.primaryImage && props.primaryImage.path === image.path, 'border-transparent': !(props.primaryImage && props.primaryImage.path === image.path)}"
          @click="editable ? handleSetPrimary(image) : null"
        />
        
        <!-- Thumbnail controls (visible on hover) -->
        <div
          v-if="editable"
          class="absolute inset-0 bg-black bg-opacity-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2"
        >
          <button
            v-if="!(props.primaryImage && props.primaryImage.path === image.path)"
            @click="handleSetPrimary(image)"
            class="p-1 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 focus:outline-none"
            title="Set as primary image"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
          
          <button
            @click="handleRemoveImage(image)"
            class="p-1 rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none"
            title="Remove image"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Upload control -->
    <div v-if="editable" class="upload-controls mt-4">
      <input
        ref="imageFileInput"
        type="file"
        accept="image/*"
        multiple
        class="hidden"
        @change="handleFileUpload"
      />
      
      <button
        @click="triggerFileInput"
        :disabled="isUploading"
        class="flex items-center justify-center w-full py-2 px-4 border border-dashed border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
      >
        <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {{ isUploading ? 'Uploading...' : 'Upload Images' }}
      </button>
      
      <div class="mt-2 text-xs">
        <p class="text-gray-500">
          Upload up to 10 images. Supported formats: JPG, PNG, GIF.
        </p>
        <p class="font-medium text-amber-600">
          <svg class="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Images must be less than 5MB each
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-gallery {
  width: 100%;
}

.main-image-container {
  min-height: 300px;
}

/* Custom scrollbar for thumbnails */
.thumbnails-container::-webkit-scrollbar {
  height: 4px;
}

.thumbnails-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.thumbnails-container::-webkit-scrollbar-thumb {
  background: #c5c5c5;
  border-radius: 10px;
}

.thumbnails-container::-webkit-scrollbar-thumb:hover {
  background: #a3a3a3;
}
</style> 