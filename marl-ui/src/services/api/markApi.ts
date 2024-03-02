import { ImageInfo } from './../../store/modules/mark'
import { SubmitMarkData } from '@/types/mark'
import { httpGet, httpPost, requestConfig } from '../httpServices'
import { CheckData, CheckDataRes } from '@/types/mec'
import { reponseParams } from '../interceptors'
import { unref } from 'vue'
import { useRouter } from 'vue-router';


export function addMark(data: { cameraId: string; data: SubmitMarkData[]; imageInfo: ImageInfo }) {
  const type = location.href.split('type=')[1];
  return httpPost({
    url: `/mark${type}`,
    data,
  })
}

export function getMarkData(cameraId: number) {
  const type = location.href.split('type=')[1];
  return httpGet({
    url: `/mark${type}`,
    data: {
      id: cameraId,
    },
  })
}

export function getImage(cameraId: number, cameraName: string, rtsp: string) {
  const type = location.href.split('type=')[1];
  return httpGet({
    url: `/image${type}`,
    data: {
      id: cameraId,
      name: cameraName,
      rtsp,
    },
  })
}

export function getImageFirst(cameraId: number, cameraName: string, rtsp: string) {
  const type = location.href.split('type=')[1];
  return httpGet({
    url: `/imageFirst${type}`,
    data: {
      id: cameraId,
      name: cameraName,
      rtsp,
    },
  })
}

// 检查camera的数据
export function checkCameraData(data: CheckData) {
  const type = location.href.split('type=')[1];
  return httpPost<reponseParams<CheckDataRes>>({
    url: `/check${type}`,
    data,
  })
}

// 检查camera的数据 返回图片
export function checkCameraDataImg(data: { cameraData: CheckData; cameraId: any }) {
  const type = location.href.split('type=')[1];
  return httpPost<reponseParams<any>>({
    url: `/checkImg${type}`,
    data,
  })
}
