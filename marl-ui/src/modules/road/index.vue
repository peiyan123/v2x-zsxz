<template>
  <div class="h-full relative">
    <div class="flex items-center justify-between p-20px absolute top-0 left-0 bg-black bg-opacity-70 z-10 w-full">
      <div>
        <span class="mr-20px text-white">图片旋转:</span>
        <a-button type="primary" @click="handleLeft">逆时针旋转</a-button>
        <a-button type="primary" class="ml-20px" @click="handleRight">顺时针旋转</a-button>
        <span class="ml-20px mr-20px text-white">固定角度:</span>
        <a-input-number v-model:value="roateDeg" :max="360" :min="-360" @change="handleRoateChange"></a-input-number>
        <span class="ml-5px text-white">(deg)</span>
        <span class="mr-20px ml-20px text-white">图片缩放:</span>
        <a-button type="primary" @click="handleBig">放大</a-button>
        <a-button type="primary" @click="handleSmall" class="ml-20px">缩小</a-button>
        <span class="mr-20px ml-20px text-white">url:</span>
        <a-input v-model:value="urlPath" maxLength="100" class="url-input" allow-clear />
        <a-button type="primary" @click="handleReloadUrl" class="ml-10px">
          <template #icon> <reload-outlined /> </template
        ></a-button>
        <span class="ml-1 text-white object-property-wrap">
          <span>显示元素：</span>
          <a-checkbox v-model:checked="objectProperty.id">ID</a-checkbox>
          <a-checkbox v-model:checked="objectProperty.speed">速度</a-checkbox>
          <a-checkbox v-model:checked="objectProperty.plate">车牌</a-checkbox>
        </span>
      </div>
      <a-button type="primary" @click="handleBack">退出</a-button>
    </div>
    <div class="absolute right-0 bg-black bg-opacity-70 z-10 time-wrap">当前时间：{{ currentTime }}</div>
    <div style="border-radius: 5px" class="absolute right-1 bottom-5px bg-black bg-opacity-70 z-10 flex">
      <div class="flex flex-col items-center py-5px pl-10px">
        <span class="bus"></span>
        <span class="inline-block text-white">公交车</span>
      </div>
      <div class="flex items-center flex-col py-5px pl-10px">
        <span class="car"></span>
        <span class="inline-block text-white">轿车</span>
      </div>
      <div class="flex items-center flex-col py-5px pl-10px">
        <span class="truck"></span>
        <span class="inline-block text-white">卡车</span>
      </div>
      <div class="flex items-center flex-col py-5px pl-10px">
        <span class="motor"></span>
        <span class="inline-block text-white">摩托车</span>
      </div>
      <div class="flex items-center flex-col py-5px pl-10px">
        <span class="people"></span>
        <span class="inline-block text-white">人</span>
      </div>
      <div class="flex items-center flex-col py-5px pl-10px">
        <span class="small-truck"></span>
        <span class="inline-block text-white">小货车</span>
      </div>
      <div class="flex items-center flex-col py-5px px-10px">
        <span class="long-truck"></span>
        <span class="inline-block text-white">长卡车</span>
      </div>
      <div class="flex items-center flex-col py-5px px-10px">
        <span class="bike"></span>
        <span class="inline-block text-white">自行车</span>
      </div>
      <div class="flex items-center flex-col py-5px px-10px">
        <span class="trike"></span>
        <span class="inline-block text-white">三轮车</span>
      </div>
      <div class="flex items-center flex-col py-5px px-10px">
        <span class="ambulance"></span>
        <span class="inline-block text-white">救护车</span>
      </div>
      <div class="flex items-center flex-col py-5px px-10px">
        <span class="fire-truck"></span>
        <span class="inline-block text-white">消防车</span>
      </div>
      <div class="flex items-center flex-col py-5px px-10px">
        <span class="police-car"></span>
        <span class="inline-block text-white">警车</span>
      </div>
    </div>
    <div class="overflow-auto road-container content my-scroll">
      <div>
        <div class="img-content">
          <img ref="imgRef" :src="imageUrl" alt="" :style="{ transform: `rotate(${roateDeg}deg)` }" />
          <!-- <img ref="imgRef" :src="imageUrl2" alt="" /> -->
          <!-- <i class="car absolute" :style="testPos"></i> -->
          <template v-for="item in carData" :key="item[1].id">
            <i :class="iconMap[item[1].type]" class="absolute" :style="item[1].style"></i>
            <div class="id-wrap absolute" :style="item[1].style">
              <div v-show="objectProperty.id">{{ item[1].id }}</div>
              <div v-show="objectProperty.speed">{{ renderSpeed(item[1].speed) }}</div>
              <div v-show="objectProperty.plate" class="whitespace-nowrap">{{ item[1].plate }}</div>
            </div>
          </template>

          <div
            v-for="item in eventPointData"
            :key="item.id"
            :class="['absolute', 'event-point', item.type]"
            :style="item.style"
          ></div>
        </div>
      </div>
    </div>
    <div
      class="event-list-wrap absolute left-1 bottom-5px bg-white bg-opacity-70 z-10"
      :class="{ 'left-out-animation': hideEvent, 'left-in-animation': !hideEvent }"
    >
      <div class="title">事件信息：</div>
      <div class="event-list">
        <div v-for="(item, index) in eventNameData" :key="index">{{ item.name }}</div>
      </div>
      <div class="icon-wrap bg-white bg-opacity-70" @click="toggleEventInfo">
        <double-left-outlined v-show="!hideEvent" />
        <double-right-outlined v-show="hideEvent" />
      </div>
    </div>
    <div
      class="flow-info-wrap absolute right-1 bottom-5px bg-white bg-opacity-70 z-10"
      :class="{ 'right-out-animation': hideFlow, 'right-in-animation': !hideFlow }"
    >
      <div class="title">流量信息：</div>
      <div class="flow-info-tabs">
        <a-tabs v-model:activeKey="flowActiveKey">
          <a-tab-pane v-for="pane in flowPanes" :key="pane.key" :tab="pane.title">
            <a-table
              :dataSource="pane.dataSource"
              :columns="pane.columns"
              :customHeaderRow="customHeader"
              :pagination="{ pageSize: 50, hideOnSinglePage: true }"
              :scroll="{ x: 800, y: 500 }"
            >
              <template #headerCell="{ column }">
                <template v-if="column.key === 'name'">
                  <div class="diagonal-wrap">
                    <div>
                      <div class="text-right">车道</div>
                      <div class="text-left">属性</div>
                    </div>
                  </div>
                </template>
              </template>
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'name'">
                  <span>{{ renderFlowName(record) }}</span>
                </template>
              </template>
            </a-table>
          </a-tab-pane>
        </a-tabs>
      </div>
      <div class="icon-wrap bg-white bg-opacity-70" @click="toggleFlowInfo">
        <double-left-outlined v-show="hideFlow" />
        <double-right-outlined v-show="!hideFlow" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onUnmounted, reactive, unref, computed, watch } from 'vue'
