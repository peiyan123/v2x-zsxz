import { RoleEnum } from '../../../core/enums/roleEnum'
import type { RouteRecordRaw, RouteMeta } from 'vue-router'

const mec: RouteRecordRaw = {
  path: '/mec',
  name: 'Mec',
  component: () => import('@/layouts/DefaultLayout.vue'),
  redirect: '/mec/index',
  meta: {
    title: 'MEC',
    roles: [RoleEnum.SUPER, RoleEnum.TEST],
  },
  children: [
    {
      path: '/mec/index',
      name: 'MecInfo',
      component: () => import('@/modules/mec/index.vue'),
      meta: {
        title: 'MEC设备管理',
        roles: [RoleEnum.SUPER, RoleEnum.TEST],
      },
    },
  ],
}

export default mec
