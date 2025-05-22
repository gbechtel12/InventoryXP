<script setup>
import { RouterView, useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import { computed } from 'vue'

const route = useRoute()
const isLoginPage = computed(() => route.path === '/login' || route.path === '/register')
</script>

<template>
  <div class="min-h-screen" :class="{ 'bg-gray-50': !isLoginPage }">
    <Navbar v-if="!isLoginPage" />
    <main :class="{ 'max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8': !isLoginPage }">
      <RouterView />
    </main>
  </div>
</template>

<style>
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  margin: 0;
  padding: 0;
}
</style> 