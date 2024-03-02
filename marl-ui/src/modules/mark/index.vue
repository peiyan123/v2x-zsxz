<template>
  <div style="height: 100%">
    <a-breadcrumb class="bread-crumb" separator="">
      <a-breadcrumb-item>当前位置</a-breadcrumb-item>
      <a-breadcrumb-separator>:</a-breadcrumb-separator>
      <a-breadcrumb-item>标定</a-breadcrumb-item>
      <a-breadcrumb-separator>/</a-breadcrumb-separator>
      <a-breadcrumb-item>{{ groupName }}</a-breadcrumb-item>
    </a-breadcrumb>
    <a-tabs v-model:activeKey="currentOperation" class="tab-container" type="editable-card" @edit="onEdit">
      <!-- <a-tab-pane tab="检测区域" key="area">
        <AreaMark @openHelp="openModal" :currentPanel="currentOperation" ref="areaRef" />
      </a-tab-pane>
      <a-tab-pane tab="外参标定" key="camera"
        ><CameraMark @openHelp="openModal" :currentPanel="currentOperation" ref="cameraRef" />
      </a-tab-pane>
      <a-tab-pane tab="车道标定" key="lane">
        <LaneMark @openHelp="openModal" :currentPanel="currentOperation" ref="laneRef" />
      </a-tab-pane> -->
      <a-tab-pane v-for="pane in panes" :key="pane.key" :tab="pane.title" :closable="pane.closable">
        <component
          :is="pane.component"
          @openHelp="openModal"
          :currentPanel="currentOperation"
          :currentCameraId="currentCameraId"
          :finishGetData="finishGetData"
          :isOpen="currentOperation === pane.key"
          :treeData="pane.treeData"
          :ref="(el) => setComponentRef(el, pane.key)"
        ></component>
      </a-tab-pane>
      <!-- <a-tab-pane tab="抛洒物区域标定" key="spilled">
      <SpilledMark @openHelp="openModal" ref="spilledRef" />
    </a-tab-pane> -->
      <!-- <a-tab-pane tab="能见度标定" key="visible"> -->
      <!-- <VisibleMark ref="visibleRef" /> -->
      <!-- </a-tab-pane> -->
      <template #rightExtra>
        <a-button @click="handleUpload" :disabled="!markStore.cameraId">上传</a-button>
        <!--<a-button class="ml-10px" @click="handleDownload" :disabled="!markStore.cameraId">下载</a-button> -->
        <a-button class="ml-10px" @click="handleSubmit">保存数据</a-button>
        <a-button class="ml-10px" @click="goCamera" type="primary">退出标定</a-button>
      </template>
    </a-tabs>
    <HelpModal @register="register" />
    <TabNameModal @register="registerForTabName" @addTabName="onAddTabName" />
    <input type="file" ref="inputRef" class="file" @change="onFileChange" />
  </div>
</template>
<script lang="ts" setup>
import { useRouter, useRoute } from 'vue-router'
// components
import AreaMark from './components/AreaMark.vue'
import CameraMark from './components/CameraMark.vue'
import LaneMark from './components/LaneMark.vue'
import FuseMark from './components/FuseMark.vue'
import SpilledMark from './components/SpilledMark.vue'
import VisibleMark from './components/VisibleMark.vue'
import EventMark from './components/EventMark.vue'
import { markRaw, onMounted, provide, ref, toRaw } from 'vue'
import { Modal, message } from 'ant-design-vue'
import HelpModal from './components/HelpModal.vue'
import TabNameModal from './components/TabNameModal.vue'
import { useModal } from '@/components/Modal'
// types
import { OperationTitle } from './type'
import { SubmitMarkData } from '@/types/mark'
// store
import { useMarkStore } from '@/store/modules/mark'
import { uploadCameraImageApi } from '@/services/api/uploadApi'
import { submitReportData } from '@/services/api/cameraApi'

import { cloneDeep } from 'lodash'
import { DEFAULT_EVENTS, EVENT_PREFIX, EVENT_TYPE } from './config'
import { useAppStore } from '@/store/modules/app'

