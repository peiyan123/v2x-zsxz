<template>
  <div class="camera-container">
    <div>
      <!-- <a-radio-group class="radio-group-wrap" v-model:value="modelValue"> -->
      <!-- <a-radio class="radio-item" :value="1">设备配置</a-radio> -->
      <div class="item-title flex justify-between items-center">
        <div>设备配置</div>
        <div class="button-wrap">
          <a-button
            class="mb-0.5"
            type="primary"
            @click="openAddCamera"
            :disabled="groupInfoData.camera3 || groupInfoData.camera2 || groupInfoData.camera || isPullingData"
            >新增摄像头</a-button
          >
          <a-button
            class="mb-0.5 ml-0.5"
            type="primary"
            @click="openAddRadar"
            :disabled="groupInfoData.radar2 || groupInfoData.radar3 || groupInfoData.radar || isPullingData"
            >新增雷达</a-button
          >
        </div>
      </div>
      <div class="item-content-wrap">
        <a-space direction="vertical" :size="15">
          <CameraDetail
            :disabled="true"
            :detailData="((groupInfoData.camera || groupInfoData.camera2 || groupInfoData.camera3) && { ...groupInfoData.camera3, ...groupInfoData.camera2, ...groupInfoData.camera, groupName: groupInfoData.name }) || {}"
            :isPullingData="isPullingData"
            v-if="groupInfoData.camera || groupInfoData.camera2 || groupInfoData.camera3"
            @edit="() => handleEdit('camera')"
            @delete="() => handleDelete('camera')"
            @openGroup="openGroupOfSubDevice"
          />
          <RadarDetail
            :detailData="groupInfoData.radar || groupInfoData.radar2 || groupInfoData.radar3 || {}"
            :isPullingData="isPullingData"
            v-if="(groupInfoData.radar && groupInfoData.radar.id) || (groupInfoData.radar2 && groupInfoData.radar2.id) || (groupInfoData.radar3 && groupInfoData.radar3.id)"
            @edit="() => handleEdit('radar')"
            @delete="() => handleDelete('radar')"
            @openGroup="openGroupOfSubDevice"
          />
        </a-space>
      </div>
      <!-- <a-radio class="radio-item" :value="2">MEC配置</a-radio> -->
      <!-- <div class="item-title mt-1">MEC配置</div>
      <div class="item-content-wrap flex items-center mb-1">
        <span class="mec-title">数据端口：</span>
        <a-input-number class="mec-input" :disabled="isPullingData" v-model:value="dataPort" />
        <a-button class="save-button" @click="saveDataPort" type="primary">保存</a-button>
      </div>
      <a-checkbox v-model:checked="isPullingData" :disabled="isSubDevice" @change="changePullingData"
        >是否从分机获取数据</a-checkbox
      >
      <div class="item-content-wrap flex items-center">
        <span class="mec-title">分机IP：</span>
        <a-input class="mec-input" :disabled="!isPullingData" v-model:value="extensionIp" />
      </div>
      <div class="ml-1 mt-1">
        <a-button type="primary" @click="saveIp" :disabled="isSubDevice || !isPullingData">保存</a-button>
      </div> -->
      <!-- <div v-show="!isPullingData">
        <div class="item-title mt-1">高低速阈值配置</div>
        <div class="item-content-wrap mb-1">
          <div>
            <span class="mec-title">高速阈值：</span>
            <a-input-number class="mec-input" v-model:value="highSpeedThreshold" min="0" />
          </div>
          <div class="mt-1">
            <span class="mec-title">低速阈值：</span>
            <a-input-number class="mec-input" v-model:value="lowSpeedThresholdLower" placeholder="下限" min="0" /> ~
            <a-input-number class="mec-input" v-model:value="lowSpeedThresholdUpper" placeholder="上限" min="0" />
          </div>
          <div class="mt-1"><a-button type="primary" @click="saveSpeedThreshold">保存</a-button></div>
        </div>
      </div> -->
      <!-- </a-radio-group> -->
      <AddCameraDrawer ref="addCameraRef" :title="cameraTitle" :deviceList="[]" :groupId="groupId" />
      <AddRadarDrawer ref="addRadarRef" :title="radarTitle" :deviceList="[]" :groupId="groupId" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, defineExpose, unref, watch, onActivated } from 'vue'
