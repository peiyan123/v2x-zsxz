import { createApp } from 'vue'
import App from './App.vue'
import 'tailwindcss/tailwind.css'
import { setupRouter, router } from './router'
import { setupStore } from '@/store'
import { setupAntd } from './core/lazyUse'
import { setupI18n } from './i18n'
import { setupRouterGuard } from './router/guard'
import '@/styles/index.less'
import VConsole from 'vconsole'
import Markdown from 'vue3-markdown-it'
if (process.env.NODE_ENV === 'development') {
  // new VConsole()
}

const app = createApp(App)
app.use(Markdown)

setupRouter(app)

setupRouterGuard(router)

setupAntd(app)

setupStore(app)

setupI18n(app)

app.mount('#app')
