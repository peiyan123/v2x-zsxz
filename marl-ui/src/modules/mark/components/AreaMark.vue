<template>
  <div class="mark-container">
    <a-row type="flex" class="row-container">
      <a-col :span="6" class="left">
        <OperationPanel
          :type="'area'"
          @changeArea="handleChangeArea"
          @addArea="handleAddArea"
          @editArea="handleEditArea"
          @delArea="handleDelArea"
          :areaList="areaList"
          ref="operationPanelRef"
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
    <a-modal
      width="500px"
      v-model:visible="visible"
      :title="currentItemId ? '编辑检测区域' : '新增检测区域'"
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
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, toRaw, defineExpose, defineEmits, unref, watch, defineProps, reactive } from 'vue'
// components
import { SegmentationScene } from '@/thundersoft/ai-mark'
import OperationPanel from './OperationPanel.vue'
import CommonOperations from './CommonOperations.vue'
import { RedoOutlined, QuestionCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
// hooks
import { useMarkStore } from '@/store/modules/mark'
import { useMark } from '../hooks/useMark'
import useForm from 'ant-design-vue/lib/form/useForm'
// datas
import { detectionTypeData } from '../config'
// utils
import { randomColor } from '@/utils'
import { buildShortUUID } from '@/utils/uuid'
import { find, remove, cloneDeep } from 'lodash'
import { AreaListItem } from '../type'
import { Subscription } from 'rxjs/internal/Subscription'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  currentPanel: { type: String, default: 'area' },
  currentCameraId: { type: String, default: '' },
  // 是否已获取到初始数据
  finishGetData: { type: Boolean, default: false },
})

const emits = defineEmits(['openHelp'])

const areaList = ref<AreaListItem[]>([])
const formState = reactive({
  detectionType: [],
})
const rules = reactive({
  detectionType: [{ required: true, message: '请选择检测类型', trigger: 'change' }],
})
const visible = ref()
const operationPanelRef = ref()
const markStore = useMarkStore()
const { scene, handleRef, changeImage, showImageUrl, initImage, resetCanvas } = useMark()
const { validate, validateInfos, resetFields } = useForm(formState, rules)
const currentItemId = ref<string>('')
const destroyEvent: (Subscription | undefined)[] = []

onMounted(async () => {
  scene.value = new SegmentationScene(handleRef.value)
  unref(scene).bindEvent()
  unref(scene).toggleShowAndHide(props.isOpen)
  // 加载默認图片
  // unref(scene).reload(showImageUrl.value, [])

  // if (markStore.cameraId) {
  //   initImage()
  //   await markStore.getAllData()
  // }
  destroyEvent.push(
    unref(scene).selectShapeEvent.subscribe((shapeData) => {
      operationPanelRef.value.setSelectArea(shapeData.type, true)
    })
  )
  setData()
  // 进入标注模式
  // unref(scene).openMarkMode({
  //   color: 'rgb(35, 98, 29)',
  // })
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
        // await markStore.getAllData(val)
        // setData()
      })
    }
  }
)
watch(
  () => props.finishGetData,
  (val) => {
    // 如果已经获取到初始数据，则设置canvas数据
    if (val) {
      setData()
    }
  }
)

// 回显数据
function setData() {
  const areaData = cloneDeep(toRaw(markStore.areaData))
  if (areaData && areaData.length) {
    unref(scene).setData(areaData)
  }
  areaList.value = areaData.map((item) => {
    return {
      color: item.color,
      type: item.type,
      label: item.label,
      detectionType: item.detectionType,
    }
  })
}

function handleOk() {
  validate().then((val) => {
    if (currentItemId.value) {
      const result = find(unref(areaList), (a) => a.type == currentItemId.value)
      result.detectionType = val.detectionType
    } else {
      areaList.value.push({
        color: randomColor(),
        type: buildShortUUID(),
        label: '',
        detectionType: val.detectionType,
      })
    }

    resetFields()
    visible.value = false
  })
}

function handleHelp() {
  emits('openHelp')
}

function handleCancel() {
  resetFields()
  visible.value = false
}

function handleAddArea() {
  // currentItemId.value = ''
  // visible.value = true
  // 点击“新增检测区域”后，不用弹出选择检测类型的弹框，而是直接添加数据，因为检测类型目前在配置文件中没有作用，故去掉，同时也去掉“编辑”按钮
  areaList.value.push({
    color: randomColor(),
    type: buildShortUUID(),
    label: '',
  })
}

function handleEditArea(item: AreaListItem) {
  visible.value = true
  currentItemId.value = item.type
  formState.detectionType = item.detectionType
}

function handleDelArea(item: AreaListItem) {
  remove(unref(areaList), (a) => a.type == item.type)
  unref(scene).deleteDetectionArea(item.type)
}

function handleChangeArea(index: number) {
  unref(scene).drawDetectionArea(areaList.value[index])
}

function handleGetData() {
  const data: any[] = unref(scene).getData()
  unref(areaList).forEach((item) => {
    const result = find(data, (a) => a.type == item.type)
    if (result) {
      result.detectionType = item.detectionType
    }
  })
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
