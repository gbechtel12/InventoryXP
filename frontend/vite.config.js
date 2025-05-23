import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [vue()],
    base: '/',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: 3000,
      cors: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5247',
          changeOrigin: true,
          secure: false
        }
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: false,
      // Generate SPA fallback for hosting platforms
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['vue', 'vue-router', 'pinia', 'firebase'],
            'ui': ['tailwindcss']
          }
        }
      }
    }
  }
  
  return config
}) 