<template>
  <div class="mark-container">
    <a-row type="flex" class="row-container">
      <a-col :span="6" class="left">
        <EventLeftPanel
          @changeArea="handleChangeArea"
          @addArea="handleAddArea"
          @editArea="handleEditArea"
          @delArea="handleDelArea"
          @getData="handleGetData"
          @closeMarkMode="closeMarkMode"
          @selectPropery="handleSelectPropery"
          ref="leftPanelRef"
        />
      </a-col>
      <a-col :span="18" class="right">
        <!-- <div class="operation">
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
        </div> -->
        <CommonOperations @changeImage="changeImage" @resetCanvas="resetCanvas" />
        <div class="canvasContainer" ref="handleRef"></div>
      </a-col>
    </a-row>
    <!-- <a-modal
      width="500px"
      v-model:visible="visible"
      :title="'新增检测区域'"
      @ok="handleOk"
      @cancel="handleCancel"
      okText="确认"
      cancelText="取消"
    >
      <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="检测类型" name="detectionType" v-bind="validateInfos.detectionType">
          <a-select
            v-model:value="formState.detectionType"
            :options="detectionTypeData"
            mode="multiple"
            :size="'default'"
            placeholder="请选择"
            style="width: 200px"
          >
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal> -->
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, toRaw, defineExpose, defineEmits, unref, watch, defineProps, reactive, onUnmounted } from 'vue'
// components
import { MarkCrossScene, SegmentationScene } from '@/thundersoft/ai-mark'
import OperationPanel from './OperationPanel.vue'
import EventLeftPanel from './EventLeftPanel.vue'
import CommonOperations from './CommonOperations.vue'
import { RedoOutlined, QuestionCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
// hooks
import { useMarkStore } from '@/store/modules/mark'
import { useMark } from '../hooks/useMark'
import useForm from 'ant-design-vue/lib/form/useForm'
// datas
import { detectionTypeData, EVENT_PREFIX } from '../config'
// utils
import { randomColor } from '@/utils'
import { buildShortUUID } from '@/utils/uuid'
import { find, remove, cloneDeep } from 'lodash'
import { AreaListItem, EventListItem } from '../type'
import { Subscription } from 'rxjs'

const props = defineProps({
  currentPanel: { type: String, default: 'area' },
  currentCameraId: { type: String, default: '' },
  isOpen: { type: Boolean, default: false },
  treeData: { type: Array, default: () => [] },
})

const emits = defineEmits(['openHelp'])

const areaList = ref<EventListItem[]>([])
const formState = reactive({
  detectionType: [],
})
const rules = reactive({
  detectionType: [{ required: true, message: '请选择检测类型', trigger: 'change' }],
})
const visible = ref()
const markStore = useMarkStore()
const { scene, handleRef, changeImage, showImageUrl, initImage, resetCanvas } = useMark()
const { validate, validateInfos, resetFields } = useForm(formState, rules)
const currentItemId = ref<string>('')
const leftPanelRef = ref()

const destroyEvent: (Subscription | undefined)[] = []
onMounted(async () => {
  scene.value = new SegmentationScene(handleRef.value, showImageUrl.value, [])
  unref(scene).bindEvent()
  unref(scene).toggleShowAndHide(props.isOpen)
  if (props.treeData.length > 0) {
    // 初始化左侧树的默认数据
    leftPanelRef.value.initTreeData(props.treeData)
  }
  // 加载默認图片
  // unref(scene).reload(showImageUrl.value, [])

  // if (markStore.cameraId) {
  //   initImage()
  //   await markStore.getAllData()
  // }

  setData()
  // 进入标注模式
  // unref(scene).openMarkMode({
  //   color: 'rgb(35, 98, 29)',
  // })
  destroyEvent.push(
    unref(scene).deleteShapeEvent.subscribe((shapeData) => {
      leftPanelRef.value.changeDataAfterSave(shapeData, 1)
    })
  )
  destroyEvent.push(
    unref(scene).saveShapeEvent.subscribe((shapeData) => {
      leftPanelRef.value.changeDataAfterSave(shapeData, 0)
    })
  )
  destroyEvent.push(
    // 注册点拖动结束事件响应方法
    unref(scene).pointDragEndEvent.subscribe((shapeData) => {
      leftPanelRef.value.changeDataAfterDrag(shapeData)
    })
  )
})

onUnmounted(() => {
  destroyEvent.forEach((d) => d?.unsubscribe())
})

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
watch(
  () => props.currentCameraId,
  (val) => {
    if (val) {
      setTimeout(async () => {
        initImage()
        await markStore.getAllData(val)
        setData()
      })
    }
  }
)

// 回显数据
function setData() {
  const reg = new RegExp(`^${EVENT_PREFIX}`)
  const tabName = props.currentPanel.replace(reg, '')
  // const initData = toRaw(markStore.eventData)?.find((item) => item.name === tabName)
  const initData = toRaw(markStore.eventData)[tabName]
  if (initData) {
    // const eventData = cloneDeep(initData.data)
    const eventData = initData.data
    if (eventData && eventData.length) {
      const stackTemp = []
      let areaData = []
      const treeDataMap = {}
      // 遍历接口返回的数据，生成树需要的数据
      for (let index = 0; index < eventData.length; index++) {
        const element = eventData[index]
        treeDataMap[element.id] = [index]
        // 如果有area属性，且不为空，则表示该节点是叶子节点，无需查找孩子节点
        if (element.area && element.area.length > 0) {
          areaData = [...areaData, ...element.area]
        } else if (element.children && element.children.length > 0) {
          // 有孩子节点，则遍历孩子节点及所有后代节点
          stackTemp.push(element)
          while (stackTemp.length > 0) {
            const item = stackTemp.pop()
            // 叶子节点
            if (item.area && item.area.length > 0) {
              areaData = [...areaData, ...item.area]
            } else {
              const childrenTemp = item.children || []
              // 遍历孩子节点
              for (let childIndex = 0; childIndex < childrenTemp.length; childIndex++) {
                const child = childrenTemp[childIndex]
                if (child.parentId && treeDataMap[child.parentId]) {
                  treeDataMap[child.id] = [...treeDataMap[child.parentId], childIndex]
                }
                stackTemp.push(child)
              }
            }
          }
        }
      }
      leftPanelRef.value.setTreeData(eventData, treeDataMap)
      if (areaData.length > 0) {
        // 深拷贝数据，防止setData()方法修改参数，导致上面eventData也被修改
        unref(scene).setData(cloneDeep(areaData))
        areaList.value = areaData.map((item) => {
          return {
            color: item.color,
            type: item.type,
            label: item.label,
            detectionType: item.detectionType,
          }
        })
      }
    }
  }
}

// function handleOk(val) {
//   // validate().then((val) => {
//   if (currentItemId.value) {
//     const result = find(unref(areaList), (a) => a.type == currentItemId.value)
//     result.detectionType = val.detectionType
//   } else {
//     areaList.value.push({
//       color: randomColor(),
//       type: buildShortUUID(),
//       label: '',
//       // detectionType: val.detectionType,
//     })
//   }

//   //   resetFields()
//   //   visible.value = false
//   // })
// }

function handleHelp() {
  emits('openHelp')
}

function handleCancel() {
  resetFields()
  visible.value = false
}

function handleAddArea(propertyItem) {
  currentItemId.value = ''
  areaList.value.push({
    color: randomColor(),
    type: buildShortUUID(),
    label: '',
    propertyId: propertyItem.id,
    // detectionType: val.detectionType,
  })
  unref(scene).drawDetectionArea(areaList.value[areaList.value.length - 1])
  // visible.value = true
}

function handleEditArea(item: AreaListItem) {
  visible.value = true
  currentItemId.value = item.type
  formState.detectionType = item.detectionType
}
/**
 * 删除标注形状
 * @param areaArr 待删除的形状数据数组
 */
function handleDelArea(areaArr) {
  // remove(unref(areaList), (a) => a.type == item.type)
  areaArr.forEach((area) => unref(scene).deleteDetectionArea(area.type))
}
/**
 * 选中形状发生变化时触发的方法
 * @param shapeArr 选中的形状数据数组
 */
function handleChangeArea(shapeArr) {
  const selectedShape = shapeArr.map((item) => ({ color: item.color, type: item.type, label: '' }))
  unref(scene).drawDetectionArea(selectedShape)
}

function closeMarkMode(propertyId) {
  // 如果绘制区域待绘制区域的propertyId属性与传递的propertyId参数一致，则关闭新对象标注模式
  if (unref(scene).curShapeCreateCofig && unref(scene).curShapeCreateCofig.propertyId === propertyId) {
    unref(scene).closeMarkShape()
  }
}

function handleSelectPropery(propertyId) {
  // 如果绘制区域待绘制区域的propertyId属性与选中的左侧树节点propertyId属性不一致，则关闭新对象标注模式
  if (unref(scene).curShapeCreateCofig && unref(scene).curShapeCreateCofig.propertyId !== propertyId) {
    unref(scene).closeMarkShape()
  }
}

// function callbackForSave(shapeData) {
//   leftPanelRef.value.changeDataAfterSave(shapeData, 0)
// }

function handleGetData() {
  // const data: any[] = unref(scene).getData()
  // unref(areaList).forEach((item) => {
  //   const result = find(data, (a) => a.type == item.type)
  //   if (result) {
  //     result.detectionType = item.detectionType
  //   }
  // })
  const data = leftPanelRef.value.getTreeData()
  // console.log('####data:', data)
  return data
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
