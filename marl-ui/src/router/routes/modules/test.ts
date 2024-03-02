import type { RouteRecordRaw, RouteMeta } from 'vue-router'

const test: RouteRecordRaw = {
  path: '/test',
  name: 'Test',
  component: () => import('@/layouts/DefaultLayout.vue'),
  redirect: '/test/index',
  meta: {
    title: 'Test',
  },
  children: [
    {
      path: '/test/index',
      name: 'Index',
      component: () => import('@/modules/test/index.vue'),
      meta: {
        title: 'Index',
      },
    },
  ],
}

export default test