// components
import { message } from 'ant-design-vue'
import AddCameraDrawer from '../../camera/components/AddCameraDrawer.vue'
import AddRadarDrawer from '../../radar/components/AddRadarDrawer.vue'
import CameraDetail from './CameraDetail.vue'
import RadarDetail from './RadarDetail.vue'
// services
import * as radarApi from '@/services/api/radarApi'
import * as cameraApi from '@/services/api/cameraApi'
import * as groupApi from '@/services/api/groupApi'
// utils
import { pick } from 'lodash'
// datas
import { PositionNameEnum } from '@/core/enums/cameraEnum'
import { useAppStore } from '@/store/modules/app'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  currentPanel: { type: String, default: 'area' },
  groupId: { type: String, default: '' },
  isSubDevice: { type: Boolean, default: false },
})
const appStore = useAppStore()
const isPullingData = ref(false)
const addCameraRef = ref()
const cameraTitle = ref('')
const addRadarRef = ref()
const radarTitle = ref('')
const groupInfoData = ref<Record<string, any>>({})
const dataPort = ref('')
const extensionIp = ref('')
// const highSpeedThreshold = ref(0)
// const lowSpeedThresholdLower = ref(0)
// const lowSpeedThresholdUpper = ref(0)

async function getGroupInfo() {
  const { data } = await groupApi.getGroupInfo(props.groupId)
  groupInfoData.value = data || {}
  dataPort.value = groupInfoData.value.dataPort
  isPullingData.value = groupInfoData.value.pullData
  extensionIp.value = groupInfoData.value.extensionIp
  // 初始化高低速阈值配置的值
  // highSpeedThreshold.value = groupInfoData.value.highSpeedThreshold
  // const lowSpeedThreshold = groupInfoData.value.lowSpeedThreshold || ''
  // let lowSpeedThresholdArr = lowSpeedThreshold.split(',')
  // if (lowSpeedThresholdArr.length < 2) {
  //   lowSpeedThresholdArr = [0, 0]
  // }
  // lowSpeedThresholdLower.value = lowSpeedThresholdArr[0]
  // lowSpeedThresholdUpper.value = lowSpeedThresholdArr[1]
}

async function updateGroupInfo(params) {
  await groupApi.updateGroup({ ...params, id: props.groupId })
  message.success('保存成功')
}

onMounted(() => {
  // getRadarList()
  getGroupInfo()
  // handleLoading = createLoading()
})
function openAddCamera() {
  addCameraRef.value.visible = true
  addCameraRef.value.cameraId = ''
  cameraTitle.value = '新增摄像头'
}
function openAddRadar() {
  addRadarRef.value.visible = true
  addRadarRef.value.radarId = ''
  radarTitle.value = '新增雷达'
}

async function handleDelete(type) {
  if (type === 'camera') {
    const { id, position } = groupInfoData.value.camera || groupInfoData.value.camera2 || groupInfoData.value.camera3
    await cameraApi.deleteCamera(id, PositionNameEnum[position])
  } else {
    const { id, position } = groupInfoData.value.radar || groupInfoData.value.radar2 || groupInfoData.value.radar3
    await radarApi.deleteRadar(id, PositionNameEnum[position])
  }
  message.success('删除成功')
  appStore.setReboot(true)
  await getGroupInfo()
}

function handleEdit(type) {
  if (type === 'camera') {
    const cameraData = groupInfoData.value.camera || groupInfoData.value.camera2 || groupInfoData.value.camera3
    addCameraRef.value.visible = true
    addCameraRef.value.cameraId = cameraData.id
    cameraTitle.value = '编辑摄像头'
    const formVal: Record<string, any> = pick(cameraData, [
      'ip',
      'port',
      'model',
      'position',
      'desc',
      'name',
      'facturer',
      'protocol',
      'status',
      'towards',
      'sn',
      'rtsp',
    ])
    formVal.videoList = cameraData.video ? JSON.parse(cameraData.video) : []
    formVal.status = formVal.status === null ? '1' : formVal.status
    formVal.streamType = formVal.rtsp ? 'rtsp' : formVal.videoList.length > 0 ? 'video' : ''
    addCameraRef.value.setFieldsValue(formVal)
  } else {
    const radarData = groupInfoData.value.radar || groupInfoData.value.radar2 || groupInfoData.value.radar3
    addRadarRef.value.visible = true
    addRadarRef.value.radarId = radarData.id
    radarTitle.value = '编辑雷达'
    const formVal = pick(radarData, [
      'ip',
      'port',
      'model',
      'position',
      'desc',
      'name',
      'facturer',
      'protocol',
      'status',
      'sn',
      'mbcIp',
      'mbcPort',
      'mbcNetworkCard',
    ])
    addRadarRef.value.setFieldsValue(formVal)
  }
}

