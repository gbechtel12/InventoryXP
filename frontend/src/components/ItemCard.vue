<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const roi = computed(() => {
  if (props.item.cost <= 0) return 0
  return ((props.item.listingPrice - props.item.cost) / props.item.cost * 100).toFixed(2)
})

const roiClass = computed(() => {
  const roiValue = parseFloat(roi.value)
  if (roiValue >= 50) return 'text-green-600'
  if (roiValue >= 20) return 'text-green-500'
  if (roiValue >= 0) return 'text-yellow-500'
  return 'text-red-500'
})
</script>

<template>
  <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
    <div class="px-4 py-5 sm:p-6">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-lg font-medium text-gray-900 truncate">{{ item.title }}</h3>
          <p v-if="item.description" class="mt-1 text-sm text-gray-500 line-clamp-2">{{ item.description }}</p>
        </div>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="roiClass">
          {{ roi }}% ROI
        </span>
      </div>
      
      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-gray-500">
          <div class="flex items-center">
            <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{{ item.mainLocation }}{{ item.subLocation ? ' / ' + item.subLocation : '' }}</span>
          </div>
          <div v-if="item.listingPlatform" class="flex items-center mt-1">
            <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span>{{ item.listingPlatform.name }}</span>
          </div>
        </div>
        <div class="text-right">
          <div class="text-lg font-medium text-gray-900">${{ item.listingPrice.toFixed(2) }}</div>
          <div class="text-sm text-gray-500">Cost: ${{ item.cost.toFixed(2) }}</div>
        </div>
      </div>
      
      <div class="mt-4 flex justify-end space-x-2">
        <router-link :to="`/inventory/${item.itemID}`" 
          class="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          View
        </router-link>
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template> 