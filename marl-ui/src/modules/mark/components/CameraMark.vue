<template>
  <div class="mark-container">
    <a-row type="flex" class="row-container">
      <a-col :span="6" class="left">
        <OperationPanel
          @checkData="handleCheckDataImg"
          @changeMarkType="changeMarkMode"
          :crossList="crossList"
          type="camera"
          ref="operationPanelRef"
        />
      </a-col>
      <a-col :span="18" class="right">
        <!-- <div class="operation">
          <a-button type="primary" class="mb-10px">
            <template #icon>
              <RedoOutlined @click="changeImage" />
            </template>
          </a-button>
          <a-button type="primary">
            <template #icon>
              <QuestionCircleOutlined @click="handleHelp" />
            </template>
          </a-button>
        </div> -->
        <CommonOperations @changeImage="changeImage" @resetCanvas="resetCanvas" />
        <div class="canvasContainer" ref="handleRef"></div>
      </a-col>
    </a-row>
    <CheckImgModal @register="registerModal" />
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted, onUnmounted, unref, toRaw, defineExpose, watch, defineProps, defineEmits } from 'vue'
// components
import { CameraScene, MarkCrossScene } from '@/thundersoft/ai-mark'
import OperationPanel from './OperationPanel.vue'
import CommonOperations from './CommonOperations.vue'
import OperationButton from './OperationButton.vue'
import { RedoOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'
import CheckImgModal from './CheckImgModal.vue'
// datas
import { images } from './access-image'
// hooks
import { useMarkStore } from '@/store/modules/mark'
import { useMark } from '../hooks/useMark'
import { useModal } from '@/components/Modal'
// utils
import { Subscription } from 'rxjs'
import { CheckData } from '@/types/mec'
import { cloneDeep } from 'lodash'
// services
import * as markApi from '@/services/api/markApi'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  currentPanel: { type: String, default: 'area' },
})

const [registerModal, { openModal }] = useModal()
const emits = defineEmits(['openHelp'])
const markStore = useMarkStore()
const { scene, handleRef, changeImage, showImageUrl, initImage, resetCanvas } = useMark()

const crossList = ref([])
const destroyEvent: (Subscription | undefined)[] = []
const operationPanelRef = ref()

onMounted(() => {
  scene.value = new MarkCrossScene(handleRef.value, showImageUrl.value)
  unref(scene).toggleShowAndHide(props.isOpen)
  setData()
  // 根据外参标定的标定方式开启或取消标注模式
  changeMarkMode(operationPanelRef.value.cameraInfo.markType)
  // unref(scene).openMarkMode({
  //   color: 'rgb(255, 0, 0)',
  //   label: '点',
  //   lon: '',
  //   lat: '',
  //   worldX: '',
  //   worldY: '',
  // })
  // unref(scene).markCanvas.shapeSelectedAfterEvent?.subscribe((shape) => {
  //   selectedShape.value = shape.point.map((point) => point.source)
  // })
  crossList.value = scene.value.markCanvas.shapeCross
  destroyEvent.push(
    unref(scene).addShapeSuccessEvent.subscribe((shapeCross) => {
      crossList.value = [...shapeCross]
    })
  )
  destroyEvent.push(
    unref(scene).deleteShapeEvent.subscribe((shapeCross) => {
      crossList.value = [...shapeCross]
      // 检查是否需要修改起止点
      operationPanelRef.value.changeStartAndEnd(shapeCross)
    })
  )
})

onUnmounted(() => {
  destroyEvent.forEach((d) => d?.unsubscribe())
})

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      setTimeout(() => {
        unref(scene).changeImage(showImageUrl.value)
      }, 200)
    }
    unref(scene).toggleShowAndHide(val)
  }
)
/**
 * 根据标定类型改变canvas的标注模式
 * @param type {String} 标定类型
 */
function changeMarkMode(type) {
  // 如果是车标定，则关闭标注模式，反之则开启标注模式
  if (type === 'vehicle') {
    unref(scene).clearMarkMode()
  } else {
    unref(scene).openMarkMode({
      color: 'rgb(255, 0, 0)',
      label: '点',
      lon: '',
      lat: '',
      worldX: '',
      worldY: '',
    })
  }
}
// 回显数据
function setData() {
  const cameraData = cloneDeep(toRaw(markStore.cameraData))
  if (cameraData) {
    const { sceneData, inData, center, mode, startPointId, endPointId, isdistort, version } = cameraData
    // 如果version等于'2.0'，则表示是车标定方式，设置相关值
    if (version === '2.0') {
      operationPanelRef.value.cameraInfo.markType = 'vehicle'
      operationPanelRef.value.cameraInfo.fileList = [{ name: 'extrinsic.bin' }]
      return
    }
    // version不等于'2.0'，则表示是手工标定方式
    operationPanelRef.value.cameraInfo.markType = 'man'
    if (sceneData && sceneData.length) {
      unref(scene).setData(sceneData)
    }
    if (mode) {
      operationPanelRef.value.cameraInfo.cameraMode = mode
    }
    if (inData) {
      operationPanelRef.value.cameraInfo.inData = inData
    }
    if (center) {
      operationPanelRef.value.cameraInfo.center.longitude = center.longitude
      operationPanelRef.value.cameraInfo.center.latitude = center.latitude
    }
    startPointId ? (operationPanelRef.value.cameraInfo.startEnd.startPointId = startPointId) : ''
    endPointId ? (operationPanelRef.value.cameraInfo.startEnd.endPointId = endPointId) : ''
    isdistort ? (operationPanelRef.value.cameraInfo.isdistort = isdistort) : ''
    // if (outData) {
    //   operationPanelRef.value.cameraInfo.outData = areaData.outData
    // }
  }
}

