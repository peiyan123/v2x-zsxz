import { ComponentType } from '@/components/Form/types'
import { App, unref } from 'vue'
import { isNumber, isObject } from './is'
import moment from 'moment'
import axios from 'axios'
import { message } from 'ant-design-vue'
import sparkMD5 from 'spark-md5'
const DATE_TYPE = ['DatePicker', 'MonthPicker', 'WeekPicker', 'TimePicker']

function genType() {
  return [...DATE_TYPE, 'RangePicker']
}

export function randomColor() {
  return (
    'rgb(' +
    parseInt(Math.random() * 1000 + '') / 4 +
    ',' +
    parseInt(Math.random() * 1000 + '') / 4 +
    ',' +
    parseInt(Math.random() * 1000 + '') / 4 +
    ')'
  )
}

export function getDynamicProps<T, U>(props: T): Partial<U> {
  const ret: Recordable = {}

  Object.keys(props).map((key) => {
    ret[key] = unref((props as Recordable)[key])
  })

  return ret as Partial<U>
}

export function error(message: string) {
  throw new Error(`[ error]:${message}`)
}

export function deepMerge<T = any>(src: any = {}, target: any = {}): T {
  let key: string
  for (key in target) {
    src[key] = isObject(src[key]) ? deepMerge(src[key], target[key]) : (src[key] = target[key])
  }
  return src
}

export function handleInputNumberValue(component?: ComponentType, val?: any) {
  if (!component) return val
  if (['Input', 'InputPassword', 'InputSearch', 'InputTextArea'].includes(component)) {
    return val && isNumber(val) ? `${val}` : val
  }
  return val
}

export const dateItemType = genType()

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
const DATE_FORMAT = 'YYYY-MM-DD '

export function formatToDateTime(date: moment.MomentInput = undefined, format = DATE_TIME_FORMAT): string {
  return moment(date).format(format)
}

export function formatToDate(date: moment.MomentInput = undefined, format = DATE_FORMAT): string {
  return moment(date).format(format)
}

export const dateUtil = moment

export function handleDecimal(num, a: number) {
  if (!num) return 0
  return Math.round(num * a) / a
}

export const withInstall = <T>(component: T, alias?: string) => {
  const comp = component as any
  comp.install = (app: App) => {
    app.component(comp.name || comp.displayName, component)
    if (alias) {
      app.config.globalProperties[alias] = component
    }
  }
  return component as T & Plugin
}

/**
 * @description:  Set ui mount node
 */
export function getPopupContainer(node?: HTMLElement): HTMLElement {
  return (node?.parentNode as HTMLElement) ?? document.body
}

/**
 * 保存接口返回的文件流数据到本地指定文件中
 * @param res 接口返回数据
 * @param filename 保存文件名
 */
export const downloadFile = (res: any, filename?: string) => {
  // 获取下载后文件名
  if (!filename) {
    let contentDisposition = res.headers['content-disposition'] //从response的headers中获取filename, 后端response.setHeader("Content-disposition", "attachment; filename=xxxx.docx") 设置的文件名;
    let patt = new RegExp('filename="?([^;]+\\.[^\\.";]+);*')
    let result = patt.exec(contentDisposition)
    filename = 'file.zip'
    if (result) {
      // 支持中文文件名显示
      filename = decodeURIComponent(result[1])
    }
  }
  // 获取文件数据，并点击下载
  const blob = new Blob([res.data], { type: res.blobType || 'multipart/form-data;charset=utf-8' })
  const downloadElement = document.createElement('a')
  const href = window.URL.createObjectURL(blob)
  downloadElement.style.display = 'none'
  downloadElement.href = href
  downloadElement.download = filename
  document.body.appendChild(downloadElement)
  downloadElement.click()
  // 下载完成移除元素
  document.body.removeChild(downloadElement)
  // 释放掉blob对象
  window.URL.revokeObjectURL(href)
}

/**
 * 发起下载数据请求的通用方法
 * @param url 请求接口地址
 * @param params 请求参数
 * @returns Promise对象
 */