import { ReloadOutlined, DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons-vue'
// service
import * as mecApi from '@/services/api/mecApi'
// hooks
import { useWebSocket } from '@vueuse/core'
import { useRouter } from 'vue-router'
// types
import { MecConfig } from '@/types/mec'
import { CarMapVal, cartDataItem } from './type'
// utils
import { directionIcon, calcMapRatio, showIcon, iconMap, calcDis, arcToDeg } from './utils'
import { cloneDeep } from 'lodash'
import { getBlobData, roundFloat } from '@/utils'
import { message } from 'ant-design-vue'
import { FLOW_PROPERTY_LIST, WEBSOCKET_PORT } from './config'
import axios from 'axios'
import moment from 'moment'

const router = useRouter()
const currentTime = ref('')
const imageUrl = ref('')
let aspectRatio = 1
const monitorRange = ref({ lat: 0.0011, long: 0.0011 })
const imgRef = ref<any>()
const socketResult = reactive({
  data: '',
  close: () => {},
})
const carData = ref<Map<any, CarMapVal>>(new Map())
const mapCenter = {
  longitude: 117.332662,
  latitude: 31.774998,
}
const mapLeftTop = {
  longitude: 117.332562,
  latitude: 31.774798,
}
let ratio = {
  wRatio: 1,
  hRatio: 1,
  imgCenter: { x: 0, y: 0 },
}
const imageContentWidth = ref<number>(1300)
const imageContentWidthComputed = computed(() => imageContentWidth.value + 'px')
watch(
  () => imageContentWidth.value,
  (newVal) => {
    console.log(newVal)
    ratio = calcMapRatio(mapCenter, newVal, newVal / aspectRatio, monitorRange.value)
  }
)
const roateDeg = ref<number>(0)
const eventNameData = ref([])
const eventPointData = ref([])
const urlPath = ref('')
// 是否隐藏事件信息弹框
const hideEvent = ref(false)
const hideFlow = ref(false)
const flowActiveKey = ref('0')
const flowPanes = ref<{ title: string; key: string; columns?: any[]; dataSource?: any[] }[]>([
  { title: '1路', key: '0', dataSource: [], columns: [] },
  { title: '2路', key: '1', dataSource: [], columns: [] },
  { title: '3路', key: '2', dataSource: [], columns: [] },
  { title: '4路', key: '3', dataSource: [], columns: [] },
])
const objectProperty = reactive({
  id: false,
  speed: false,
  plate: false,
})
const shakeOffset = 4
let intervalId = null
let currentUrlPath = ''
// 已重试的次数
let retryCount = 0
getMecConfig()
// showEventData([
//   {
//     type: 0,
//     spill: {
//       area: {
//         longitude: 117.332663,
//         latitude: 31.774994,
//         x: 1.1,
//         y: 2.2,
//         width: 3.3,
//         height: 4.4,
//       },
//       confidence: 1.5,
//     },
//   },
//   {
//     type: 1,
//     visiblity: {
//       value: 1.5,
//     },
//   },
//   {
//     type: 2,
//     retrograde: {
//       obj: {
//         objetct_type: 1,
//         object_id: 2,
//         longitude: 117.332662,
//         latitude: 31.774998,
//         proj_x: 3.3,
//         proj_y: 4.4,
//         world_x: 5.5,
//         world_y: 6.6,
//         move_direction: 7.7,
//         move_speed: 8.8,
//         length: 9.9,
//         width: 10.1,
//         height: 11.11,
//         lane_id: -1,
//         confidence: 12.12,
//         age: 13.13,
//         img_top: 14.14,
//         img_bottom: 15.15,
//         img_left: 16.16,
//         img_right: 17.17,
//         origin_obj_id: [
//           {
//             device_type: 0,
//             object_id: 0,
//           },
//           {
//             device_type: 0,
//             object_id: 2,
//           },
//         ],
//       },
//     },
//   },
//   {
//     type: 3,
//     turnlane: {
//       pre_lane_id: 1,
//       cur_lane_id: 1,
//       obj: {
//         objetct_type: 1,
//         object_id: 2,
//         longitude: 117.332642,
//         latitude: 31.775998,
//         proj_x: 3.3,
//         proj_y: 4.4,
//         world_x: 5.5,
//         world_y: 6.6,
//         wgs_move_direction: 7.7,
//         move_speed: 8.8,
//         length: 9.9,
//         width: 10.1,
//         height: 11.11,
//         lane_id: -1,
//         confidence: 12.12,
//         age: 13.13,
//         img_top: 14.14,
//         img_bottom: 15.15,
//         img_left: 16.16,
//         img_right: 17.17,
//         origin_obj_id: [
//           {
//             device_type: 0,
//             object_id: 0,
//           },
//           {
//             device_type: 0,
//             object_id: 2,
//           },
//         ],
//       },
//     },
//   },
// ])
async function getMecConfig() {
  let roadConfigData = null
  try {
    // 获取全息路口的中心点坐标和范围值
    const tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
    const result = await mecApi.getRoadConfig(tab)
    roadConfigData = result.data
  } catch (e) {
    console.log(e)
  }
  // 获取全息路口的背景图片
  const { data: pictureData } = await getBlobData('/mec/road/picture')
  imageUrl.value = window.URL.createObjectURL(pictureData)
  // const { data: roadConfigData } = await mecApi.getRoadConfig()
  // const result = await mecApi.getMecConfig()
  // const data: MecConfig = result.data
  // 获取图片中心点的经纬度
  mapCenter.longitude = Number(roadConfigData.center_longitude_)
  mapCenter.latitude = Number(roadConfigData.center_latitude_)
  // mapLeftTop.longitude = mapCenter.longitude - monitorRange
  // mapLeftTop.latitude = mapCenter.latitude - monitorRange
  // mapLeftTop.longitude = 104.08843
  // mapLeftTop.latitude = 30.509855
  //TODO delete
  // ratio = calcMapRatio(mapCenter, imgRef)

  // imageUrl.value = data.imageUrl
  const imageHelp = new Image()
  imageHelp.src = imageUrl.value
  imageHelp.onload = () => {
    // 计算图片实际宽高的一半
    const halfImgWidth = imageHelp.width / 2
    const halfImgHeight = imageHelp.height / 2
    // 计算图片一半宽高所对应的经纬度范围
    monitorRange.value = {
      lat: halfImgHeight / roadConfigData.res_u_,
      long: halfImgWidth / roadConfigData.res_v_,
    }
    // 计算图片左上角点的经纬度
    mapLeftTop.longitude = mapCenter.longitude - monitorRange.value.long
    mapLeftTop.latitude = mapCenter.latitude - monitorRange.value.lat
    aspectRatio = imgRef.value.offsetWidth / imgRef.value.offsetHeight

    ratio = calcMapRatio(mapCenter, unref(imageContentWidth), imageContentWidth.value / aspectRatio, monitorRange.value)
  }
}

// handleSocket()
function handleSocket() {
  // ws://192.168.87.40:8511/ws/1532260294489067521
  // ws://10.4.213.241:9002
  // 10.4.15.223
  // 10.4.6.69
  const hostName = location.hostname
  const { data, close, status } = useWebSocket(`ws://${hostName}:${WEBSOCKET_PORT}`, {
    autoReconnect: {
      retries: 3,
      delay: 1000,
      onFailed() {
        message.error('Failed to connect WebSocket after 3 retries')
      },
    },
    onMessage: handleSocketMessage,
    onError: (ws, event) => {
      console.log('socket error', ws, event)
    },
  })
  socketResult.data = data as any
  socketResult.close = close
}
getInfoInterval()
/**
 * 调用接口获取数据
 * @returns Promise对象
 */
function getRoadInfo(url) {
  const getAxios = axios.create({
    baseURL: '',
    timeout: 5000,
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
 * 定时获取路口数据
 */
async function getInfoInterval() {
  // 设置定时器，定时调用接口去取数据
  // intervalId = setInterval(async () => {
  try {
    const tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
    const url = !currentUrlPath || /^\//.test(currentUrlPath) ? `/road${tab}${currentUrlPath}` : `/road${tab}/${currentUrlPath}`
    const { data: roadInfo } = await getRoadInfo(url)
    handleSocketMessage(null, roadInfo as any)
    // 已请求到数据，如果没有退出页面，则开始下一次请求
    if (retryCount >= 0) {
      getInfoInterval()
    }
  } catch (e) {
    // 如果出错，则清除定时器
    // if (intervalId) {
    //   clearInterval(intervalId)
    //   intervalId = null
    //   message.error('请求出错')
    // }
    // 如果retryCount不为负数，则重试3次
    if (retryCount >= 0) {
      if (retryCount < 3) {
        retryCount++
        getInfoInterval()
      } else {
        message.error('请求出错')
      }
    }
  }

  // }, 50)
}
/**
 * 设置显示的“当前时间”字符串
 * @param timeStamp {Number} 当前时间戳
 */
function setCurrentTime(timeStamp) {
  if (timeStamp) {
    currentTime.value = moment(timeStamp).format('YYYY-MM-DD HH:mm:ss')
  }
}
function handleSocketMessage(_: WebSocket, event: MessageEvent) {
  // 每个图标的宽高一半，目前是固定宽高
  const offsetX = 30 / 2
  const offsetY = 30 / 2
  // 如果是websocket数据，则需打开下面注释，注释再下一行代码
  // const allData = JSON.parse(event.data)
  const allData = event
  setCurrentTime(allData.time_stamp)
  // if (!allData['camera-id']) return
  const [objectData, eventDataArr, statisticDataMap] = flatSocketData(allData)
  showEventData(eventDataArr)
  showFlowInfo(statisticDataMap)
  // 清除缓存车辆
  unref(carData).forEach((_, key) => {
    const isExsit = objectData.some((a) => key == a.objectId)
    if (!isExsit) unref(carData).delete(key)
  })
  // const result: Array<cartDataItem> = data
  objectData.map((item) => {
    // 过滤掉部分不展示的数据
    if (!showIcon.includes(item.objectType)) return
    const x1 = (item.latitude - mapLeftTop.latitude) * ratio.wRatio
    const y1 = (item.longitude - mapLeftTop.longitude) * ratio.hRatio
    const x = roatePointerX(x1 + offsetX, y1 + offsetY, Math.PI / (180 / roateDeg.value)) - offsetX
    const y = roatePointerY(x1 + offsetX, y1 + offsetY, Math.PI / (180 / roateDeg.value)) - offsetY
    const shortData = cloneDeep(unref(carData).get(item.objectId))
    const direction = arcToDeg(item.direction, iconMap[item.objectType], item.objectId)
    if (shortData) {
      // if (calcDis(shortData.curx, shortData.cury, x, y) < shakeOffset) return
      let transform = directionIcon.includes(item.objectType) ? `rotate(${direction + roateDeg.value}deg)` : 'none'
      unref(carData).set(item.objectId, {
        id: item.objectId,
        type: item.objectType,
        speed: item.speed,
        plate: item.plate,
        curx: x,
        cury: y,
        style: {
          left: x + 'px',
          top: y + 'px',
          transform: transform,
        },
      })
    } else {
      let transform = directionIcon.includes(item.objectType) ? `rotate(${direction + roateDeg.value}deg)` : 'none'
      unref(carData).set(item.objectId, {
        id: item.objectId,
        type: item.objectType,
        speed: item.speed,
        plate: item.plate,
        curx: x,
        cury: y,
        style: {
          left: x + 'px',
          top: y + 'px',
          transform: transform,
        },
      })
      // console.log('####', carData.value)
    }
  })
}

// 处理socket数据
function flatSocketData(data): [any[], any[], Record<string, any>] {
  const objectDataArr = []
  const statisticDataMap = {}
  const eventDataArr = []
  data.data_list?.forEach((item) => {
    // type为0时，代表“目标检测数据”
    if (item.type === 0) {
      item.object_data_list.forEach((objectItem) => {
        const obj: any = {}
        obj.objectId = objectItem.ObjectData.object_id
        obj.objectType = objectItem.ObjectData.object_type
        obj.longitude = objectItem.ObjectData.longitude
        obj.latitude = objectItem.ObjectData.latitude
        obj.direction = objectItem.ObjectData.wgs_move_direction
        obj.speed = objectItem.ObjectData.move_speed
        obj.plate = objectItem.ObjectData.plate
        obj.width = objectItem.ObjectData.width
        obj.height = objectItem.ObjectData.height
        objectDataArr.push(obj)
      })
    } else if (item.type === 2) {
      // type为2时，代表“统计数据”
      statisticDataMap[item.group_id] = item.statistic_data
    } else if (item.type === 3) {
      // type为3时，代表“事件数据”
      eventDataArr.push(...item.event_data_list)
    }
  })
  return [objectDataArr, eventDataArr, statisticDataMap]
}

function showEventData(data) {
  // const eventNameArr = []
  const offsetX = 10
  const offsetY = 10
  eventNameData.value = []
  eventPointData.value = []
  data.map((item, index) => {
    Object.keys(item).forEach((key) => {
      if (key !== 'type') {
        eventNameData.value.push({ name: key, value: item[key] })
        let pointItem: any = null
        if (key === 'spill') {
          pointItem = { ...item[key].area }
        } else if (key === 'road_construction') {
          pointItem = { ...item[key] }
        } else if (item[key].obj) {
          pointItem = { ...item[key].obj.ObjectData }
        }
        if (pointItem) {
          const x1 = (pointItem.latitude - mapLeftTop.latitude) * ratio.wRatio
          const y1 = (pointItem.longitude - mapLeftTop.longitude) * ratio.hRatio
          const x = roatePointerX(x1 + offsetX, y1 + offsetY, Math.PI / (180 / roateDeg.value)) - offsetX
          const y = roatePointerY(x1 + offsetX, y1 + offsetY, Math.PI / (180 / roateDeg.value)) - offsetY
          pointItem.style = {
            left: `${x}px`,
            top: `${y}px`,
          }
          pointItem.type = key
          pointItem.id = `${key}_${index}`
          eventPointData.value.push(pointItem)
        }
      }
    })
  })
}
/**
 * 解析流量数据，并设置给列表以显示
 * @param flowDataMap 流量信息数据，形式如：{groupId: {...flowData}}
 */
function showFlowInfo(flowDataMap) {
  // 如果数据为空，则返回，不执行后面处理
  if (!flowDataMap || Object.keys(flowDataMap).length <= 0) {
    return
  }
  flowPanes.value.forEach((pane, index) => {
    const flowData = flowDataMap[index]
    if (!flowData) {
      return
    }
    const laneSet = new Set()
    const propertyMap = {}
    Object.keys(flowData).forEach((key) => {
      const item = flowData[key]
      if (Array.isArray(item)) {
        const typeKey = key.replace(/^lane_/, '')
        item.forEach((laneData) => {
          laneSet.add(laneData.lane_id)
          let showData = laneData[typeKey]
          // 如果是数组，则转换为字符串以显示
          if (Array.isArray(showData)) {
            showData = showData.map((item) => roundFloat(item, 5))
            showData =
              showData.length === 4
                ? `[[${showData[0]},${showData[1]}],[${showData[2]},${showData[3]}]]`
                : `[showData.join(',')]`
          } else if (key === 'lane_desaturation') {
            showData = roundFloat(showData, 4)
          } else if (key === 'lane_avg_cross_line_cost_time' || key === 'lane_avg_delay_time') {
            // 毫秒换算为秒
            showData = showData / 1000
          } else {
            showData = roundFloat(showData, 3)
          }
          // 将处理后的数据保存到结果对象中
          if (!propertyMap[key]) {
            propertyMap[key] = { [laneData.lane_id]: showData }
          } else {
            propertyMap[key][laneData.lane_id] = showData
          }
        })
      }
    })
    // 对车道id进行升序排序
    const laneIdArr = [...laneSet].sort((a, b) => +a - +b)
    // 设置表格的列
    pane.columns = ['name', ...laneIdArr].map((item) => ({
      title: item === 'name' ? '' : item,
      width: item === 'name' ? 120 : '',
      dataIndex: item,
      key: item,
    }))
    // 设置表格的展示数据
    const dataSource = []
    FLOW_PROPERTY_LIST.forEach((item) => {
      if (propertyMap[item.key]) {
        dataSource.push({
          name: item.text,
          unit: item.unit,
          ...propertyMap[item.key],
        })
      }
    })
    // Object.keys(propertyMap).forEach((property) => {
    //   dataSource.push({
    //     name: property,
    //     ...propertyMap[property],
    //   })
    // })
    pane.dataSource = dataSource
  })
}
/**
 * 小车速度显示渲染方法
 * @param speed {number} 速度值
 */
function renderSpeed(speed) {
  return roundFloat(speed)
}
/**
 * 设置流量信息列表头部行属性
 * @param column {object} 列对象
 */
function customHeader(column) {
  column[0].className = 'title-name-wrap'
}
/**
 * 渲染流量列表name列
 * @param {string} record 行数据
 * @return {string} 显示字符串
 */
function renderFlowName(record) {
  let result = `${record.name}`
  if (record.unit) {
    result += `(${record.unit})`
  }
  return result
}
function roatePointerX(x, y, deg) {
  return (x - ratio.imgCenter.x) * Math.cos(deg) - (y - ratio.imgCenter.y) * Math.sin(deg) + ratio.imgCenter.x
}

function roatePointerY(x, y, deg) {
  return (x - ratio.imgCenter.x) * Math.sin(deg) + (y - ratio.imgCenter.y) * Math.cos(deg) + ratio.imgCenter.y
}

function handleLeft() {
  if (roateDeg.value < -360) return
  roateDeg.value = roateDeg.value - 5
  if (roateDeg.value < -360) roateDeg.value = -360
}

function handleRight() {
  if (roateDeg.value > 360) return
  roateDeg.value = roateDeg.value + 5
  if (roateDeg.value > 360) roateDeg.value = 360
}

function handleRoateChange(val: number) {
  if (Number.isNaN(Number(val))) return
  console.log(val)
  if (val > 360) {
    roateDeg.value = 360
  }
  if (val < -360) {
    roateDeg.value = -360
  }
  console.log(roateDeg.value)
}

function handleBig() {
  if (imageContentWidth.value >= 2600) return
  imageContentWidth.value = imageContentWidth.value + 100
}

function handleSmall() {
  if (imageContentWidth.value <= 500) return
  imageContentWidth.value = imageContentWidth.value - 100
}

function handleBack() {
  router.go(-1)
}
/**
 * 重新加载Url
 */
function handleReloadUrl() {
  // 获取最新的url path
  currentUrlPath = urlPath.value
  // 如果已经重试了3次，则再次发起请求
  if (retryCount >= 3) {
    getInfoInterval()
  }
  retryCount = 0
}
onUnmounted(() => {
  socketResult.close()
  unref(carData).clear()
  // // 清除定时器
  // if (intervalId) {
  //   clearInterval(intervalId)
  //   intervalId = null
  // }
  // 离开页面后，不重试
  retryCount = -1
})

// 测试用代码
const testPos = ref()
function setTestPos() {
  setTimeout(() => {
    const current = {
      x: 104.0861165412,
      y: 30.5116480252,
    }
    const current2 = {
      x: (current.x - mapLeftTop.longitude) * ratio.wRatio,
      y: (current.y - mapLeftTop.latitude) * ratio.hRatio,
    }
    let transform = `rotate(${145 + roateDeg.value}deg)`
    testPos.value = {
      left: roatePointerX(current2.x + 15, current2.y + 15, 0) - 15 + 'px',
      top: roatePointerY(current2.x + 15, current2.y + 15, 0) - 15 + 'px',
      transform: transform,
    }
  }, 1000)
}
/**
 * 切换事件信息弹框显示或隐藏的方法
 */
function toggleEventInfo() {
  hideEvent.value = !hideEvent.value
}
/**
 * 切换流量信息弹框显示或隐藏的方法
 */
function toggleFlowInfo() {
  hideFlow.value = !hideFlow.value
}
</script>
<style lang="less" scoped>
.road-container {
  background: #383838;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  .img-content {
    position: relative;
    transition: all 0.5s;
    width: v-bind(imageContentWidthComputed);
    // margin-left: 50%;
    // transform: translateX(-50%);
    img {
      width: 100%;
    }
  }
}
.bus {
  // position: absolute;
  display: inline-block;
  width: 30px;
  height: 30px;
  background: url('~@/assets/image/bus.png') no-repeat;
  background-size: 100% 100%;
  z-index: 10;
  transition: top 0.5s, left 0.5s;
}
.car {
  // position: absolute;
  display: inline-block;
  width: 30px;
  height: 30px;
  background: url('~@/assets/image/car.png') no-repeat;
  background-size: 100% 100%;
  z-index: 10;
  transition: top 0.5s, left 0.5s;
}
.trike {
  // position: absolute;
  display: inline-block;
  width: 30px;
  height: 30px;
  background: url('~@/assets/image/trike.png') no-repeat;
  background-size: 100% 100%;
  z-index: 10;
  transition: top 0.5s, left 0.5s;
}
.bike {
  // position: absolute;
  display: inline-block;
  width: 30px;
  height: 30px;
  background: url('~@/assets/image/bike.png') no-repeat;
  background-size: 100% 100%;
  z-index: 10;
  transition: top 0.5s, left 0.5s;
}
.motor {
  // position: absolute;
  display: inline-block;
  width: 30px;
  height: 30px;
  background: url('~@/assets/image/motor.png') no-repeat;
  background-size: 100% 100%;
  z-index: 10;
  transition: top 0.5s, left 0.5s;
}
.people {
  // position: absolute;
  display: inline-block;
  width: 30px;
  height: 30px;
  background: url('~@/assets/image/people.png') no-repeat;
  background-size: 100% 100%;
  z-index: 10;
  transition: top 0.5s, left 0.5s;
}
.truck {
  // position: absolute;
  display: inline-block;
  width: 30px;
  height: 30px;
  background: url('~@/assets/image/truck.png') no-repeat;
  background-size: 100% 100%;
  z-index: 10;
  transition: top 0.5s, left 0.5s;
}
.small-truck {
  // position: absolute;
  display: inline-block;
  width: 30px;
  height: 30px;
  background: url('~@/assets/image/small-truck.png') no-repeat;
  background-size: 100% 100%;
  z-index: 10;
  transition: top 0.5s, left 0.5s;
}
.long-truck {
  // position: absolute;
  display: inline-block;
  width: 30px;
  height: 30px;
  background: url('~@/assets/image/long-truck.png') no-repeat;
  background-size: 100% 100%;
  z-index: 10;
  transition: top 0.5s, left 0.5s;
}

.ambulance {
  // position: absolute;
  display: inline-block;
  width: 30px;
  height: 30px;
  background: url('~@/assets/image/ambulance.png') no-repeat;
  background-size: 100% 100%;
  z-index: 10;
  transition: top 0.5s, left 0.5s;
}
.police-car {
  // position: absolute;
  display: inline-block;
  width: 30px;
  height: 30px;
  background: url('~@/assets/image/police-car.png') no-repeat;
  background-size: 100% 100%;
  z-index: 10;
  transition: top 0.5s, left 0.5s;
}
.fire-truck {
  // position: absolute;
  display: inline-block;
  width: 30px;
  height: 30px;
  background: url('~@/assets/image/fire-truck.png') no-repeat;
  background-size: 100% 100%;
  z-index: 10;
  transition: top 0.5s, left 0.5s;
}
.marker {
  // position: absolute;
  display: inline-block;
  width: 12px;
  height: 17px;
  background: url('~@/assets/image/marker.png') no-repeat;
  background-size: 100% 100%;
  z-index: 10;
  transition: top 0.5s, left 0.5s;
}

.operate {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
// 隐藏滚动条
.hide-bar {
  &::-webkit-scrollbar {
    width: 0 !important;
  }
}
.event-point {
  width: 20px;
  height: 20px;
  border: 1px solid red;
  border-radius: 50%;
}
.event-list-wrap {
  width: 400px;
  padding: 0 0 10px 0;
  margin: 0 0 20px 0;
  font-size: 20px;
  transition: all 0.5s ease-in;
  .title {
    padding: 5px 10px;
    border-bottom: 1px solid #aaa;
  }
  .event-list {
    height: 500px;
    padding: 0 10px;
    overflow: auto;
  }
  /* 滚动条整体 */
  .event-list::-webkit-scrollbar {
    height: 20px;
    width: 2px;
  }
  /* 两个滚动条交接处 -- x轴和y轴 */
  .event-list::-webkit-scrollbar-corner {
    background-color: transparent;
  }

  /* 滚动条滑块 */
  .event-list::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    background: #535353;
  }

  /* 滚动条轨道 */
  .event-list::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background: #ededed;
  }
  .icon-wrap {
    position: absolute;
    display: flex;
    top: 0;
    right: -40px;
    width: 40px;
    height: 40px;
    text-align: center;
    border-radius: 50%;
    justify-content: center;
    align-items: center;
    color: #1890ff;
  }
}
.flow-info-wrap {
  width: 1000px;
  padding: 0 0 10px 0;
  margin: 0 0 20px 0;
  font-size: 20px;
  transition: all 0.5s ease-in;
  .title {
    padding: 5px 10px;
    border-bottom: 1px solid #aaa;
  }
  .icon-wrap {
    position: absolute;
    display: flex;
    top: 0;
    left: -40px;
    width: 40px;
    height: 40px;
    text-align: center;
    border-radius: 50%;
    justify-content: center;
    align-items: center;
    color: #1890ff;
  }
}
.url-input {
  width: 150px;
}
.left-in-animation {
  left: 10px;
}
.left-out-animation {
  left: -400px;
}
.right-in-animation {
  right: 10px;
}
.right-out-animation {
  right: -1000px;
}
.id-wrap {
  width: 30px;
  height: 30px;
  padding-left: 25px;
  z-index: 10;
  color: red;
  font-size: 20px;
  transition: top 0.5s, left 0.5s;
  & > * {
    left: 25px;
    height: 18px;
    line-height: 18px;
  }
}
.object-property-wrap {
  :deep(.ant-checkbox-wrapper) {
    color: #fff;
  }
}
.flow-info-tabs {
  padding: 0 15px;
  background: #fff;
}
.diagonal-wrap {
  position: relative;
  & > * {
    padding: 10px;
  }
}
.diagonal-wrap::before {
  position: absolute;
  content: ' ';
  height: 100%;
  width: 100%;
  background: linear-gradient(to top right, transparent, transparent 49%, #f0f0f0, transparent 51%, transparent);
  left: 0;
  top: 0;
}
:deep(.title-name-wrap) {
  padding: 0;
}
.time-wrap {
  top: 80px;
  padding: 5px 10px;
  color: #fff;
}
</style>
