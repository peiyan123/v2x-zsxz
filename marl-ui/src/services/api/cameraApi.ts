import { CameraListItem } from './../../types/camera.d'
import { httpGet, httpPost, requestConfig, httpDelete, uploadFile } from '../httpServices'
import { EditCamera, AddCamera } from '@/types/camera'
import { reponseParams } from '../interceptors'
// 实例
// interface loginRequest {
//   language: string
//   password: string
//   userName: string
// }

// export function login(data: loginRequest) {
//   return httpPost({
//     url: '/user/login',
//     data,
//   })
// }
let tab = ''
export function getCameraList(data?) {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpGet<reponseParams<any>>({
    url: `/camera${tab}`,
    data,
  })
}

export function addCamera(data: AddCamera) {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpPost({
    url: `/camera${tab}`,
    data,
    config: {
      // 设置超时时间为30秒（默认是20秒），避免检测rtsp地址有效性出现20秒超时的情况
      timeout: 1000 * 60 * 3,
    },
  })
}

export function updateCamera(data: EditCamera) {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpPost({
    url: `/camera${tab}/update`,
    data,
    config: {
      // 设置超时时间为30秒（默认是20秒），避免检测rtsp地址有效性出现20秒超时的情况
      timeout: 1000 * 60 * 3,
    },
  })
}

export function deleteCamera(id: string, dir: string) {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpDelete({
    url: `/camera${tab}`,
    data: {
      id,
      dir,
    },
  })
}

export function closeRtsp() {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpPost({
    url: `/rtsp${tab}/close`,
  })
}

export function startRtsp() {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpPost({
    url: `/rtsp${tab}/open`,
  })
}

// 上报数据至算法侧
export function submitReportData() {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpPost({
    url: `/report${tab}`,
    config: {
      timeout: 1000 * 60 * 5,
    },
  })
}

export function rebootDevice() {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpPost({
    url: `/reboot${tab}`,
    config: {
      timeout: 1000 * 60,
    },
  })
}
/**
 * 上传视频文件
 * @param params 上传参数
 * @returns Promise对象
 */
export function uploadVideo(params, handleProgress?) {
  return uploadFile(
    {
      url: '/upload/chunk/upload',
      onUploadProgress: handleProgress,
    },
    params,
    { cancelResponseCatch: true }
  )
}
/**
 * 合并分块文件
 * @param data 发送参数
 * @returns Promise对象
 */
export function mergeFile(data: any) {
  return httpPost({
    url: '/upload/chunk/merge',
    data,
  })
}
/**
 * 检查待上传文件的状态
 * @param data 发送参数
 * @returns Promise对象
 */
export function checkFile(data: any) {
  return httpPost({
    url: '/upload/chunk/check',
    data,
  })
}

// export function getCameraVideo(data?) {
//   return httpGet<reponseParams<any>>({
//     url: `/camera/video/${data.name}`,
//     data: { hash: data.hash },
//   })
// }