export function downloadData(url, params) {
  const downloadAxios = axios.create({
    baseURL: process.env.NODE_ENV === 'production' ? '/api' : '/api',
    responseType: 'blob',
    headers: {
      Authorization: localStorage.getItem('token'),
    },
  })
  downloadAxios.interceptors.response.use(async (response) => {
    const { status, data, headers } = response
    if (status === 200) {
      // 如果返回的数据类型为json格式，则读取内容以判断状态是否失败
      if (data.type.indexOf('json') >= 0) {
        // 将blob格式数据转为json格式
        const dataJson: any = await new Promise(function (resolve) {
          // 创建一个FileReader实例
          const reader = new FileReader()
          // 读取文件，结果用字符串形式表示
          reader.readAsText(data, 'utf-8')
          reader.onload = function () {
            // 读取完成后，获取reader.result
            resolve(JSON.parse(reader.result as string))
          }
        })
        // 如果返回的状态为失败，则提示错误信息，并调用reject()
        if (dataJson.returnStatus === 'FAILED') {
          message.error(dataJson.errorMessage)
          return Promise.reject('download failed')
        }
        // 其他情况判断为有效
        return Promise.resolve({ data, headers })
      } else {
        // 如果返回的数据类型不为json格式，则说明返回了待下载文件的流数据，因此resolve()相关数据
        return Promise.resolve({ data, headers })
      }
    } else {
      // 接口状态不为200，则表示请求失败
      return Promise.reject(response)
    }
  }, undefined)
  return downloadAxios.get(url, {
    params,
  })
}
/**
 * 获取流数据
 * @param url 接口地址
 * @returns Promise对象
 */
export function getBlobData(url) {
  const getAxios = axios.create({
    baseURL: process.env.NODE_ENV === 'production' ? '/api' : '/api',
    responseType: 'blob',
    headers: {
      Authorization: localStorage.getItem('token'),
    },
  })
  getAxios.interceptors.response.use(async (response) => {
    const { status, data, headers } = response
    if (status === 200) {
      return Promise.resolve({ data, headers })
    } else {
      // 接口状态不为200，则表示请求失败
      return Promise.reject(response)
    }
  })
  return getAxios.get(url)
}

/**
 * 判断文件类型是否合法
 * @param fileType 文件类型
 * @returns 是否合法的boolean值
 */
export function checkFileType(fileType: string, acceptType: string) {
  const fileTypeTemp = fileType.toLocaleLowerCase()
  const types = acceptType
    .toLocaleLowerCase()
    .split(',')
    .map((item) => item.replace(/^\./, ''))
  const typeRes = types.filter((item) => fileTypeTemp.indexOf(item) >= 0)
  if (typeRes.length <= 0) {
    return false
  }
  return true
}
/**
 * 判断文件是否超过最大值
 * @param fileSize 文件实际大小
 * @returns 是否超过的boolean值
 */
export function checkFileSize(fileSize: number, maxSize: string) {
  const matchRes = maxSize.match(/^(\d+)([a-zA-Z]+)$/)
  if (matchRes && matchRes.length >= 2) {
    const sizeNum = +matchRes[1]
    const sizeUnit = matchRes[2].toLowerCase()
    // 换算时需要除以的倍数
    let unitVal = 1
    switch (sizeUnit) {
      case 'kb':
        unitVal = 1024
        break
      case 'm':
        unitVal = 1024 * 1024
        break
      case 'g':
        unitVal = 1024 * 1024 * 1024
        break
    }
    if (fileSize / unitVal > sizeNum) {
      return false
    }
  }
  return true
}
/**
 * 计算文件的md5
 * @param file 文件名字
 * @returns 文件的md5
 */
export async function calculateHashSample(file) {
  return new Promise((resolve) => {
    const spark = new sparkMD5.ArrayBuffer()
    const reader = new FileReader()
    const size = file.size
    const offset = 2 * 1024 * 1024
    //第一个2M，最后一个区数据块全要
    const chunks = [file.slice(0, offset)]
    let cur = offset
    while (cur < size) {
      if (cur + offset >= size) {
        //最后一个区块
        chunks.push(file.slice(cur, cur + offset))
      } else {
        //中间区块,取前中后各2个字节
        const mid = cur + offset / 2
        const end = cur + offset
        chunks.push(file.slice(cur, cur + 2))
        chunks.push(file.slice(mid, mid + 2))
        chunks.push(file.slice(end - 2, end))
      }
      cur += offset
    }
    reader.readAsArrayBuffer(new Blob(chunks))
    reader.onload = (e) => {
      spark.append(e.target.result)
      // this.hashProgress = 100
      resolve(spark.end())
    }
  })
}

/**
 * webWorker计算文件的hash
 * @param chunks 文件所有的分块
 * @returns Promise对象
 */
export async function calculateHashWorker(chunks) {
  return new Promise((resolve) => {
    const worker = new Worker('/js/hash.js')
    worker.postMessage({ chunks: chunks })
    worker.onmessage = (e) => {
      const { progress: _progress, hash } = e.data
      // const hashProgress = Number(progress.toFixed(2))
      if (hash) {
        resolve(hash)
      }
    }
  })
}
/**
 * 对值进行四舍五入处理
 * @param data 待处理数据
 * @param decimalPlaces 四舍五入后小数位数
 * @returns 四舍五入后的值
 */
export function roundFloat(data, decimalPlaces = 2) {
  const times = Math.pow(10, decimalPlaces)
  return Math.round(data * times) / times
}
