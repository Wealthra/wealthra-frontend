import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { isAuthenticated, isAdmin } from './utils/auth'

// Initialize the app
const app = createApp(App)
app.use(createPinia())
app.use(router)

// Check for existing authentication before mounting
const isUserAuthenticated = isAuthenticated()
const isUserAdmin = isAdmin()

// If the user is authenticated and if admin direct to admin page if not direct to dashboard if not authenticated direct to landing page
const initialRoute = isUserAuthenticated ? (isUserAdmin ? '/admin' : '/dashboard') : '/'

// Mount the app with initial route if needed
app.mount('#app')

router.push(initialRoute)
