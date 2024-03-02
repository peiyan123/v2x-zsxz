import { axios, responseReject } from './http'
import type { AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios'

export interface requestConfig<T = any> {
  url: string
  data?: T
  fixUrl?: { [key: string]: any }
  config?: AxiosRequestConfig
  // 是否隐藏全局的loading
  hideLoading?: boolean
}

export interface UploadFileParams {
  // Other parameters
  data?: Recordable
  // File parameter interface field name
  name?: string
  // file name
  file: File | Blob
  // file name
  filename?: string
  [key: string]: any
}

const httpPost = <T = any>(requestParams: requestConfig): Promise<T> => {
  if (requestParams.fixUrl) {
    Object.keys(requestParams.fixUrl).map((key) => {
      requestParams.url = requestParams.url.replace(`{${key}}`, requestParams.fixUrl?.[key])
    })
  }
  const config = { hideLoading: requestParams.hideLoading, ...requestParams.config }
  return axios.post(requestParams.url, requestParams.data, config)
}

const httpGet = <T = any>(requestParams: requestConfig): Promise<T> => {
  if (requestParams.fixUrl) {
    Object.keys(requestParams.fixUrl).map((key) => {
      requestParams.url = requestParams.url.replace(`{${key}}`, requestParams.fixUrl?.[key])
    })
  }
  const config = { hideLoading: requestParams.hideLoading, params: requestParams.data, ...requestParams.config }
  return axios.get(requestParams.url, config)
}

const httpDelete = <T = any>(requestParams: requestConfig): Promise<T> => {
  if (requestParams.fixUrl) {
    Object.keys(requestParams.fixUrl).map((key) => {
      requestParams.url = requestParams.url.replace(`{${key}}`, requestParams.fixUrl?.[key])
    })
  }
  const config = { hideLoading: requestParams.hideLoading, params: requestParams.data, ...requestParams.config }
  return axios.delete(requestParams.url, config)
}

const uploadFile = <T = any>(
  config: AxiosRequestConfig,
  params: UploadFileParams,
  otherConfig?: Record<string, any>
) => {
  const formData = new window.FormData()
  const customFilename = params.name || 'file'

  if (params.filename) {
    formData.append(customFilename, params.file, params.filename)
  } else {
    formData.append(customFilename, params.file)
  }
  if (params.data) {
    Object.keys(params.data).forEach((key) => {
      const value = params.data[key]
      if (Array.isArray(value)) {
        value.forEach((item) => {
          formData.append(`${key}[]`, item)
        })
        return
      }

      formData.append(key, params.data[key])
    })
  }
  // 是否取消响应的catch拦截器
  if (otherConfig?.cancelResponseCatch) {
    axios.interceptors.response.eject(responseReject)
  }
  return axios.request<T>({
    ...config,
    method: 'POST',
    data: formData,
    headers: {
      'Content-type': ' multipart/form-data;charset=UTF-8',
    },
  })
}

const uploadFiles = <T = any>(
  config: AxiosRequestConfig,
  params: UploadFileParams,
  otherConfig?: Record<string, any>
) => {
  const formData = new window.FormData()
  // const customFilename = params.name || 'file'
  if (params.files) {
    params.files.forEach((file) => {
      formData.append(file.webkitRelativePath || file.name || 'files', file)
    })
  }
  if (params.data) {
    Object.keys(params.data).forEach((key) => {
      const value = params.data[key]
      if (Array.isArray(value)) {
        value.forEach((item) => {
          formData.append(`${key}[]`, item)
        })
        return
      }

      formData.append(key, params.data[key])
    })
  }
  // 是否取消响应的catch拦截器
  if (otherConfig?.cancelResponseCatch) {
    axios.interceptors.response.eject(responseReject)
  }
  return axios.request<T>({
    ...config,
    method: 'POST',
    data: formData,
    headers: {
      'Content-type': ' multipart/form-data;charset=UTF-8',
    },
  })
}

export { httpPost, httpGet, httpDelete, uploadFile, uploadFiles }
