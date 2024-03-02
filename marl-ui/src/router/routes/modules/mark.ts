import { RoleEnum } from '@/core/enums/roleEnum'
import type { RouteRecordRaw, RouteMeta } from 'vue-router'

const mark: RouteRecordRaw = {
  path: '/mark',
  name: 'Mark',
  component: () => import('@/layouts/MarkLayout.vue'),
  redirect: '/mark/index',
  meta: {
    title: '标定工具',
    roles: [RoleEnum.SUPER, RoleEnum.TEST],
    hiddenMenu: true,
  },
  children: [
    {
      path: '/mark/index',
      name: 'MarkIndex',
      component: () => import('@/modules/mark/index.vue'),
      meta: {
        title: '标定首页',
        roles: [RoleEnum.SUPER, RoleEnum.TEST],
      },
    },
  ],
}

export default mark
