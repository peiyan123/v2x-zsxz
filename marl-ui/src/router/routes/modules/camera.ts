import { RoleEnum } from '../../../core/enums/roleEnum'
import type { RouteRecordRaw, RouteMeta } from 'vue-router'

const camera: RouteRecordRaw = {
  path: '/camera',
  name: 'Camera',
  component: () => import('@/layouts/DefaultLayout.vue'),
  redirect: '/camera/index',
  meta: {
    title: '摄像雷达',
    roles: [RoleEnum.SUPER, RoleEnum.TEST],
  },
  children: [
    {
      path: '/camera/index',
      name: 'CameraIndex',
      component: () => import('@/modules/camera/index.vue'),
      meta: {
        title: '摄像头管理',
        roles: [RoleEnum.SUPER, RoleEnum.TEST],
      },
    },
  ],
}

export default camera
