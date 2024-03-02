import type { AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios'

import axios from 'axios'
import {
  requestInterceptors,
  requestInterceptorsCatch,
  responseInterceptors,
  responseInterceptorsCatch,
} from './interceptors'

axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? '/api' : '/api'

axios.defaults.timeout = 1000 * 20

axios.interceptors.request.use(requestInterceptors, undefined)

axios.interceptors.request.use(undefined, requestInterceptorsCatch)

axios.interceptors.response.use(responseInterceptors, undefined)

const responseReject = axios.interceptors.response.use(undefined, responseInterceptorsCatch)

export { axios, responseReject }
