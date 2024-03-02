<template>
  <div class="operation">
    <a-popover>
      <template #content>
        <div class="flex items-center text-yellow-600">
          <ExclamationCircleOutlined />
          <p class="ml-5px mb-0">从RTSP流截取最新图片更换当前图片</p>
        </div>
      </template>
      <a-button type="primary" class="mb-10px" @click="changeImage">
        <template #icon>
          <RedoOutlined />
        </template>
      </a-button>
    </a-popover>
    <a-popover>
      <template #content>
        <div class="flex items-center text-yellow-600">
          <QuestionCircleOutlined />
          <p class="ml-5px mb-0">使用帮助文档</p>
        </div>
      </template>
      <a-button type="primary" @click="handleHelp">
        <template #icon>
          <QuestionCircleOutlined />
        </template>
      </a-button>
    </a-popover>
    <a-popover>
      <template #content>
        <div class="flex items-center text-yellow-600">
          <ExclamationCircleOutlined />
          <p class="ml-5px mb-0">重置图片大小和位置</p>
        </div>
      </template>
      <a-button type="primary" class="mt-10px" @click="resetCanvas">
        <template #icon>
          <SyncOutlined />
        </template>
      </a-button>
    </a-popover>
  </div>
</template>
<script lang="ts" setup>
import { defineEmits, inject, ref } from 'vue'
import { RedoOutlined, QuestionCircleOutlined, ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons-vue'
const emits = defineEmits(['changeImage', 'resetCanvas'])

const openHelp = inject('openHelp')

// const { changeImage } = useMark()
function handleHelp() {
  openHelp()
}
function changeImage() {
  emits('changeImage')
}
function resetCanvas() {
  emits('resetCanvas')
}
</script>
<style lang="less" scoped>
.operation {
  position: absolute;
  top: 0;
  left: 20px;
  display: flex;
  flex-direction: column;
}
</style>
