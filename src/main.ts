import './assets/css/main.css'
import 'vue-sonner/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createUnhead } from '@unhead/vue'

import App from './App.vue'
import router from './router'
import i18n from './i18n'

// Tema é inicializado automaticamente no composable
import './composables/useTheme'

const app = createApp(App)
const head = createUnhead()

app.use(createPinia())
app.use(router)
app.use(i18n)

// Provide head instance for useHead composable
app.provide('usehead', head)

app.mount('#app')
