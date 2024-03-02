import { uploadFile, UploadFileParams } from '../httpServices'

/**
 * @description: 上传
 */
export const uploadApi = (params: UploadFileParams, onUploadProgress: (progressEvent: ProgressEvent) => void) => {
  return uploadFile<{ url: string }>(
    {
      url: '/upload',
      onUploadProgress,
    },
    params
  )
}

export const uploadCameraImageApi = (
  params: UploadFileParams,
  onUploadProgress: (progressEvent: ProgressEvent) => void,
  cameraId: string | number
) => {
  return uploadFile<{ url: string }>(
    {
      url: `/uploadCameraImage?cameraId=${cameraId}`,
      onUploadProgress,
    },
    params
  )
}

/**
 * @description: 上传证书
 */
export const uploadCert = (params: UploadFileParams, onUploadProgress: (progressEvent: ProgressEvent) => void) => {
  return uploadFile<{ url: string }>(
    {
      url: '/upload-cert',
      onUploadProgress,
    },
    params
  )
}
/**
 * 上传车标定的外参文件
 * @param params {Object} 上传参数
 * @param onUploadProgress {Function} 进度回调
 * @return {Object} Promise对象
 */
export const uploadExtrinsicBin = (
  params: UploadFileParams,
  onUploadProgress: (progressEvent: ProgressEvent) => void
) => {
  return uploadFile<{ url: string }>(
    {
      url: '/upload/camera/bin',
      onUploadProgress,
    },
    params
  )
}
