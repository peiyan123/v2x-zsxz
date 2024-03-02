import { RoleEnum } from '../../../core/enums/roleEnum'
import type { RouteRecordRaw, RouteMeta } from 'vue-router'

const rsu: RouteRecordRaw = {
  path: '/rsu',
  name: 'Rsu',
  component: () => import('@/layouts/DefaultLayout.vue'),
  redirect: '/rsu/index',
  meta: {
    title: 'RSU',
    roles: [RoleEnum.SUPER, RoleEnum.TEST],
    hideMenu: true,
  },
  children: [
    {
      path: '/rsu/index',
      name: 'rsu',
      component: () => import('@/modules/rsu/index.vue'),
      meta: {
        title: 'RSU管理',
        roles: [RoleEnum.SUPER, RoleEnum.TEST],
      },
    },
  ],
}

export default rsu
