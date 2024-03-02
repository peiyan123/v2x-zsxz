<template>
  <div class="camera-container">
    <a-descriptions layout="vertical" :column="4" bordered>
      <template #title>
        <div class="flex justify-between items-center">
          <span>雷达信息</span>
          <div>
            <template v-if="!isPullingData">
              <a-button type="link" @click="handleEdit()">编辑</a-button>
              <a-popconfirm
                title="确认删除吗?"
                ok-text="确认"
                cancelText="取消"
                placement="topRight"
                @confirm="handleDelete()"
              >
                <a-button type="link">删除</a-button>
              </a-popconfirm>
            </template>
            <template v-else>
              <a-button type="link" @click="openGroupOfSubDevice()">在从机配置</a-button>
            </template>
          </div>
        </div>
      </template>
      <a-descriptions-item label="设备IP" :style="{ width: '200px' }">{{ detailData.ip }}</a-descriptions-item>
      <a-descriptions-item label="mbc IP" :style="{ width: '200px' }">{{ detailData.mbcIp }}</a-descriptions-item>
      <a-descriptions-item label="mbc端口" :style="{ width: '200px' }">{{ detailData.mbcPort }}</a-descriptions-item>
      <a-descriptions-item label="mbc网卡" :style="{ width: '200px' }">{{ detailData.mbcNetworkCard }}</a-descriptions-item>
      <a-descriptions-item label="协议" :style="{ width: '200px' }">{{ detailData.protocol }}</a-descriptions-item>
      <a-descriptions-item label="安装位置" :style="{ width: '200px' }">{{
        renderPosition(detailData.position)
      }}</a-descriptions-item>
      <a-descriptions-item label="设备型号">{{ detailData.model }}</a-descriptions-item>
      <a-descriptions-item label="序列号">{{ detailData.sn }}</a-descriptions-item>
      <a-descriptions-item label="创建/更新时间">{{ detailData.updatedAt }}</a-descriptions-item>
    </a-descriptions>
  </div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'
// datas
import { PositionEnum } from '@/core/enums/cameraEnum'

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

onMounted(() => {
  // handleLoading = createLoading()
})

function renderPosition(position) {
  return PositionEnum[position]
}

async function handleDelete() {
  emits('delete')
}

function handleEdit() {
  emits('edit')
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
</style>
