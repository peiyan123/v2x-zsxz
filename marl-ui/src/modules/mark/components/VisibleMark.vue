<template>
  <div class="mark-container">
    <OperationButton @getData="handleGetData" @delete="handleDelete" @changeImage="changeImage" type="visible" />
    <a-row type="flex" class="row-container">
      <a-col :span="6" class="left" hidden>
        <OperationPanel />
      </a-col>
      <a-col :span="24" class="right">
        <div class="canvasContainer" ref="handleRef"></div>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
import OperationPanel from './OperationPanel.vue'
import OperationButton from './OperationButton.vue'
// 用来测试的图片数据
import { images } from './access-image'
import { ref, onMounted, onUnmounted, toRaw, defineExpose, unref } from 'vue'
import { useMark } from '../hooks/useMark'
import { DetectionScene } from '@/thundersoft/ai-mark'

const { scene, handleRef, changeImage, handleGetData } = useMark()
const drawType = {
  type: '',
  label: '能见度',
  color:
    'rgb(' +
    parseInt(Math.random() * 1000 + '') / 4 +
    ',' +
    parseInt(Math.random() * 1000 + '') / 4 +
    ',' +
    parseInt(Math.random() * 1000 + '') / 4 +
    ')',
}
onMounted(() => {
  scene.value = new DetectionScene(handleRef.value)
  unref(scene).reload(images[0], [])
  unref(scene).openMarkMode(drawType)
})

function handleDelete() {
  unref(scene).deleteSelected()
}
</script>
<style lang="less" scoped>
.mark-container {
  height: 100%;
}
.row-container {
  height: 100%;
  .left {
    background: #eef3f3;
    border-radius: 10px;
    padding: 10px;
    height: 100%;
  }
  .right {
    height: 100%;
  }
}
.canvasContainer {
  height: 100%;
}
</style>
