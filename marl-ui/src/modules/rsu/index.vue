<template>
  <div class="camera-container">
    <a-breadcrumb class="bread-crumb" separator="">
      <a-breadcrumb-item>当前位置</a-breadcrumb-item>
      <a-breadcrumb-separator>:</a-breadcrumb-separator>
      <a-breadcrumb-item>RSU管理</a-breadcrumb-item>
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
    <AddRsuDrawer ref="addRsuRef" :deviceList="dataSource" />
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, defineExpose } from 'vue'
// components
import AddRsuDrawer from './components/AddRsuDrawer.vue'
import { message, Modal } from 'ant-design-vue'
// type
import { RsuListItem } from '@/types/rsu'
// services
import * as rsuApi from '@/services/api/rsuApi'
import * as cameraApi from '@/services/api/cameraApi'
// hooks
import { useRouter } from 'vue-router'
// store
import { useMarkStore } from '@/store/modules/mark'
import { useAppStore } from '@/store/modules/app'
// utils
import moment from 'moment'
import { pick } from 'lodash'
// datas
import { columns } from './data'

const markStore = useMarkStore()

const router = useRouter()
const dataSource = ref<RsuListItem[]>([])
const addRsuRef = ref()
const previewRef = ref()
const appStore = useAppStore()

onMounted(() => {
  getRsuList()
})

function openAddModal() {
  addRsuRef.value.visible = true
  addRsuRef.value.rsuId = ''
}

async function handleDelete(record: RsuListItem) {
  await rsuApi.deleteRsu(record.id)
  message.success('删除成功')
  await getRsuList()
}

function handleEdit(record: RsuListItem) {
  addRsuRef.value.visible = true
  addRsuRef.value.rsuId = record.id
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
    'emergencyThreshold',
    'frequency',
    'heartbeatPeriod',
    'sendPeriod',
  ])
  addRsuRef.value.setFieldsValue(formVal)
}

async function getRsuList() {
  const result = await rsuApi.getRsuList()
  dataSource.value = result.data as any
}

async function submitData() {
  await rsuApi.submitReportData()
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
  getRsuList,
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
