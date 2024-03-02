import { useLoading } from '@/core/hooks/useLoading'
import type { AxiosRequestConfig, AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { message } from 'ant-design-vue'
import { router } from '../router'
const { open, close } = useLoading()
export interface reponseParams<T = any> {
  data?: T
  requestId: string
  returnStatus: 'SUCCEED' | 'FAILED'
  serverTime: string
  errorCode?: string
  errorMessage?: string
}

interface AxiosRequestConfigNew extends AxiosRequestConfig {
  hideLoading?: boolean
}

interface AxiosResponseNew extends AxiosResponse<reponseParams> {
  config: AxiosRequestConfigNew
}

interface AxiosErrorNew extends AxiosError {
  config: AxiosRequestConfigNew
}

/**
 * @description 请求拦截
 */
const requestInterceptors = (request: AxiosRequestConfigNew) => {
  // 如果不隐藏loading，则显示
  if (!request.hideLoading) {
    open()
  }
  const token = localStorage.getItem('token')
  if (token) request.headers.Authorization = token
  return request
}

/**
 * @description 请求拦截报错
 */
const requestInterceptorsCatch = (error: Error) => {
  return error
}

/**
 * @description 响应拦截
 */
const responseInterceptors = (response: AxiosResponseNew) => {
  const { status, data, config } = response
  // 如果不隐藏loading，则需关闭loading
  if (!config.hideLoading) {
    close()
  }
  if (status === 200 && data.returnStatus === 'SUCCEED') {
    return Promise.resolve(data)
  } else if (status === 200 && data.returnStatus === 'FAILED') {
    message.error(data.errorMessage)
    return Promise.reject()
  }
  return Promise.reject(response)
}

/**
 * @description 响应拦截报错
 */
const responseInterceptorsCatch = (error: AxiosErrorNew) => {
  const { response, config } = error
  // 如果不隐藏loading，则需关闭loading
  if (!config.hideLoading) {
    close()
  }
  const { push } = router
  if (response) {
    let errorMessage = response?.data?.message || response?.statusText || 'unknown error'
    if (response.status === 401) {
      localStorage.setItem('token', '')
      push('/login')
      errorMessage = '请重新登录'
    }
    message.error(errorMessage)
  } else {
    if (String(error).includes('timeout')) {
      message.error('请求超时')
    }
    if (String(error).includes('Network Error')) {
      message.error('服务异常，请联系管理员')
    }
  }
  return Promise.reject(error)
}

export { requestInterceptors, requestInterceptorsCatch, responseInterceptors, responseInterceptorsCatch }
