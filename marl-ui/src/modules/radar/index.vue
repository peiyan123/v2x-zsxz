<template>
  <div class="camera-container">
    <a-breadcrumb class="bread-crumb" separator="">
      <a-breadcrumb-item>当前位置</a-breadcrumb-item>
      <a-breadcrumb-separator>:</a-breadcrumb-separator>
      <a-breadcrumb-item>雷达管理</a-breadcrumb-item>
    </a-breadcrumb>
    <div>
      <a-button class="mb-0.5" type="primary" @click="openAddModal">新增设备</a-button>
      <!-- <a-button class="mb-0.5 ml-1" type="primary" @click="submitData">上报数据</a-button>
      <a-button class="mb-0.5 ml-1" type="primary" @click="handleReboot" v-if="dataSource && dataSource.length"
        >重启应用</a-button
      > -->
    </div>
    <a-table class="camera-table" :dataSource="dataSource" :columns="columns" :pagination="{ defaultPageSize: 9 }">
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'operation'">
          <a-space>
            <a-button type="link" @click="handleEdit(record)">编辑</a-button>
            <a-popconfirm title="确认删除吗?" ok-text="确认" cancelText="取消" @confirm="handleDelete(record)">
              <a-button type="link">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
        <template v-if="column.dataIndex === 'updatedAt'"> {{ moment(text).format('YYYY-MM-DD HH:mm:ss') }} </template>
      </template>
    </a-table>
    <AddRadarDrawer ref="addRadarRef" :deviceList="dataSource" />
    <RebootModal :visible="rebootVisible" />
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, defineExpose, unref } from 'vue'
// components
import AddRadarDrawer from './components/AddRadarDrawer.vue'
import { message, Modal } from 'ant-design-vue'
import RebootModal from '@/components/rebootModal/index.vue'
// type
import { CameraListItem } from '@/types/camera'
import { RadarListItem } from '@/types/radar'
// services
import * as radarApi from '@/services/api/radarApi'
import * as cameraApi from '@/services/api/cameraApi'
// hooks
import { useRouter } from 'vue-router'
import { createLoading } from '@/core/hooks/createLoading'
// store
import { useMarkStore } from '@/store/modules/mark'
import { useAppStore } from '@/store/modules/app'
// utils
import moment from 'moment'
import { pick } from 'lodash'
// datas
import { columns } from './data'
import { DeviceType, PositionEnum, PositionNameEnum } from '@/core/enums/cameraEnum'

const markStore = useMarkStore()

const router = useRouter()
const dataSource = ref<RadarListItem[]>([])
const addRadarRef = ref()
const previewRef = ref()
const appStore = useAppStore()
const rebootVisible = ref()
let handleLoading

onMounted(() => {
  getRadarList()
  handleLoading = createLoading()
})

function openAddModal() {
  addRadarRef.value.visible = true
  addRadarRef.value.radarId = ''
}

async function handleDelete(record: RadarListItem) {
  await radarApi.deleteRadar(record.id, PositionNameEnum[record.position])
  message.success('删除成功')
  await getRadarList()
}

function handleEdit(record: RadarListItem) {
  addRadarRef.value.visible = true
  addRadarRef.value.radarId = record.id
  const formVal = pick(record, [
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
  ])
  addRadarRef.value.setFieldsValue(formVal)
}

async function getRadarList() {
  const result = await radarApi.getRadarList()
  dataSource.value = result.data
}

async function submitData() {
  // const result = await cameraApi.getCameraList()
  // for (let i = 0; i < unref(dataSource).length; i++) {
  //   let bool = result.data.some((a) => a.position == unref(dataSource)[i].position)
  //   if (!bool) {
  //     return message.error(`请创建${PositionEnum[unref(dataSource)[i].position]}位置的摄像头`)
  //   }
  // }
  await radarApi.submitReportData()
  message.success('上报数据成功')
  appStore.setReboot(true)
}

async function handleReboot() {
  Modal.confirm({
    content: '是否立即应用',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        await cameraApi.rebootDevice()
        message.success('重启应用成功')
        appStore.setReboot(false)
      } catch (error) {
        console.log(error)
      }
      // rebootVisible.value = true
    },
  })
}

defineExpose({
  getRadarList,
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
</style>
