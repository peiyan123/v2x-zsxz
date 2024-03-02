<template>
  <div class="mark-container">
    <a-row type="flex" class="row-container">
      <a-col :span="6" class="left">
        <OperationPanel
          :fuseList="fuseList"
          type="fuse"
          :selectedShape="selectedShape"
          @changeFuse="changeFuse"
          @delFuse="delFuse"
          @addFuse="addFuse"
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
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, toRaw, defineExpose, unref, reactive, watch, defineProps, defineEmits } from 'vue'
// components
import { SegmentationScene3 } from '@/thundersoft/ai-mark'
import OperationPanel from './OperationPanel.vue'
import CommonOperations from './CommonOperations.vue'
import { useMarkStore } from '@/store/modules/mark'
import { RedoOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'
// utils
import { groupBy, find, cloneDeep } from 'lodash'
import { randomColor } from '@/utils'
// type
import { FuseList } from '../type'
// hooks
import { useMark } from '../hooks/useMark'
// enum
import { LaneOperation } from '@/core/enums/markEnum'

import { Subscription } from 'rxjs/internal/Subscription'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  currentPanel: { type: String, default: 'area' },
})
const emits = defineEmits(['openHelp'])

const { scene, handleRef, changeImage, showImageUrl, initImage, resetCanvas } = useMark()

// const { validate, validateInfos, resetFields, clearValidate } = useForm(formState, rules)
const markStore = useMarkStore()
const selectedShape = ref()
const fuseList = ref<Array<FuseList>>([])
const destroyEvent: (Subscription | undefined)[] = []
watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      setTimeout(() => {
        unref(scene).changeImage(showImageUrl.value)
      }, 50)
    }
    unref(scene).toggleShowAndHide(val)
  }
)

onMounted(() => {
  // setData()
  scene.value = new SegmentationScene3(handleRef.value)
  unref(scene).toggleShowAndHide(props.isOpen)
  // 加载图片
  unref(scene).reload(showImageUrl.value, [])
  setData()
  destroyEvent.push(
    // 注册标注图形选中事件触发的方法
    unref(scene).selectShapeEvent.subscribe((shapeData) => {
      const { name, type } = shapeData
      const typeStr = type + ''
      // 遍历左侧列表，找到要高亮按钮所在的元素，并设置选中按钮对应的key
      for (let index = 0; index < fuseList.value.length; index++) {
        const item = fuseList.value[index]
        if (item.type + '' === typeStr) {
          // 设置选中按钮的key
          item.currentOperation = name
          // for (var key in LaneOperation) {
          //   // 设置选中按钮的key
          //   if (LaneOperation[key] === name) {
          //     item.currentOperation = key
          //     break
          //   }
          // }
        } else {
          // 其他元素取消选中
          item.currentOperation = ''
        }
      }
      // 清空之前选择要创建的形状
      unref(scene).clearCreateConfi()
    })
  )
})

// 回显数据
function setData() {
  const fuseData = cloneDeep(toRaw(markStore.fuseData))
  if (fuseData && fuseData.length) {
    unref(scene).setData(fuseData)

    const result = groupBy(fuseData, (item) => {
      return item.type
    })
    fuseList.value = Object.keys(result).map((item) => {
      return {
        color: result[item][0].color,
        type: item,
        currentOperation: '',
        label: '',
      }
    })
  }
}

function changeFuse(e: { operation: string; index: number }) {
  unref(scene).drawShape({ ...fuseList.value[e.index], name: e.operation })
}
function addFuse() {
  const id = getDefaultId()
  fuseList.value.push({
    color: randomColor(),
    type: id,
    label: '',
    currentOperation: '',
  })
}

function delFuse(e: { fuse: FuseList; index: number }) {
  unref(scene).deleteLane(e.fuse.type)
  fuseList.value.splice(e.index, 1)
}
/**
 * 获取默认设置的id值
 * @return {string} id值
 */
function getDefaultId() {
  let maxId = 0
  // 找到最大值
  if (fuseList.value.length > 0) {
    maxId = Math.max.apply(
      null,
      fuseList.value.map((x) => x.type)
    )
  }
  // 返回最大值加1
  return maxId + 1 + ''
}

function handleGetData() {
  const data: any[] = unref(scene).getData()
  // unref(fuseList).forEach((item) => {
  //   data.forEach((a) => {
  //     if (a.type == item.type) {
  //       a.laneType = item.laneType
  //       a.lanePosition = item.lanePosition
  //       // 实线描述
  //       a.lineDescription = item.lineDescription
  //     }
  //   })
  // })
  return data
}
function handleHelp() {
  emits('openHelp')
}
defineExpose({
  handleGetData,
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
