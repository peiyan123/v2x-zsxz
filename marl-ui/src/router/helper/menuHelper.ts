import { RouteRecordRaw } from 'vue-router'
import { Menu } from '../types'

export function transformRouteToMenu(routeModList: RouteRecordRaw[]): Menu[] {
  function listMap(list: RouteRecordRaw[]): Menu[] {
    return list.map((node: any) => {
      const { meta = {}, children } = node
      return {
        ...meta,
        path: node.path,
        redirect: node.redirect,
        children: children && listMap(children),
      }
    })
  }

  return listMap(routeModList)
}
