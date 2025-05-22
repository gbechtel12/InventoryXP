<script setup>
// Navbar is already included in App.vue, so we don't need it here
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Removed duplicate Navbar -->
    
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <slot></slot>
    </main>
    
    <footer class="bg-white py-4 border-t">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-center text-gray-500 text-sm">
          InventoryXP &copy; {{ new Date().getFullYear() }}
        </p>
      </div>
    </footer>
  </div>
</template> 