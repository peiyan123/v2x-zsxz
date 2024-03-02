<template>
  <div class="mark-container">
    <a-row type="flex" class="row-container">
      <a-col :span="24" class="right">
        <div class="operation">
          <a-button type="primary" class="mb-10px">
            <template #icon>
              <a-popover>
                <template #content>
                  <div class="flex items-center text-yellow-600">
                    <ExclamationCircleOutlined />
                    <p class="ml-5px">更换编辑图片</p>
                  </div>
                </template>
                <RedoOutlined @click="changeImage" />
              </a-popover>
            </template>
          </a-button>
          <a-button type="primary">
            <template #icon>
              <a-popover>
                <template #content>
                  <div class="flex items-center text-yellow-600">
                    <ExclamationCircleOutlined />
                    <p class="ml-5px">使用帮助文档</p>
                  </div>
                </template>
                <QuestionCircleOutlined @click="handleHelp" />
              </a-popover>
            </template>
          </a-button>
        </div>
        <div class="canvasContainer" ref="handleRef"></div>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted, toRaw, defineExpose, unref } from 'vue'
// components
import { SegmentationScene } from '@/thundersoft/ai-mark'
import OperationPanel from './OperationPanel.vue'
import { RedoOutlined, QuestionCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
//datas
import { images } from './access-image'
// hooks
import { useMarkStore } from '@/store/modules/mark'
import { useMark } from '../hooks/useMark'

const emits = defineEmits(['openHelp'])
const markStore = useMarkStore()
const { scene, handleRef, changeImage, handleGetData, showImageUrl } = useMark()

onMounted(async () => {
  scene.value = new SegmentationScene(handleRef.value)
  // 加载图片
  unref(scene).reload(showImageUrl.value, [])

  unref(scene).setMaxLength(2)

  setData()
  // 进入标注模式
  unref(scene).openMarkMode({
    color: 'rgb(35, 98, 29)',
  })
})

// 回显数据
function setData() {
  const spilledData = toRaw(markStore.spilledData)
  if (spilledData && spilledData.length) {
    unref(scene).setData(spilledData)
  }
}

function handleHelp() {
  emits('openHelp')
}

defineExpose({
  handleGetData,
})
</script>
<style lang="less" scoped>
.mark-container {
  height: 100%;
}
.row-container {
  height: 85%;
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
