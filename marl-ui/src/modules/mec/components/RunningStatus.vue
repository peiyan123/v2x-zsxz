<template>
  <a-descriptions :column="1" :colon="false" :label-style="{ width: '200px' }">
    <template #title> <span class="mr-4">设备运行状态</span></template>
    <a-descriptions-item label="CPU占比">{{ Math.floor(mecInfo['cpu-usage']) }}%</a-descriptions-item>
    <a-descriptions-item label="GPU占比">{{ Math.floor(mecInfo['gpu-usage']) }}%</a-descriptions-item>
    <a-descriptions-item label="内存">
      <span class="mr-4">总计{{ mecInfo.memory.total }}G</span>
      <span class="mr-4">已使用{{ mecInfo.memory.used }}G</span>
      <span class="mr-4">空闲{{ mecInfo.memory.free }}G</span>
    </a-descriptions-item>
    <a-descriptions-item :label="index ? ' ' : '存储空间'" v-for="(item, index) in mecInfo.disks" :key="index">
      <div class="storage-wrap">
        <!--:title="index ? '外置存储' + index : '内置存储'" -->
        <Storage
          :title="`${item['fs-name']}(挂载：${item['dir']})`"
          :total="roundFloat(item.total)"
          :usage="roundFloat(item.used)"
        />
      </div>
    </a-descriptions-item>
    <!-- <a-descriptions-item>
      <template #label> </template>
      <div class="w-340px">
        <Storage title="SSD" :total="Number(mecInfo.driveInfo.totalGb)" :usage="Number(mecInfo.driveInfo.usedGb)" />
      </div>
    </a-descriptions-item> -->
  </a-descriptions>
  <a-descriptions :column="1" :colon="false" :label-style="{ width: '200px' }">
    <template #title> <span class="mr-4">应用运行状态</span></template>
  </a-descriptions>
  <a-table :dataSource="appList" :columns="tableColumn" :pagination="pagination" />
</template>
<script lang="ts" setup>
import { ref, reactive, onUnmounted, watch, onMounted, onDeactivated, onActivated } from 'vue'
// components
import Storage from './Storage.vue'
// types
import { MecRunningInfo, AppListItem } from '@/types/mec'
import { tableColumn } from './config'
import { PaginationType } from 'ant-design-vue/lib/transfer/interface'
// services
import * as mecApi from '@/services/api/mecApi'
// utils
import { handleDecimal } from '@/utils'
// hooks
import { useWebSocket } from '@vueuse/core'
import { WEBSOCKET_PORT } from '@/modules/road/config'

const props = defineProps({
  isShow: {
    type: Boolean,
    default: false,
  },
})
const pagination = ref<PaginationType>({
  pageSize: 5,
})
const socketResult = reactive({
  data: '',
  close: () => {},
})

const mecInfo = ref<MecRunningInfo>({
  'cpu-usage': 0,
  'gpu-usage': 0,
  memory: {
    total: 0,
    free: 0,
    used: 0,
  },
  memory_total: 0,
  memory_used: 0,
  memory_avail: 0,
  disks: [],
})
const appList = ref<AppListItem[]>([])
let intervalId = null

async function getMecInfo() {
  const { data } = await mecApi.getMecInfo()
  data.memory = data.memory || { total: 0, free: 0, used: 0 }
  data.memory.total = Math.round(data.memory.total * 100) / 100
  data.memory.used = Math.round(data.memory.used * 100) / 100
  data.memory.free = (data.memory.total * 100 - data.memory.used * 100) / 100
  mecInfo.value = data
}
function getMecInfoByInterval() {
  getMecInfo()
  clearMecInfoInterval()
  intervalId = setInterval(() => {
    getMecInfo()
  }, 15000)
}

function clearMecInfoInterval() {
  if (intervalId) {
    clearInterval(intervalId)
  }
}
async function getApplications() {
  const { data } = await mecApi.getApplications({ all: true })
  appList.value = data
}

function getAllData() {
  getMecInfoByInterval()
  getApplications()
}

// handleSocket()
// function handleSocket() {
//   // ws://192.168.87.40:8511/ws/1532260294489067521
//   const hostName = location.hostname
//   const { data, close } = useWebSocket(`ws://${hostName}:${WEBSOCKET_PORT}`, {
//     autoReconnect: {
//       retries: 3,
//       delay: 1000,
//       onFailed() {
//         alert('Failed to connect WebSocket after 3 retries')
//       },
//     },
//     onMessage: handleSocketMessage,
//   })
//   socketResult.data = data as any
//   socketResult.close = close
// }

// function handleSocketMessage(_: WebSocket, event: MessageEvent) {
//   const e = JSON.parse(event.data)
//   if (e['camera-id']) return
//   mecInfo.value = e.data
// }

function roundFloat(num) {
  const numTemp = typeof num !== 'number' ? 0 : num
  return Math.round(numTemp * 100) / 100
}
function byteToGB(num) {
  if (!num) return 0
  // return Math.round((num / 1024 / 1024 / 1024) * 10000) / 10000
  return Math.round(num / 1024 / 1024 / 1024)
}

onUnmounted(() => {
  socketResult.close()
  clearMecInfoInterval()
})
onMounted(() => {
  getAllData()
})
onActivated(() => {
  if (props.isShow) {
    getAllData()
  }
})
onDeactivated(() => {
  clearMecInfoInterval()
})
watch(
  () => props.isShow,
  (val) => {
    if (!val) {
      clearMecInfoInterval()
    } else {
      getAllData()
    }
  }
)
</script>
<style lang="less" scoped>
.storage-wrap {
  width: 840px;
}
</style>
