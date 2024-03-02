import { LoginRequest, ResetFormState } from '@/types/user'
import { httpGet, httpPost, requestConfig } from '../httpServices'

export function login(data: LoginRequest) {
  return httpPost({
    url: '/user/login',
    data,
  })
}

export function logout() {
  return httpPost({
    url: '/user/logout',
  })
}

export function modifyPassword(data: ResetFormState) {
  return httpPost({
    url: 'user/modify',
    data,
  })
}
/**
 * 调用使用第三方Token进行登录的接口（单点登录时使用）
 * @param data {Object} 发送参数
 * @return {Object} Promise对象
 */
export function loginWithToken(data) {
  return httpGet({
    url: '/user/login/token',
    data,
  })
}
