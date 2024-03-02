import { RoleEnum } from '../../../core/enums/roleEnum'
import type { RouteRecordRaw, RouteMeta } from 'vue-router'

const road: RouteRecordRaw = {
  path: '/road',
  name: 'Road',
  component: () => import('@/layouts/DefaultLayout.vue'),
  redirect: '/group/index3',
  meta: {
    title: '第三路',
  },
  children: [
    {
      path: '/group/index3',
      name: 'GroupManagement3',
      component: () => import('@/modules/group/index.vue'),
      meta: {
        title: 'Group管理',
        roles: [RoleEnum.SUPER, RoleEnum.TEST],
      },
    },
    {
      path: '/task/index3',
      name: 'TaskManagement3',
      component: () => import('@/modules/task/index.vue'),
      meta: {
        title: 'Task管理',
        roles: [RoleEnum.SUPER, RoleEnum.TEST],
      },
    },
    {
      path: '/road/index3',
      name: 'holo3',
      component: () => import('@/modules/road/index.vue'),
      meta: {
        title: '全息路口',
        roles: [RoleEnum.SUPER, RoleEnum.TEST],
      },
    },
  ],
}

export default road
