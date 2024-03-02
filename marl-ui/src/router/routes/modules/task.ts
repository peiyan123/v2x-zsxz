import { RoleEnum } from '../../../core/enums/roleEnum'
import type { RouteRecordRaw, RouteMeta } from 'vue-router'

const mec: RouteRecordRaw = {
  path: '/task',
  name: 'Task',
  component: () => import('@/layouts/DefaultLayout.vue'),
  redirect: '/group/index2',
  meta: {
    title: '第二路',
  },
  children: [
    {
      path: '/group/index2',
      name: 'GroupManagement2',
      component: () => import('@/modules/group/index.vue'),
      meta: {
        title: 'Group管理',
        roles: [RoleEnum.SUPER, RoleEnum.TEST],
      },
    },
    {
      path: '/task/index2',
      name: 'TaskManagement2',
      component: () => import('@/modules/task/index.vue'),
      meta: {
        title: 'Task管理',
        roles: [RoleEnum.SUPER, RoleEnum.TEST],
      },
    },
    {
      path: '/road/index2',
      name: 'holo2',
      component: () => import('@/modules/road/index.vue'),
      meta: {
        title: '全息路口',
        roles: [RoleEnum.SUPER, RoleEnum.TEST],
      },
    },
  ],
}

export default mec
