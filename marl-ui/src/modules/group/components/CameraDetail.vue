<template>
  <div class="camera-container">
    <a-descriptions layout="vertical" :column="4" bordered>
      <template #title>
        <div class="flex justify-between items-center">
          <span>摄像头信息</span>
          <div>
            <template v-if="!isPullingData">
              <a-button type="link" @click="handleEdit()">编辑</a-button>
              <a-popconfirm title="确认删除吗?" ok-text="确认" cancelText="取消" @confirm="handleDelete()">
                <a-button type="link">删除</a-button>
              </a-popconfirm>
              <a-button type="link" @click="handleMark()">标定</a-button>
              <a-button type="link" @click="handleDownload()">下载</a-button>
            </template>
            <template v-else>
              <a-button type="link" @click="openGroupOfSubDevice()">在从机配置</a-button>
            </template>
          </div>
        </div>
      </template>
      <a-descriptions-item label="设备名称" :style="{ width: '200px' }">{{ detailData.name }}</a-descriptions-item>
      <a-descriptions-item label="RTSP" :style="{ width: '200px' }">{{ detailData.rtsp }}</a-descriptions-item>
      <a-descriptions-item label="方向" :style="{ width: '200px' }">{{
        renderTowards(detailData.towards)
      }}</a-descriptions-item>
      <a-descriptions-item label="厂商" :style="{ width: '200px' }">{{
        renderFacturer(detailData.facturer)
      }}</a-descriptions-item>
      <a-descriptions-item label="设备型号">{{ detailData.model }}</a-descriptions-item>
      <a-descriptions-item label="序列号">{{ detailData.sn }}</a-descriptions-item>
      <a-descriptions-item label="设备状态">
        <Tooltip :title="getStatusTitle(detailData.status)">
          <div class="status-icon" :class="getStatusClass(detailData.status)"></div>
        </Tooltip>
      </a-descriptions-item>
      <a-descriptions-item label="创建/更新时间">{{ detailData.updatedAt }}</a-descriptions-item>
    </a-descriptions>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, defineExpose, unref } from 'vue'
// hooks
import { useRouter } from 'vue-router'
import { createLoading } from '@/core/hooks/createLoading'
// store
import { useAppStore } from '@/store/modules/app'
import { useMarkStore } from '@/store/modules/mark'
// datas
import { CameraTowardsEnum, DeviceType, PositionEnum, PositionNameEnum } from '@/core/enums/cameraEnum'
import { downloadData, downloadFile } from '@/utils'

const props = defineProps({
  detailData: {
    type: Object,
    default: () => {},
  },
  isPullingData: {
    type: Boolean,
    default: false,
  },
})
const emits = defineEmits(['edit', 'delete', 'openGroup'])
const router = useRouter()
const markStore = useMarkStore()

onMounted(() => {
  // handleLoading = createLoading()
})

function renderTowards(towards) {
  return CameraTowardsEnum[towards]
}
function renderFacturer(facturer) {
  return facturer === 'hikvision' ? '海康威视' : facturer === 'sensing' ? '森云' : ''
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

async function handleDelete() {
  emits('delete')
}

function handleEdit() {
  emits('edit')
}

function handleMark() {
  markStore.setCameraId(props.detailData.id)
  markStore.setCameraName(props.detailData.name)
  markStore.setRtsp(props.detailData.rtsp)
  // 新开一个标签页面来显示标定页面
  let tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  const { href } = router.resolve({
    name: 'MarkIndex',
    params: { name: props.detailData.name },
    query: {
      group: props.detailData.groupName,
      id: props.detailData.id,
      name: props.detailData.name,
      rtsp: props.detailData.rtsp,
      type: tab
    },
  })
  window.open(href, '_blank')
}
/**
 * 下载按钮点击事件触发方法
 * @param record 点击行的数据对象
 */
async function handleDownload() {
  const id = props.detailData.id
  if (id) {
    try {
      const result = await downloadData('/mark-download', { cameraId: id })
      downloadFile(result)
    } catch (e) {
      console.log(e)
    }
  }
}
function openGroupOfSubDevice() {
  emits('openGroup')
}
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
.status-icon {
  display: inline-block;
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
</style>