const markStore = useMarkStore()
const appStore = useAppStore()
const router = useRouter()
const route = useRoute()
// const routeName = route.params.name
const groupName = route.query.group
const currentCameraId = ref<any>('')
const currentOperation = ref<string>('area')
const finishGetData = ref<boolean>(false)
// const areaRef = ref()
// const cameraRef = ref()
const inputRef = ref(null)
// const laneRef = ref()
// const spilledRef = ref()
// const visibleRef = ref()
const originalEvent = ref(new Set())
const removeEventData = ref([])
const [register, { openModal }] = useModal()
const [registerForTabName, { openModal: openTabNameModal, closeModal }] = useModal()
// 传递方法到孙子组件中
provide('openHelp', openModal)
let isSave = false // 标识是否点击过保存
// let areaSaveData, cameraSaveData, laneSaveData
const saveData: Record<string, any> = {}

onMounted(async () => {
  currentCameraId.value = markStore.cameraId
  if (!markStore.getCameraId) {
    const { id: cameraId, name: cameraName, rtsp } = route.query
    if (cameraId) {
      currentCameraId.value = cameraId as string
      markStore.setCameraId(currentCameraId.value)
      markStore.setCameraName(cameraName as string)
      markStore.setRtsp(rtsp as string)
    } else {
      Modal.warning({
        title: '提示',
        content: '当前没检测到相机Id，请前往相机页先配置相机信息',
        okText: '确认',
        onOk() {
          router.push({ path: '/group' })
        },
      })
    }
  }
  if (currentCameraId.value) {
    await markStore.getAllData(currentCameraId.value)
    // 设置完成初始数据获取的变量为true
    finishGetData.value = true
    const eventData = toRaw(markStore.eventData)
    Object.keys(eventData).forEach((key) => {
      addEventTab(key)
      originalEvent.value.add(key)
    })
  }
})

const panes = ref<{ title: string; component: any; key: string; closable?: boolean; treeData?: any[] }[]>([
  { title: '检测区域', component: markRaw(AreaMark), key: 'area', closable: false },
  { title: '外参标定', component: markRaw(CameraMark), key: 'camera', closable: false },
  { title: '车道标定', component: markRaw(LaneMark), key: 'lane', closable: false },
  { title: '入场配置', component: markRaw(FuseMark), key: 'fuse', closable: false },
])
// const activeKey = ref(panes.value[0].key)
const newTabIndex = ref(0)

const itemRefs: Record<string, any> = {}
function setComponentRef(el, key) {
  if (el) {
    itemRefs[key] = el
  }
}
/**
 * 点击添加tab标签页按钮触发方法
 */
function addTab() {
  openTabNameModal()
  // currentOperation.value = `newTab${++newTabIndex.value}`
  // panes.value.push({ title: 'New Tab', component: VisibleMark, key: currentOperation.value })
}
/**
 * 设置新添加tab标签页名字
 * @param tabKey 新标签页的key
 * @param resetFields 设置标签页名字弹框表单的resetFields方法
 */
function onAddTabName(tabKey, resetFields) {
  const showName = DEFAULT_EVENTS[tabKey] ? DEFAULT_EVENTS[tabKey].label : tabKey
  if (panes.value?.find((item) => item.title === showName)) {
    message.error('Tab名字不能重复，请重新输入')
  } else {
    resetFields()
    closeModal()
    addEventTab(tabKey, true)
  }
}
/**
 * 添加tab标签页
 * @param tabKey 标签页的key
 * @param open 是否打开新标签页
 */
function addEventTab(tabKey, open?: boolean) {
  const key = `${EVENT_PREFIX}${tabKey}`
  if (open) {
    currentOperation.value = key
  }
  const title = DEFAULT_EVENTS[tabKey] ? DEFAULT_EVENTS[tabKey].label : tabKey
  let treeData = []
  if (open && DEFAULT_EVENTS[tabKey]) {
    treeData = DEFAULT_EVENTS[tabKey].property
  }
  panes.value.push({ title, component: EventMark, key, treeData })
}
/**
 * 删除tabs的某个标签页
 * @param targetKey 删除tab标签页的key
 */
function removeTab(targetKey: string) {
  let lastIndex = 0
  panes.value.forEach((pane, i) => {
    if (pane.key === targetKey) {
      lastIndex = i - 1
    }
  })
  panes.value = panes.value.filter((pane) => pane.key !== targetKey)
  if (panes.value.length && currentOperation.value === targetKey) {
    if (lastIndex >= 0) {
      currentOperation.value = panes.value[lastIndex].key
    } else {
      currentOperation.value = panes.value[0].key
    }
  }
  // 删除标签页的ref对象值
  delete itemRefs[targetKey]
  // 将标签页相关值加入待删除数组
  const eventName = targetKey.replace(new RegExp(`^${EVENT_PREFIX}`), '')
  if (originalEvent.value.has(eventName)) {
    removeEventData.value.push({ type: EVENT_TYPE, name: eventName, delete: true })
    // 删除module中存储的该事件配置数据
    markStore.removeEventData(eventName)
  }
}

