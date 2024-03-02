import { RoleEnum } from '../../../core/enums/roleEnum'
import type { RouteRecordRaw, RouteMeta } from 'vue-router'

const mec: RouteRecordRaw = {
  path: '/group',
  name: 'Group',
  component: () => import('@/layouts/DefaultLayout.vue'),
  redirect: '/group/index',
  meta: {
    title: '第一路',
  },
  children: [
    {
      path: '/group/index',
      name: 'GroupManagement1',
      component: () => import('@/modules/group/index.vue'),
      meta: {
        title: 'Group管理',
        roles: [RoleEnum.SUPER, RoleEnum.TEST],
      },
    },
    {
      path: '/task/index',
      name: 'TaskManagement1',
      component: () => import('@/modules/task/index.vue'),
      meta: {
        title: 'Task管理',
        roles: [RoleEnum.SUPER, RoleEnum.TEST],
      },
    },
    {
      path: '/road/index',
      name: 'holo1',
      component: () => import('@/modules/road/index.vue'),
      meta: {
        title: '全息路口',
        roles: [RoleEnum.SUPER, RoleEnum.TEST],
      },
    },
  ],
}

export default mec
