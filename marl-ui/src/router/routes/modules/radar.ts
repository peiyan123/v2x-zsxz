import { RoleEnum } from '../../../core/enums/roleEnum'
import type { RouteRecordRaw, RouteMeta } from 'vue-router'

const radar: RouteRecordRaw = {
  path: '/radar',
  name: 'Radar',
  component: () => import('@/layouts/DefaultLayout.vue'),
  redirect: '/radar/index',
  meta: {
    title: 'RADAR',
    roles: [RoleEnum.SUPER, RoleEnum.TEST],
  },
  children: [
    {
      path: '/radar/index',
      name: 'radar',
      component: () => import('@/modules/radar/index.vue'),
      meta: {
        title: '雷达管理',
        roles: [RoleEnum.SUPER, RoleEnum.TEST],
      },
    },
  ],
}

export default radar
