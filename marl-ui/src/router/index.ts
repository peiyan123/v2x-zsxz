import { createRouter, createWebHashHistory, createWebHistory, RouteRecordRaw } from 'vue-router'

import { basicRoutes } from './routes'
import type { App } from 'vue'

export const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes: basicRoutes as unknown as RouteRecordRaw[],
  strict: false,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

// config router
export function setupRouter(app: App) {
  app.use(router)
}
