import { usePermissionStoreWithOut } from '@/store/modules/permission'
import { useUserStoreWithOut } from '@/store/modules/user'
import { Router, RouteRecordRaw } from 'vue-router'
import * as userApi from '@/services/api/userApi'
import { Modal } from 'ant-design-vue'

/**
 * 获取第三方Token并调用接口进行登录
 * @param token {String} token字符串
 * @param from {Object} 跳转页面对象
 */
async function getTokenAndLogin(token, from) {
  // 如果本地没有存储token，且跳转的页面是默认主页，且window.name有值，则调用使用第三方Token进行登录的接口获取token
  if (!token && from.path == '/' && window.name) {
    const { data } = await userApi.loginWithToken({ tokenKey: window.name })
    // 如果获取到我方服务的token，则保存在本地
    if (data.token) {
      localStorage.setItem('token', `Bearer ${data.token}`)
    } else {
      // 没有获取到token，则弹窗提示登录失败
      await new Promise((resovle, reject) => {
        Modal.error({
          title: '登录出错',
          content: 'token验证失败，请重新登录',
          okText: '确定',
          onOk: () => {
            resovle('')
          },
        })
      })
      window.close()
    }
    // 清空indow.name的值，避免下次调用本函数时进入if条件中
    window.name = ''
  }
}
export function createPermissionGuard(router: Router) {
  const userStore = useUserStoreWithOut()
  const permissionStore = usePermissionStoreWithOut()

  router.beforeEach(async (to, from, next) => {
    const token = localStorage.getItem('token')
    await getTokenAndLogin(token, from)
    const noVerifyPathList = ['/login', '/test/index']
    // 没有token返回登录，exclude登录页
    if (!token && !noVerifyPathList.includes(to.path)) {
      return next('/login')
    }
    if (token && to.path == '/login') {
      return next('/')
    }
    if (permissionStore.getDynamicAddedRoute) {
      next()
      return
    }

    // 获取用户信息
    await userStore.getUserInfoAction()
    // 动态添加路由 设置导航菜单
    const routes = await permissionStore.buildRoutesAction()

    routes.forEach((route) => {
      router.addRoute(route as unknown as RouteRecordRaw)
    })

    permissionStore.setDynamicAddedRoute(true)

    // 动态添加路由后，此处应当重定向到fullPath，否则会加载404页面内容
    next({ path: to.fullPath, replace: true, query: to.query })
  })
}