function onEdit(targetKey: string | MouseEvent, action: string) {
  if (action === 'add') {
    addTab()
  } else {
    removeTab(targetKey as string)
  }
}

async function handleDownload() {
  if (markStore.cameraId) {
    const a = document.createElement('a')
    a.href = `/api/mark-download?cameraId=${markStore.cameraId}`
    a.download = ''
    a.click()
  }
}

function handleUpload() {
  inputRef.value.click()
}

async function onFileChange(e) {
  const file = e.target.files[0] as File
  const result = await uploadCameraImageApi(
    {
      file: file,
    },
    function onUploadProgress(progressEvent: ProgressEvent) {
      const complete = ((progressEvent.loaded / progressEvent.total) * 100) | 0
    },
    markStore.cameraId
  )
  const { width, height } = await new Promise((resolve) => {
    const img = new Image()
    img.onload = function () {
      resolve({
        width: img.width,
        height: img.height,
      })
    }
    img.src = result.data.url
  })
  markStore.setImageInfo({
    width,
    height,
    url: result.data.url,
  })
  itemRefs.area.reloadImg(result.data.url)
  message.success('成功')
}

async function handleSubmit() {
  const submitData: SubmitMarkData[] = []
  isSave = true
  // if (cameraRef.value) {
  const newEventData = markStore.getEventData
  const originalEventTemp = cloneDeep(originalEvent.value)
  const eventReg = new RegExp(`^${EVENT_PREFIX}`)
  const keys = Object.keys(itemRefs)
  // 异步方法await item.handleValidate()不能放在forEach()的方法中，否则不能变成同步操作，导致submitData数据不正确(bug 3792:【标定】外参标定无法保存)
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index]
    const item = itemRefs[keys[index]]
    if (item) {
      if (key === 'camera') {
        // 校验经纬度标定数据格式
        const cameraResult = await item.handleValidate()
        // console.log(cameraResult)
        if (!cameraResult) {
          // message.error('请检查经纬度标定的数据格式')
          return false
        }
        // submitData.push({
        //   type: 'camera',
        //   data: item.handleGetData(),
        // })
        // const cameraData = JSON.parse(getTabData(submitData, item, 'camera'))
        const data = item.handleGetData()
        // 如果是车标定，则判断是否需要上传文件，如果需要则上传
        if (data.version && data.file) {
          const file = data.file
          delete data.file
          // 如果是File对象，则表示需要调用接口上传该文件，否则表示是已经上传过的文件，则不调用接口
          if (file instanceof File) {
            await markStore.uploadExtrinsicBin({ file, data: { group: groupName } })
          }
        }
        submitData.push({
          type: 'camera',
          data,
        })
        saveData.camera = JSON.stringify(data)
        // } else if (key === 'area') {
        //   // submitData.push({
        //   //   type: 'area',
        //   //   data: item.handleGetData(),
        //   // })
        //   areaSaveData = getTabData(submitData, item, 'area')
        // } else if (key === 'lane') {
        //   // submitData.push({
        //   //   type: 'lane',
        //   //   data: item.handleGetData(),
        //   // })
        //   laneSaveData = getTabData(submitData, item, 'lane')
      } else if (eventReg.test(key)) {
        const eventName = key.replace(eventReg, '')
        const dataTemp = {
          type: EVENT_TYPE,
          name: eventName,
          data: item.handleGetData(),
        }
        submitData.push(dataTemp)
        originalEventTemp.add(eventName)
        // 更新对应事件区域配置文件数据
        newEventData[eventName] = dataTemp
      } else {
        saveData[key] = getTabData(submitData, item, key)
      }
    }
  }
  const submitDataNew = submitData.concat(removeEventData.value)
  // if (spilledRef.value) {
  //   submitData.push({
  //     type: 'spilled',
  //     data: spilledRef.value.handleGetData(),
  //   })
  // }
  await markStore.addAllData(submitDataNew)
  // 保存新的事件区域配置数据
  markStore.setEventData(newEventData)
  message.success('保存数据成功')
  appStore.setReboot(true)
  // // 向标定按钮所在的窗口（即打开当前窗口的窗口）发送消息，通知窗口设置对应数据为true
  // window.opener.postMessage(JSON.stringify({ name: 'setReboot', value: true }), window.location.origin)
  // 清空已删除的数据
  removeEventData.value = []
  originalEvent.value = originalEventTemp
  return true
}

