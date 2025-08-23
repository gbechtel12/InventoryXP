import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { provideRepo } from './domain/repo'
import { CloudRepo } from './data/CloudRepo'
import { MockRepo } from './mocks/MockRepo'

const app = createApp(App)

// Determine which repository to use based on environment
const repo = import.meta.env.VITE_REPO === 'mock' ? new MockRepo() : new CloudRepo()

// Provide the repository to the app
provideRepo(repo)

app.use(createPinia())
app.use(router)

app.mount('#app') 