import { RoleEnum } from './../../core/enums/roleEnum'
import { defineStore } from 'pinia'
import { Menu } from '@/router/types'
import { store } from '..'
import { RouteRecordRaw } from 'vue-router'
import { useUserStore } from './user'
import { toRaw } from 'vue'
import { asyncRoutes } from '@/router/routes'
import { filter } from '@/utils/helper/treeHelper'
import { transformRouteToMenu } from '@/router/helper/menuHelper'

interface PermissionState {
  frontMenuList: Menu[]
  isDynamicAddedRoute: boolean
}

export const usePermissionStore = defineStore({
  id: 'app-permission',
  state: (): PermissionState => {
    return {
      frontMenuList: [],
      isDynamicAddedRoute: false,
    }
  },
  getters: {
    getFrontMenuList(): Menu[] {
      return this.frontMenuList
    },
    getDynamicAddedRoute(): boolean {
      return this.isDynamicAddedRoute
    },
  },
  actions: {
    setDynamicAddedRoute(added: boolean) {
      this.isDynamicAddedRoute = added
    },

    setFrontMenuList(list: Menu[]) {
      this.frontMenuList = list
    },

    async buildRoutesAction(): Promise<RouteRecordRaw[]> {
      const userStore = useUserStore()
      let routes: RouteRecordRaw[] = []

      const roleList = toRaw(userStore.getRoleList) || []

      const routeFilter = (route: RouteRecordRaw) => {
        const { meta } = route
        const { roles } = meta || {}
        if (!roles) return true
        return roleList.some((role: RoleEnum) => (roles as RoleEnum[]).includes(role))
      }

      routes = filter(asyncRoutes, routeFilter)
      routes = routes.filter(routeFilter)
      const menuList = transformRouteToMenu(routes)

      this.setFrontMenuList(menuList)

      return routes
    },
  },
})

export function usePermissionStoreWithOut() {
  return usePermissionStore(store)
}
