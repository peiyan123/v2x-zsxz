import { defineStore } from 'pinia'
import { store } from '@/store'
import { SubmitMarkData } from '@/types/mark'
import * as markApi from '@/services/api/markApi'
import { uploadExtrinsicBin } from '@/services/api/uploadApi'
import { EVENT_TYPE } from '@/modules/mark/config'

export type ImageInfo = {
  url: string
  width: number
  height: number
}
interface MarkState {
  cameraName: string
  cameraId: string | number
  rtsp: string
  areaData: Array<any>
  cameraData: any
  laneData: Array<any>
  eventData: Record<string, any>
  spilledData: Array<any>
  vivisbleData: Array<any>
  imageInfo: ImageInfo
  fuseData: Array<any>
}
// 车道操作 name = 方向 | 车道区域 | 流量统计线
export const useMarkStore = defineStore({
  id: 'Mark',
  state: (): MarkState => ({
    imageInfo: {
      url: '',
      width: 1920,
      height: 1080,
    },
    cameraName: '',
    cameraId: '',
    rtsp: '',
    spilledData: [],
    vivisbleData: [],
    areaData: [
      // {
      //   pointSource: [
      //     { x: 510, y: 460 },
      //     { x: 330, y: 440 },
      //     { x: 330, y: 330 },
      //   ],
      //   color: 'rgb(35, 98, 29)',
      //   shapeId: 'shapPoint:4546465465',
      //   type: '',
      //   label: '',
      // },
    ],
    cameraData: null,
    // {
    //   pointSource: [{ x: 510, y: 460, label: '点1', shapeId: 'shapMark:4546465465' }],
    // },
    laneData: [
      // {
      //   pointSource: [
      //     { x: 510, y: 460 },
      //     { x: 330, y: 440 },
      //     { x: 330, y: 330 },
      //   ],
      //   color: 'rgb(35, 98, 29)',
      //   type: 'lane1',
      //   name: '车道区域',
      // },
      // {
      //   pointSource: [
      //     { x: 410, y: 460 },
      //     { x: 300, y: 340 },
      //   ],
      //   color: 'rgb(35, 98, 29)',
      //   type: 'lane1',
      //   name: '方向',
      // },
      // {
      //   pointSource: [
      //     { x: 520, y: 470 },
      //     { x: 340, y: 450 },
      //     { x: 340, y: 340 },
      //   ],
      //   color: 'rgb(35, 50, 29)',
      //   type: 'lane2',
      //   name: '车道区域',
      // },
    ],
    fuseData: [],
    // 事件区域配置标注数据(key是数据文件名字，value是标注数据)
    eventData: {},
  }),
  getters: {
    getCameraName() {
      return this.cameraName
    },
    getRtsp() {
      return this.rtsp
    },
    getCameraId() {
      return this.cameraId
    },
    getAreaData() {
      return this.areaData
    },
    getCameraData() {
      return this.cameraData
    },
    getLaneData() {
      return this.laneData
    },
    getSpilledData() {
      return this.spilledData
    },
    getVisibleData() {
      return this.getVisibleData
    },
    getEventData() {
      return this.eventData
    },
    getImageInfo(): ImageInfo {
      return this.imageInfo
    },
    getFuseData() {
      return this.fuseData
    },
  },
  actions: {
    setImageInfo(parmas: ImageInfo) {
      this.imageInfo = parmas
    },
    setRtsp(str: string) {
      this.rtsp = str
    },
    setCameraName(name: string) {
      this.cameraName = name
    },
    setCameraId(id: number | string) {
      this.cameraId = id
    },
    setAreaData(data: Array<any>): void {
      this.areaData = data
    },
    setCameraData(data: any): void {
      this.cameraData = data
    },
    setLaneData(data: Array<any>): void {
      this.laneData = data
    },
    setSpilledData(data: Array<any>): void {
      this.spilledData = data
    },
    setFuseData(data: Array<any>): void {
      this.fuseData = data
    },
    setVisibleData(data: Array<any>): void {
      this.visibleData = data
    },
    setEventData(data: any): void {
      this.eventData[data.name] = data
    },
    removeEventData(name: string): void {
      // 移除某个事件数据
      delete this.eventData[name]
    },
    async getAllData(cameraId?) {
      this.clearAllData()
      const result: any = await markApi.getMarkData(this.cameraId || cameraId)
      result.data.forEach((item) => {
        if (item.type === 'area') {
          this.setAreaData(JSON.parse(item.value))
        } else if (item.type === 'camera') {
          this.setCameraData(JSON.parse(item.value))
        } else if (item.type === 'lane') {
          this.setLaneData(JSON.parse(item.value))
        } else if (item.type === 'spilled') {
          this.setSpilledData(JSON.parse(item.value))
        } else if (item.type === 'fuse') {
          this.setFuseData(JSON.parse(item.value))
        } else if (item.type === EVENT_TYPE) {
          this.setEventData({ data: JSON.parse(item.value), name: item.file_name })
        }
      })
      console.log(result.data[0]?.image_info)
      if (result.data[0]) {
        this.imageInfo = JSON.parse(result.data[0]?.image_info)
      }
    },
    async addAllData(data: Array<SubmitMarkData>) {
      const result = await markApi.addMark({ cameraId: this.cameraId, data, imageInfo: this.imageInfo })
      return result
    },
    /**
     * 调用接口上传车标的外参文件
     * @param parmas {Object} 上传参数
     * @return {Object} Promise对象
     */
    async uploadExtrinsicBin(parmas) {
      const result = await uploadExtrinsicBin(parmas, function onUploadProgress(progressEvent: ProgressEvent) {
        const complete = ((progressEvent.loaded / progressEvent.total) * 100) | 0
      })
      return result
    },
    clearAllData() {
      this.setAreaData([])
      this.setCameraData(null)
      this.setLaneData([])
      this.setSpilledData([])
      this.setVisibleData([])
      this.setFuseData([])
      this.eventData = []
    },
  },
})

// Need to be used outside the setup
export function useMarkStoreWithOut() {
  return useMarkStore(store)
}