function handleGetData() {
  // alert(JSON.stringify(unref(scene).getData()))
  // 如果选择的是车标定方式，则返回选择的文件和version字段
  if (operationPanelRef.value.cameraInfo.markType === 'vehicle') {
    return {
      file: operationPanelRef.value.cameraInfo.fileList[0],
      version: '2.0',
    }
  }
  const data: any[] = unref(scene).getData()
  return {
    mode: operationPanelRef.value.cameraInfo.cameraMode,
    inData: operationPanelRef.value.cameraInfo.inData,
    isdistort: operationPanelRef.value.cameraInfo.isdistort,
    center: {
      longitude: Number(operationPanelRef.value.cameraInfo.center.longitude),
      latitude: Number(operationPanelRef.value.cameraInfo.center.latitude),
    },
    // outData: operationPanelRef.value.cameraInfo.outData,
    sceneData: data,
    startPointId: operationPanelRef.value.cameraInfo.startEnd.startPointId,
    endPointId: operationPanelRef.value.cameraInfo.startEnd.endPointId,
  }
}
async function handleCheckData() {
  const data: any[] = unref(scene).getData()
  const requestData: CheckData = {
    image_width: markStore.imageInfo.width,
    image_height: markStore.imageInfo.height,
    in_type: operationPanelRef.value.cameraInfo.isdistort,
    mode: operationPanelRef.value.cameraInfo.cameraMode,
    in_params: operationPanelRef.value.cameraInfo.inData,
    center: {
      longitude: Number(operationPanelRef.value.cameraInfo.center.longitude),
      latitude: Number(operationPanelRef.value.cameraInfo.center.latitude),
    },
    out_params_mark: data.map((item) => {
      return {
        img_x: item.pointSource[0].x,
        img_y: item.pointSource[0].y,
        longitude: item.lon,
        latitude: item.lat,
        world_x: item.worldX,
        world_y: item.worldY,
      }
    }),
  }
  const result = await markApi.checkCameraData(requestData)
  scene.value.changeAllShapeColor(result.data)
}

// 检测数据返回图片
async function handleCheckDataImg() {
  const data: any[] = unref(scene).getData()
  const requestData: CheckData = {
    image_width: markStore.imageInfo.width,
    image_height: markStore.imageInfo.height,
    in_type: operationPanelRef.value.cameraInfo.isdistort,
    mode: operationPanelRef.value.cameraInfo.cameraMode,
    in_params: operationPanelRef.value.cameraInfo.inData,
    direction: [],
    out_params_mark: [],
  }
  if (requestData.mode == 'LL') {
    requestData.center = {
      longitude: Number(operationPanelRef.value.cameraInfo.center.longitude),
      latitude: Number(operationPanelRef.value.cameraInfo.center.latitude),
    }
  }
  requestData.out_params_mark = data.map((item) => {
    if (item.shapeId == operationPanelRef.value.cameraInfo.startEnd.startPointId) {
      requestData.direction[0] = {
        img_x: item.pointSource[0].x,
        img_y: item.pointSource[0].y,
        longitude: item.lon,
        latitude: item.lat,
        world_x: item.worldX,
        world_y: item.worldY,
      }
    }
    if (item.shapeId == operationPanelRef.value.cameraInfo.startEnd.endPointId) {
      requestData.direction[1] = {
        img_x: item.pointSource[0].x,
        img_y: item.pointSource[0].y,
        longitude: item.lon,
        latitude: item.lat,
        world_x: item.worldX,
        world_y: item.worldY,
      }
    }
    return {
      img_x: item.pointSource[0].x,
      img_y: item.pointSource[0].y,
      longitude: item.lon,
      latitude: item.lat,
      world_x: item.worldX,
      world_y: item.worldY,
    }
  })
  const result = await markApi.checkCameraDataImg({
    cameraData: requestData,
    cameraId: markStore.cameraId,
  })
  openModal(true, {
    url: result.data,
  })
}
function handleHelp() {
  emits('openHelp')
}

// 校验输入数据的格式
async function handleValidate() {
  const result = await operationPanelRef.value.handleValidate()
  return result
}

defineExpose({
  handleGetData,
  handleValidate,
  reloadImg: initImage,
})
</script>
<style lang="less" scoped>
.mark-container {
  height: 100%;
}
.row-container {
  height: 96%;
  .left {
    background: #eef3f3;
    border-radius: 10px;
    padding: 30px;
    height: 100%;
  }
  .right {
    height: 100%;
    padding: 30px 30px 30px 80px;
    position: relative;
    .operation {
      position: absolute;
      top: 0;
      left: 20px;
      display: flex;
      flex-direction: column;
    }
  }
}
.canvasContainer {
  height: 100%;
}
</style>