// async function changePullingData(e) {
//   const checked = e.target.checked
//   // 如果取消从分机拉取数据，则保存
//   if (!checked) {
//     await updateGroupInfo({ pullData: checked })
//   }
// }

// function saveDataPort() {
//   updateGroupInfo({ dataPort: dataPort.value })
// }

// async function saveIp() {
//   await updateGroupInfo({ extensionIp: extensionIp.value, pullData: isPullingData.value })
//   // 拉取数据
//   await groupApi.pullData(props.groupId)
//   // 刷新页面
//   getGroupInfo()
// }
/**
 * 打开分机上面的对应分组页面
 */
function openGroupOfSubDevice() {
  window.open(`http://${extensionIp.value}:10033/#/group/index?name=${groupInfoData.value.name}`, '_blank')
}
/**
 * 保存高低速阈值配置
 */
// async function saveSpeedThreshold() {
//   console.log(lowSpeedThresholdLower.value)
//   if (
//     (lowSpeedThresholdLower.value === null && lowSpeedThresholdUpper.value !== null) ||
//     (lowSpeedThresholdLower.value !== null && lowSpeedThresholdUpper.value === null)
//   ) {
//     message.error('请输入完整的低速阈值区间')
//     return
//   }
//   if (lowSpeedThresholdLower.value !== null && +lowSpeedThresholdLower.value > +lowSpeedThresholdUpper.value) {
//     message.error('低速阈值上下限不正确')
//     return
//   }
//   // 低速阈值上下限拼接成字符串，中间用逗号分隔
//   const lowSpeedThreshold =
//     lowSpeedThresholdLower.value !== null ? `${lowSpeedThresholdLower.value},${lowSpeedThresholdUpper.value}` : ''
//   await updateGroupInfo({ highSpeedThreshold: highSpeedThreshold.value, lowSpeedThreshold })
// }
watch(
  () => [props.isOpen, props.groupId],
  (newVal, oldVal) => {
    // 如果props.isOpen为真，或者props.groupId发生改变，则重新获取当前展示group的信息
    if (newVal[0] || newVal[1] !== oldVal[1]) {
      getGroupInfo()
    }
  }
)

onActivated(() => {
  if (props.isOpen) {
    getGroupInfo()
  }
})

defineExpose({
  getGroupInfo,
})
</script>
<style lang="less" scoped>
.bread-crumb {
  margin-bottom: 10px;
}
.camera-table {
  :deep(.ant-table-content) {
    max-height: 650px;
    overflow-x: hidden;
    overflow-y: scroll;
    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 2px;
      background-color: rgba(229, 229, 229, 1);
    }
  }
}
.item-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 15px;
}
.button-wrap {
  & > * {
    margin-bottom: 0;
  }
}
.radio-group-wrap {
  width: 100%;
}
.radio-item {
  display: flex;
  height: 30px;
  line-height: 30px;
  margin: 20px 0;
  font-size: 16px;
  font-weight: bold;
}
.item-content-wrap {
  padding: 0 0 0 25px;
  & > * {
    width: 100%;
  }
  :deep(.ant-descriptions-header) {
    margin-bottom: 0;
  }
  :deep(.ant-descriptions-title) {
    font-size: 12px;
  }
}
.mec-title {
  width: 100px;
  font-size: 14px;
}
.mec-input {
  width: 220px;
}
.save-button {
  flex: 0;
  // width: 80px;
  margin-left: 20px;
}
</style>
