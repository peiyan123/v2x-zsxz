import type { RouteRecordRaw, RouteMeta } from 'vue-router'

import test from './modules/test'
import mark from './modules/mark'
import camera from './modules/camera'
import mec from './modules/mec'
import road from './modules/road'
import radar from './modules/radar'
import rsu from './modules/rsu'
import task from './modules/task'
import group from './modules/group'
const routeModuleList: RouteRecordRaw[] = [test]

export const asyncRoutes = [mark, group, task, road]

const login: RouteRecordRaw = {
  path: '/login',
  name: 'Login',
  component: () => import('@/modules/login/Login.vue'),
  meta: {
    title: 'Loign',
  },
}

const baseRoute: RouteRecordRaw = {
  path: '/',
  redirect: '/group',
}

export const basicRoutes = [login, baseRoute, ...routeModuleList, ...asyncRoutes]