function getTabData(submitData, tabRef, type) {
  const data = tabRef.handleGetData()
  submitData.push({
    type,
    data,
  })
  return JSON.stringify(data)
}
function goCamera() {
  // 检测有数据变更才提示
  // const cameraInitData =
  //   '{"inData":"","sceneData":[],"center":{"longitude":0,"latitude":0},"mode":"LL","startPointId":"","endPointId":"","isdistort":"distort"}'
  // 默认是选中车标定方式，因此初始数据带version字段
  const cameraInitData = '{"version":"2.0"}'
  const oldAreaData = isSave && saveData.area ? saveData.area : JSON.stringify(markStore.getAreaData)
  const oldCameraData = isSave && saveData.camera ? saveData.camera : JSON.stringify(markStore.getCameraData)
  const oldLaneData = isSave && saveData.lane ? saveData.lane : JSON.stringify(markStore.getLaneData)
  const oldFuseData = isSave && saveData.fuse ? saveData.fuse : JSON.stringify(markStore.getFuseData)
  const newAreaData = itemRefs.area && JSON.stringify(itemRefs.area.handleGetData())
  const newCameraData = itemRefs.camera && JSON.stringify(itemRefs.camera.handleGetData())
  const newLaneData = itemRefs.lane && JSON.stringify(itemRefs.lane.handleGetData())
  const newFuseData = itemRefs.fuse && JSON.stringify(itemRefs.fuse.handleGetData())
  const isAreaChange = oldAreaData && newAreaData && oldAreaData !== newAreaData
  // const isCameraChange = newCameraData && oldCameraData && oldCameraData !== newCameraData
  const isLaneChange = newLaneData && oldLaneData && newLaneData !== oldLaneData
  const isFuseChange = newFuseData && oldFuseData && newFuseData !== oldFuseData
  let isCameraChange
  if (oldCameraData === 'null') {
    console.log(newCameraData)
    isCameraChange = newCameraData && newCameraData !== cameraInitData
  } else if (oldCameraData === cameraInitData) {
    // 如果是车标定方式，则比较前后数据中是file对象中的name字段，如果name字段没有了，则表示发生改变了
    let dataObj = {} as any
    let hasName = true
    if (newCameraData) {
      dataObj = JSON.parse(newCameraData)
      hasName = !!dataObj.file?.name
    }
    isCameraChange = !hasName
  } else {
    // 是手工标定方式，则直接比较前后数据是否一致，不一致则发生了改变
    isCameraChange = newCameraData && newCameraData !== oldCameraData
  }
  // console.log(isAreaChange, isCameraChange, isLaneChange, isFuseChange)
  let isEventChange = false
  // 如果有删除的事件区域配置，则事件区域配置数据发生了变化
  if (removeEventData.value.length > 0) {
    isEventChange = true
  } else {
    // 判断事件区域配置标注数据是否有变化
    const eventReg = new RegExp(`^${EVENT_PREFIX}`)
    const keys = Object.keys(itemRefs)
    const oldEventData = markStore.getEventData
    // 遍历所有事件区域配置tab标签页
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index]
      if (eventReg.test(key)) {
        const eventName = key.replace(eventReg, '')
        const newData = JSON.stringify(itemRefs[key].handleGetData())
        // 如果其中有个数据发生变化，则退出循环，标识
        if (newData && newData !== JSON.stringify(oldEventData[eventName]?.data)) {
          isEventChange = true
          break
        }
      }
    }
  }
  if (isAreaChange || isCameraChange || isLaneChange || isFuseChange || isEventChange) {
    Modal.confirm({
      title: '提示',
      content: '有数据未保存，是否确认退出而不保存？',
      // content: '退出前请保存数据',
      okText: '确认',
      onOk: async () => {
        // // 保存数据
        // const result = await handleSubmit()
        // if (result) {
        // 上报数据
        // submitData()
        router.push({ path: '/group' })
        // }
      },
    })
  } else {
    // 上报数据
    // submitData()
    router.push({ path: '/group' })
  }
}
function exitMarkWithoutSave() {
  router.push({ path: '/group' })
}
// /**
//  * 上报数据
//  */
// async function submitData() {
//   await submitReportData()
//   message.success('上报数据成功')
//   appStore.setReboot(true)
// }
</script>
<style lang="less" scoped>
.tab-container {
  height: 100%;
  :deep(.ant-tabs-content) {
    height: 100%;
  }
}
.file {
  display: none;
}
</style>
