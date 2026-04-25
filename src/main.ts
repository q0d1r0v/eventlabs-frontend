import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { pinia } from './stores'
import { registerUnauthorizedHandler } from './services/api'
import { useAuthStore } from './stores/auth'
import './style.css'

const app = createApp(App)
app.use(pinia)
app.use(router)

const auth = useAuthStore()

registerUnauthorizedHandler(() => {
  auth.reset()
  if (router.currentRoute.value.meta.requiresAuth) {
    router.push({
      name: 'login',
      query: { redirect: router.currentRoute.value.fullPath },
    })
  }
})

app.mount('#app')
