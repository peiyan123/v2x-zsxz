<template>
  <div class="camera-container">
    <a-breadcrumb class="bread-crumb" separator="">
      <a-breadcrumb-item>当前位置</a-breadcrumb-item>
      <a-breadcrumb-separator>:</a-breadcrumb-separator>
      <a-breadcrumb-item>接入设备管理</a-breadcrumb-item>
    </a-breadcrumb>
    <div class="tools-and-form">
      <div>
        <a-button class="mb-0.5" type="primary" @click="openAddModal">新增设备</a-button>
        <!--<a-button class="mb-0.5 ml-1" type="primary" @click="submitData">上报数据</a-button>-->
        <!-- <a-button class="mb-0.5 ml-1" type="primary" @click="handleReboot" v-if="dataSource && dataSource.length"
          >重启应用</a-button
        > -->
      </div>
      <div>
        <a-form layout="inline" :model="formState" ref="formRef">
          <!-- <a-form-item label="" name="name">
            <a-input v-model:value="formState.name" allowClear placeholder="设备名称" maxLength="100" />
          </a-form-item> -->
          <a-form-item label="" name="rtsp">
            <a-input v-model:value="formState.rtsp" allowClear placeholder="RTSP" maxLength="100" />
          </a-form-item>
          <a-form-item class="button-wrap">
            <a-button type="primary" @click="onSearch">搜索</a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
    <a-table
      class="camera-table"
      :dataSource="dataSource"
      :columns="columns"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'operation'">
          <a-space class="operation-wrap">
            <a-button type="link" @click="handleEdit(record)">编辑</a-button>
            <a-popconfirm title="确认删除吗?" ok-text="确认" cancelText="取消" @confirm="handleDelete(record)">
              <a-button type="link">删除</a-button>
            </a-popconfirm>
            <a-button type="link" @click="handleMark(record)">标定</a-button>
            <a-button type="link" @click="handleDownload(record)">下载</a-button>
            <a-button v-if="false" type="link" @click="handlePreview(record)">预览</a-button>
          </a-space>
        </template>
        <template v-if="column.dataIndex === 'updatedAt'">
          {{ moment(text, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-if="column.dataIndex === 'status'">
          <Tooltip :title="getStatusTitle(text)">
            <div class="status-icon" :class="getStatusClass(text)"></div>
          </Tooltip>
        </template>
      </template>
    </a-table>
    <!-- <AddCamera ref="addCameraRef" /> -->
    <PreviewCamera ref="previewRef"></PreviewCamera>
    <AddCameraDrawer ref="addCameraRef" :deviceList="dataSource" />
    <RebootModal :visible="rebootVisible" />
  </div>
</template>

<script lang="tsx" setup>
import { onMounted, onActivated, onDeactivated, ref, defineExpose, reactive } from 'vue'
// components
import AddCameraDrawer from './components/AddCameraDrawer.vue'
import PreviewCamera from './components/PreviewCamera.vue'
import { message, Modal, Tooltip } from 'ant-design-vue'
import RebootModal from '@/components/rebootModal/index.vue'
// type
import { ReportItem, CameraListItem } from '@/types/camera'
// services
import * as cameraApi from '@/services/api/cameraApi'
// hooks
import { useRouter } from 'vue-router'
import { createLoading } from '@/core/hooks/createLoading'
// store
import { useMarkStore } from '@/store/modules/mark'
// utils
import moment from 'moment'
import { pick, pickBy } from 'lodash'
// datas
import { columns } from './data'
import { DeviceType, PositionEnum, PositionNameEnum } from '@/core/enums/cameraEnum'
// hooks
import { useAppStore } from '@/store/modules/app'
import { downloadFile, downloadData } from '@/utils'

const markStore = useMarkStore()
const appStore = useAppStore()
const router = useRouter()
const dataSource = ref<CameraListItem[]>([])
const addCameraRef = ref()
const previewRef = ref()
const rebootVisible = ref()
const formRef = ref()
const formState = reactive<any>({
  name: '',
  rtsp: '',
})
const sortParams = reactive<any>({
  sort: '',
  order: '',
})
const pagination = reactive<any>({
  current: 1,
  pageSize: 9,
  total: 0,
  defaultPageSize: 9,
})
let handleLoading

onMounted(() => {
  console.log('this is camera index')
  getCameraList({ pageIndex: 1, pageSize: 9 })
  handleLoading = createLoading()
})

onActivated(() => {
  // 进入页面时，监听键盘点击
  bindKeyup()
})

onDeactivated(() => {
  // 离开页面时，移除键盘点击监听
  removeKeyup()
})

function openAddModal() {
  addCameraRef.value.visible = true
  addCameraRef.value.cameraId = ''
}
/**
 * 绑定键盘点击事件
 */
function bindKeyup() {
  document.onkeyup = (e) => {
    //事件对象兼容
    let eventTemp = e || window.event || arguments.callee.caller.arguments[0]
    console.log(eventTemp.code)
    if (eventTemp.code === 'Enter' || eventTemp.code === 'NumpadEnter') {
      onSearch()
    }
  }
}
/**
 * 移除键盘点击事件
 */
function removeKeyup() {
  document.onkeyup = null
}
/**
 * 对列表进行搜索
 */
function onSearch() {
  const params = formRef.value?.getFieldsValue()
  getCameraList({ current: 1, pageSize: pagination.pageSize, ...params, ...sortParams })
}
/**
 * 列表关联对象发生变化时触发的方法
 * @param page 分页对象
 * @param filters 过滤参数对象
 * @param sorter 排序参数对象
 */
function handleTableChange(page: { pageSize: number; current: number }, filters: any, sorter: any) {
  console.log(page, filters, sorter)
  // 如果有排序，则设置排序字段名和排序规则
  if (sorter.order) {
    sortParams.sort = sorter.field
    sortParams.order = sorter.order
  } else {
    // 没有排序，则清空排序字段和排序规则
    sortParams.sort = ''
    sortParams.order = ''
  }
  const params = formRef.value?.getFieldsValue()
  getCameraList({ current: page.current, pageSize: page.pageSize, ...sortParams, ...params })
}

async function handleDelete(record: CameraListItem) {
  await cameraApi.deleteCamera(record.id, PositionNameEnum[record.position])
  message.success('删除成功')
  await getCameraList({ current: pagination.current, pageSize: pagination.pageSize })
}

function handleEdit(record: CameraListItem) {
  addCameraRef.value.visible = true
  addCameraRef.value.cameraId = record.id
  const formVal = pick(record, [
    'ip',
    'port',
    'model',
    'rtsp',
    'position',
    'desc',
    'name',
    'type',
    'facturer',
    'protocol',
    'towards',
    'status',
    'sn',
  ])
  formVal.videoList = record.video ? JSON.parse(record.video) : []
  addCameraRef.value.setFieldsValue(formVal)
  // 如果视频已经上传，则不显示视频提示
  addCameraRef.value.showVideoTip = record.video && JSON.parse(record.video).length > 0 ? false : true
}
/**
 * 调用接口请求数据
 * @param params 查询参数
 */
async function getCameraList(params?) {
  // 用pickBy过滤掉值为空的参数
  const result = await cameraApi.getCameraList(pickBy(params))
  dataSource.value = result.data.list as []
  pagination.total = result.data.total
  pagination.current = result.data.current
}

function handleMark(record: CameraListItem) {
  markStore.setCameraId(record.id)
  markStore.setCameraName(record.name)
  markStore.setRtsp(record.rtsp)
  // router.push({
  //   name: 'MarkIndex',
  //   params: { name: record.name },
  //   query: { id: record.id, name: record.name, rtsp: record.rtsp },
  // })
  // 新开一个标签页面来显示标定页面
  const { href } = router.resolve({
    name: 'MarkIndex',
    params: { name: record.name },
    query: { id: record.id, name: record.name, rtsp: record.rtsp },
  })
  window.open(href, '_blank')
}
/**
 * 下载按钮点击事件触发方法
 * @param record 点击行的数据对象
 */
async function handleDownload(record: CameraListItem) {
  if (record.id) {
    try {
      const result = await downloadData('/mark-download', { cameraId: record.id })
      downloadFile(result)
    } catch (e) {
      console.log(e)
    }
  }
}

async function handlePreview(record: CameraListItem) {
  // let rtsp
  // if (record.id == '9') {
  //   rtsp = 'rtsp://admin:ZKCD1234@10.0.20.112:554/Streaming/Channels/1'
  // } else {
  //   rtsp = 'rtsp://admin:ZKCD1234@10.0.20.224:554/Streaming/Channels/1'
  // }
  await cameraApi.startRtsp()
  previewRef.value.rtspUrl = record.rtsp
  previewRef.value.visible = true
}

async function submitData() {
  await cameraApi.submitReportData()
  message.success('上报数据成功')
  appStore.setReboot(true)
}

async function handleReboot() {
  Modal.confirm({
    content: '是否立即重启应用',
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
function getStatusTitle(text) {
  if (text === '2') {
    return '运行正常'
  } else if (text === '3') {
    return '运行异常'
  } else {
    return '摄像机和视频都不可用'
  }
}

function getStatusClass(text) {
  return text === '1' ? 'disabled' : text === '2' ? 'normal' : 'abnormal'
}

defineExpose({
  getCameraList,
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

  .operation-wrap {
    :deep(.ant-btn) {
      padding-left: 5px;
      padding-right: 5px;
    }
  }

  .status-icon {
    width: 15px;
    height: 15px;
    margin: 0 auto;
    border-radius: 50%;
    // background: red;
  }

  .normal {
    background: #a2ef4d;
  }

  .abnormal {
    background: #bd3124;
  }

  .disabled {
    background: #bebebe;
  }
}

.tools-and-form {
  display: flex;
  justify-content: space-between;

  .button-wrap {
    margin-right: 0;
  }
}
</style>
